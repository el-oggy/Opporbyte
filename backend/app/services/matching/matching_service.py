"""Persist eligible matches using the existing deterministic scoring engine."""
from datetime import datetime, timezone
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from app.models.job import Job, JobMatch
from app.models.profile import CareerProfile
from app.services.matching.heuristic_engine import HeuristicMatchingEngine


def conflict_insert(db, model):
    dialect = db.get_bind().dialect.name
    if dialect == "postgresql":
        return pg_insert(model)
    if dialect == "sqlite":
        return sqlite_insert(model)
    raise ValueError("Automation supports PostgreSQL or SQLite")


class MatchingService:
    def __init__(self):
        self.engine = HeuristicMatchingEngine()

    @staticmethod
    def profile_data(profile):
        return {name: getattr(profile, name) for name in (
            "profile_type", "target_job_titles", "technical_skills", "experience_level",
            "preferred_locations", "work_preference", "salary_expectation",
            "excluded_companies", "matching_threshold"
        )} | {"profile_id": profile.id}

    async def evaluate_jobs(self, db, profile, jobs):
        """Stage eligible match upserts in the caller's transaction; do not commit."""
        profile_data = self.profile_data(profile)
        matched_ids, excluded_ids = [], []
        for job in jobs:
            eligibility = self.engine.evaluate_eligibility(
                {"company": job.company, "work_mode": job.work_mode}, profile_data
            )
            if not eligibility.eligible:
                # Remove a stale ranking when preferences now exclude this employer.
                db.execute(delete(JobMatch).where(JobMatch.job_id == job.id, JobMatch.profile_id == profile.id))
                excluded_ids.append(job.id)
                continue
            result = await self.engine.evaluate_job_match(
                job_description=f"{job.title}\n{job.description}",
                profile_data=profile_data | {
                    "job_id": job.id, "company": job.company,
                    "work_mode": job.work_mode, "current_job_title": job.title,
                },
                verified_facts=[],
            )
            values = {
                "job_id": job.id, "profile_id": profile.id,
                **{name: getattr(result.breakdown, name) for name in (
                    "overall_score", "required_skills_score", "experience_score",
                    "alignment_score", "preferences_score"
                )},
                "classification": result.breakdown.classification.value,
                "match_evidence": {
                    "eligibility": result.eligibility.model_dump(),
                    "matched_skills": result.matched_skills,
                    "missing_critical_skills": result.missing_critical_skills,
                    "explanation": result.explanation,
                    "score_breakdown": result.breakdown.model_dump(),
                },
                "reviewed_at": datetime.now(timezone.utc),
            }
            stmt = conflict_insert(db, JobMatch).values(**values)
            db.execute(stmt.on_conflict_do_update(
                index_elements=["job_id", "profile_id"],
                set_={k: v for k, v in values.items() if k not in ("job_id", "profile_id")},
            ))
            matched_ids.append(job.id)
        return matched_ids, excluded_ids

    async def evaluate_profile_matches(self, db: Session, profile_id: str):
        profile = db.get(CareerProfile, profile_id)
        if not profile:
            raise ValueError(f"Profile '{profile_id}' not found.")
        await self.evaluate_jobs(db, profile, list(db.scalars(select(Job)).all()))
        db.commit()
        return self.get_matches_for_profile(db, profile_id)

    def get_matches_for_profile(self, db, profile_id, classification=None, min_score=None):
        stmt = select(JobMatch).where(JobMatch.profile_id == profile_id).order_by(JobMatch.overall_score.desc())
        if classification:
            stmt = stmt.where(JobMatch.classification == classification.lower())
        if min_score is not None:
            stmt = stmt.where(JobMatch.overall_score >= min_score)
        return list(db.scalars(stmt).all())


matching_service = MatchingService()
