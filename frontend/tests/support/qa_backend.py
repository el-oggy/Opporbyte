"""Start the existing backend against a fresh, local browser-QA database.

This fixture never opens the owner's database or contacts job providers. Run it
with the existing backend virtualenv; its only persistent output is under
output/playwright. The fictional credentials are exclusively for this fixture.
"""

import argparse
import hashlib
import os
from pathlib import Path
import secrets
import sys

ROOT = Path(__file__).resolve().parents[3]
QA_OUTPUT = ROOT / "output" / "playwright"
EMAIL = "frontend-fixture@example.com"
PASSWORD = "isolated-test-owner-password"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, required=True)
    parser.add_argument("--port", type=int, default=8011)
    parser.add_argument("--mock-sources", action="store_true", help="Enable deterministic Phase 5 public API fixtures only")
    args = parser.parse_args()
    database = args.database.resolve()
    if not database.is_relative_to(QA_OUTPUT.resolve()) or database.suffix != ".db":
        parser.error("The fixture database must be a .db file under output/playwright")
    if database.exists():
        parser.error("Use a new database filename; this fixture preserves existing files")
    database.parent.mkdir(parents=True, exist_ok=True)

    os.environ.update({
        "DATABASE_URL": "sqlite:///" + database.as_posix(),
        "FIRST_USER_EMAIL": EMAIL,
        "FIRST_USER_PASSWORD": PASSWORD,
        "SECRET_KEY": secrets.token_hex(32),
        "ENVIRONMENT": "frontend-browser-qa",
        "COOKIE_SECURE": "false",
    })
    sys.path.insert(0, str(ROOT / "backend"))
    from sqlalchemy import select
    import uvicorn
    from app.core.init_db import init_db
    from app.db.session import SessionLocal
    from app.main import app
    from app.models.job import Job, JobMatch
    from app.models.profile import CareerProfile

    if args.mock_sources:
        import asyncio
        from app.services.discovery import greenhouse, ashby, lever
        from app.services.discovery.public_api import ProviderFailure

        async def fixture_fetch(url):
            if "fixture-failure" in url:
                raise ProviderFailure("http_503", True)
            if "fixture-slow" in url:
                await asyncio.sleep(5)
            elif "fixture-board" not in url:
                raise ProviderFailure("fixture_source_not_configured")
            common = {"id": "fixture-discovery-1", "title": "Fixture Discovery Engineer", "location": "Remote"}
            if "greenhouse" in url:
                item = {**common, "location": {"name": "Remote"}, "content": "<p>Fictional source fixture. React TypeScript frontend engineer.</p>", "absolute_url": "https://example.com/fixture/discovery"}
                return {"jobs": [item, item, {"title": ""}]}
            if "ashby" in url:
                item = {**common, "descriptionHtml": "<p>Fictional source fixture. React TypeScript.</p>"}
                return {"jobs": [item, item, {"title": ""}]}
            item = {**common, "text": common["title"], "categories": {"location": "Remote"}, "descriptionPlain": "Fictional source fixture. React TypeScript."}
            return [item, item, {"text": ""}]

        greenhouse.fetch_json = ashby.fetch_json = lever.fetch_json = fixture_fetch

    with SessionLocal() as db:
        owner = init_db(db)
        profiles = db.scalars(select(CareerProfile).where(CareerProfile.user_id == owner.id)).all()
        definitions = [
            ("software", "Senior Frontend Engineer", "Fixture Interface Labs", "Remote", "remote", ["TypeScript", "React", "Accessibility"]),
            ("software", "Backend Systems Engineer", "Fixture Systems", "Bengaluru", "hybrid", ["Python", "SQL", "APIs"]),
            ("semiconductor", "RTL Design Engineer", "Fixture Silicon", "Bengaluru", "on-site", ["SystemVerilog", "RTL", "FPGA"]),
            ("semiconductor", "FPGA Verification Engineer", "Fixture Hardware", "Remote", "remote", ["SystemVerilog", "UVM", "Verification"]),
        ]
        for index, (kind, title, company, location, mode, skills) in enumerate(definitions):
            profile = next(p for p in profiles if p.profile_type == kind)
            job = Job(
                id=f"qa-job-{index + 1}",
                canonical_hash=hashlib.sha256(f"frontend-qa-{index}".encode()).hexdigest(),
                title=title,
                company=company,
                location=location,
                work_mode=mode,
                employment_type="Full-time",
                description=f"Fictional browser QA opportunity. Work with {', '.join(skills)}. This fixture does not represent a live vacancy.",
                url=f"https://example.com/qa/jobs/{index + 1}",
            )
            db.add(job)
            db.flush()
            scores = {"overall_score": 84 - index * 3, "required_skills_score": 85, "experience_score": 80, "alignment_score": 90, "preferences_score": 80}
            db.add(JobMatch(
                job_id=job.id, profile_id=profile.id, **scores,
                classification="strong" if scores["overall_score"] >= 80 else "potential",
                match_evidence={
                    "eligibility": {"eligible": True, "requires_human_review": True, "review_reasons": ["Fictional QA data; verify evidence before using an application."]},
                    "matched_skills": skills[:2],
                    "missing_critical_skills": skills[2:],
                    "explanation": "Seeded fictional match for existing API display and workflow tests.",
                    "score_breakdown": {**scores, "classification": "strong" if scores["overall_score"] >= 80 else "potential"},
                },
            ))
        db.commit()
    uvicorn.run(app, host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    main()
