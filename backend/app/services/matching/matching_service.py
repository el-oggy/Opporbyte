"""Master Matching Service persisting evaluated matches and evidence."""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job, JobMatch
from app.models.profile import CareerProfile
from app.services.matching.heuristic_engine import HeuristicMatchingEngine

logger = logging.getLogger("opporbyte.matching.service")


class MatchingService:
    def __init__(self):
        self.engine = HeuristicMatchingEngine()

    async def evaluate_profile_matches(
        self,
        db: Session,
        profile_id: str,
    ) -> List[JobMatch]:
        """Evaluate all discovered jobs against a career profile and persist matches."""
        profile = db.scalar(select(CareerProfile).where(CareerProfile.id == profile_id))
        if not profile:
            raise ValueError(f"Profile '{profile_id}' not found.")

        jobs = db.scalars(select(Job)).all()
        created_or_updated: List[JobMatch] = []

        profile_data = {
            "profile_id": profile.id,
            "profile_type": profile.profile_type,
            "target_job_titles": profile.target_job_titles,
            "technical_skills": profile.technical_skills,
            "experience_level": profile.experience_level,
            "preferred_locations": profile.preferred_locations,
            "work_preference": profile.work_preference,
            "salary_expectation": profile.salary_expectation,
            "excluded_companies": profile.excluded_companies,
            "matching_threshold": profile.matching_threshold,
        }

        for job in jobs:
            job_eval_data = {
                **profile_data,
                "job_id": job.id,
                "company": job.company,
                "work_mode": job.work_mode,
                "current_job_title": job.title,
            }

            result = await self.engine.evaluate_job_match(
                job_description=f"{job.title}\n{job.description}",
                profile_data=job_eval_data,
                verified_facts=[],
            )

            # Check if match already exists
            existing_match = db.scalar(
                select(JobMatch).where(
                    JobMatch.job_id == job.id,
                    JobMatch.profile_id == profile.id,
                )
            )

            evidence_dict = {
                "eligibility": result.eligibility.model_dump(),
                "matched_skills": result.matched_skills,
                "missing_critical_skills": result.missing_critical_skills,
                "explanation": result.explanation,
                "score_breakdown": result.breakdown.model_dump(),
            }

            if existing_match:
                existing_match.overall_score = result.breakdown.overall_score
                existing_match.required_skills_score = result.breakdown.required_skills_score
                existing_match.experience_score = result.breakdown.experience_score
                existing_match.alignment_score = result.breakdown.alignment_score
                existing_match.preferences_score = result.breakdown.preferences_score
                existing_match.classification = result.breakdown.classification.value
                existing_match.match_evidence = evidence_dict
                existing_match.reviewed_at = datetime.now(timezone.utc)
                db.add(existing_match)
                created_or_updated.append(existing_match)
            else:
                new_match = JobMatch(
                    job_id=job.id,
                    profile_id=profile.id,
                    overall_score=result.breakdown.overall_score,
                    required_skills_score=result.breakdown.required_skills_score,
                    experience_score=result.breakdown.experience_score,
                    alignment_score=result.breakdown.alignment_score,
                    preferences_score=result.breakdown.preferences_score,
                    classification=result.breakdown.classification.value,
                    match_evidence=evidence_dict,
                    reviewed_at=datetime.now(timezone.utc),
                )
                db.add(new_match)
                created_or_updated.append(new_match)

        db.commit()
        for m in created_or_updated:
            db.refresh(m)

        return created_or_updated

    def get_matches_for_profile(
        self,
        db: Session,
        profile_id: str,
        classification: Optional[str] = None,
        min_score: Optional[int] = None,
    ) -> List[JobMatch]:
        """Fetch ranked matches for a profile sorted by overall score descending."""
        stmt = (
            select(JobMatch)
            .where(JobMatch.profile_id == profile_id)
            .order_by(JobMatch.overall_score.desc())
        )
        if classification:
            stmt = stmt.where(JobMatch.classification == classification.lower())
        if min_score is not None:
            stmt = stmt.where(JobMatch.overall_score >= min_score)

        return list(db.scalars(stmt).all())


matching_service = MatchingService()
