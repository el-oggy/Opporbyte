"""Application Lifecycle and Human-in-the-Loop Staging Pipeline Service.

Enforces cross-profile deduplication invariants:
A candidate can never submit or stage duplicate applications for the same canonical
job, regardless of whether it matches Semiconductor or Software tracks.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.application import Application
from app.models.job import Job
from app.models.profile import CareerProfile
from app.models.resume import ResumeVersion
from app.schemas.application import ApplicationCreate, ApplicationUpdate

logger = logging.getLogger("opporbyte.applications")


class ApplicationService:
    @staticmethod
    def create_application(
        db: Session,
        user_id: str,
        data: ApplicationCreate,
    ) -> Application:
        """Stage a new application package with cross-profile deduplication enforcement."""
        # 1. Enforce cross-profile deduplication invariant
        existing = db.scalar(
            select(Application)
            .options(joinedload(Application.profile), joinedload(Application.job))
            .where(
                Application.user_id == user_id,
                Application.job_id == data.job_id,
            )
        )
        if existing:
            profile_name = existing.profile.profile_type.capitalize() if existing.profile else "Unknown"
            raise ValueError(
                f"Cross-profile deduplication prevented: An application for this job already exists "
                f"under the {profile_name} track (Status: {existing.status.upper()}). "
                f"Duplicate submissions to the same posting across different career tracks are forbidden."
            )

        # 2. Validate Profile
        profile = db.scalar(
            select(CareerProfile).where(
                CareerProfile.user_id == user_id,
                CareerProfile.profile_type == data.profile_type.lower(),
            )
        )
        if not profile:
            raise ValueError(f"Profile '{data.profile_type}' not found for user.")

        # 3. Validate Job
        job = db.scalar(select(Job).where(Job.id == data.job_id))
        if not job:
            raise ValueError(f"Job '{data.job_id}' not found.")

        # 4. Validate Resume Version if provided
        if data.resume_version_id:
            resume = db.scalar(
                select(ResumeVersion).where(
                    ResumeVersion.id == data.resume_version_id,
                    ResumeVersion.profile_id == profile.id,
                )
            )
            if not resume:
                raise ValueError("Specified resume version does not belong to this profile.")

        # 5. Create Application
        application = Application(
            user_id=user_id,
            job_id=job.id,
            profile_id=profile.id,
            resume_version_id=data.resume_version_id,
            status="ready_for_review",  # Human review queue
            submission_method=data.submission_method,
            notes=data.notes,
        )
        db.add(application)
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def get_application(db: Session, user_id: str, application_id: str) -> Optional[Application]:
        """Fetch single application with relationships loaded."""
        return db.scalar(
            select(Application)
            .options(
                joinedload(Application.job),
                joinedload(Application.profile),
                joinedload(Application.resume_version),
            )
            .where(
                Application.id == application_id,
                Application.user_id == user_id,
            )
        )

    @staticmethod
    def list_applications(
        db: Session,
        user_id: str,
        profile_type: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Application]:
        """List application staging queue for a user."""
        stmt = (
            select(Application)
            .options(
                joinedload(Application.job),
                joinedload(Application.profile),
                joinedload(Application.resume_version),
            )
            .where(Application.user_id == user_id)
            .order_by(Application.created_at.desc())
        )
        if profile_type:
            stmt = stmt.join(CareerProfile, Application.profile_id == CareerProfile.id).where(
                CareerProfile.profile_type == profile_type.lower()
            )
        if status:
            stmt = stmt.where(Application.status == status.lower())

        return list(db.scalars(stmt).all())

    @staticmethod
    def update_application(
        db: Session,
        user_id: str,
        application_id: str,
        data: ApplicationUpdate,
    ) -> Optional[Application]:
        """Update status, notes, or resume of staged application."""
        app = db.scalar(
            select(Application).where(
                Application.id == application_id,
                Application.user_id == user_id,
            )
        )
        if not app:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        if "status" in update_dict and update_dict["status"]:
            new_status = update_dict["status"].lower()
            app.status = new_status
            if new_status == "submitted" and not app.submitted_at:
                app.submitted_at = datetime.now(timezone.utc)

        if "submission_method" in update_dict and update_dict["submission_method"]:
            app.submission_method = update_dict["submission_method"]

        if "notes" in update_dict:
            app.notes = update_dict["notes"]

        if "resume_version_id" in update_dict:
            app.resume_version_id = update_dict["resume_version_id"]

        db.add(app)
        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def delete_application(db: Session, user_id: str, application_id: str) -> bool:
        """Remove an application from tracking."""
        app = db.scalar(
            select(Application).where(
                Application.id == application_id,
                Application.user_id == user_id,
            )
        )
        if not app:
            return False
        db.delete(app)
        db.commit()
        return True

    @staticmethod
    def get_pipeline_metrics(db: Session, user_id: str) -> Dict[str, int]:
        """Aggregate counts across stages for metrics cards."""
        rows = db.execute(
            select(Application.status, func.count(Application.id))
            .where(Application.user_id == user_id)
            .group_by(Application.status)
        ).all()
        counts = {
            "draft": 0,
            "ready_for_review": 0,
            "approved": 0,
            "submitted": 0,
            "interviewing": 0,
            "offer": 0,
            "rejected": 0,
            "total": 0,
        }
        for status_val, count in rows:
            if status_val in counts:
                counts[status_val] = count
            counts["total"] += count
        return counts


application_service = ApplicationService()
