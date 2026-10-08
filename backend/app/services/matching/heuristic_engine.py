"""Deterministic Heuristic AI Matching Engine implementing the 40/25/20/15 scoring weights."""

import logging
import re
from typing import Any, Dict, List, Set
from app.services.interfaces.matching import (
    AIMatchingEngine,
    EligibilityEvaluation,
    MatchBreakdown,
    MatchClassification,
    MatchEvaluationResult,
)

logger = logging.getLogger("opporbyte.matching.heuristic")


class HeuristicMatchingEngine(AIMatchingEngine):
    """Grounded heuristic matching engine calculating deterministic scores and evidence."""

    def _extract_words(self, text: str) -> Set[str]:
        return set(re.findall(r"\b[a-zA-Z0-9_\+#\.-]+\b", text.lower()))

    def _evaluate_eligibility(
        self,
        job_data: Dict[str, Any],
        profile_data: Dict[str, Any],
    ) -> EligibilityEvaluation:
        company = job_data.get("company", "").lower()
        excluded = [c.lower() for c in profile_data.get("excluded_companies", [])]
        requires_review = False
        review_reasons: List[str] = []

        # Check blacklisted companies
        if any(exc in company for exc in excluded if exc):
            return EligibilityEvaluation(
                eligible=False,
                requires_human_review=True,
                review_reasons=[f"Company '{job_data.get('company')}' is on your excluded companies blacklist."],
            )

        # Check location / work mode compatibility
        work_pref = [w.lower() for w in profile_data.get("work_preference", ["remote", "hybrid"])]
        job_mode = job_data.get("work_mode", "on-site").lower()

        if job_mode not in work_pref and "remote" not in work_pref:
            requires_review = True
            review_reasons.append(
                f"Work mode '{job_mode}' is not in your preferred modalities ({', '.join(work_pref)})."
            )

        return EligibilityEvaluation(
            eligible=True,
            requires_human_review=requires_review,
            review_reasons=review_reasons,
        )

    async def evaluate_job_match(
        self,
        job_description: str,
        profile_data: Dict[str, Any],
        verified_facts: List[Dict[str, Any]],
    ) -> MatchEvaluationResult:
        desc_lower = job_description.lower()
        title_lower = profile_data.get("current_job_title", "").lower() or ""

        eligibility = self._evaluate_eligibility(
            {"company": profile_data.get("company", ""), "work_mode": profile_data.get("work_mode", "hybrid")},
            profile_data,
        )

        # -------------------------------------------------------------
        # 1. Required Skills Score (Weight: 40%)
        # -------------------------------------------------------------
        target_skills = profile_data.get("technical_skills", [])
        # If user has not yet entered personal skills, evaluate based on profile target interests
        if not target_skills:
            target_skills = profile_data.get("target_job_titles", [])

        matched_skills = []
        missing_skills = []

        for skill in target_skills:
            pattern = rf"\b{re.escape(skill.lower())}\b"
            if re.search(pattern, desc_lower):
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

        if target_skills:
            skill_ratio = len(matched_skills) / len(target_skills)
            skills_score = min(100, int(skill_ratio * 120))  # Scale with generous overlap
        else:
            skills_score = 70

        # -------------------------------------------------------------
        # 2. Experience & Projects Score (Weight: 25%)
        # -------------------------------------------------------------
        exp_level = profile_data.get("experience_level", "Mid-level").lower()
        exp_score = 75

        # Check seniority keywords in description or title
        seniority_map = {
            "entry": ["entry", "junior", "associate", "graduate", "0-2 years", "1+ year"],
            "mid-level": ["mid", "intermediate", "2-5 years", "3+ years", "engineer ii"],
            "senior": ["senior", "sr", "lead", "5+ years", "staff", "principal"],
            "staff": ["staff", "principal", "architect", "lead", "8+ years"],
            "intern": ["intern", "internship", "student", "co-op"],
        }
        relevant_keywords = seniority_map.get(exp_level, [])
        if any(kw in desc_lower for kw in relevant_keywords):
            exp_score = 92
        elif any(kw in desc_lower for kw in ["senior", "lead", "staff"]) and exp_level in ["entry", "intern"]:
            exp_score = 50

        # -------------------------------------------------------------
        # 3. Career-Role Alignment Score (Weight: 20%)
        # -------------------------------------------------------------
        target_titles = profile_data.get("target_job_titles", [])
        matched_titles = [t for t in target_titles if re.search(rf"\b{re.escape(t.lower())}\b", desc_lower)]
        if matched_titles:
            alignment_score = min(100, 70 + (len(matched_titles) * 10))
        else:
            alignment_score = 65

        # -------------------------------------------------------------
        # 4. Job Preferences Score (Weight: 15%)
        # -------------------------------------------------------------
        pref_score = 85
        if not eligibility.eligible:
            pref_score = 20
        elif eligibility.requires_human_review:
            pref_score = 65

        # -------------------------------------------------------------
        # Composite Calculation: 40% + 25% + 20% + 15%
        # -------------------------------------------------------------
        overall = int(
            round(
                (0.40 * skills_score)
                + (0.25 * exp_score)
                + (0.20 * alignment_score)
                + (0.15 * pref_score)
            )
        )
        overall = max(0, min(100, overall))

        if overall >= 80:
            classification = MatchClassification.STRONG
        elif overall >= 60:
            classification = MatchClassification.POTENTIAL
        else:
            classification = MatchClassification.LOW

        breakdown = MatchBreakdown(
            required_skills_score=skills_score,
            experience_score=exp_score,
            alignment_score=alignment_score,
            preferences_score=pref_score,
            overall_score=overall,
            classification=classification,
        )

        rationale = (
            f"Evaluated with composite heuristic ({overall}%). "
            f"Skills alignment: {len(matched_skills)} matched competencies. "
            f"Seniority alignment calibrated for {exp_level.capitalize()} level."
        )

        return MatchEvaluationResult(
            job_id=profile_data.get("job_id", ""),
            profile_id=profile_data.get("profile_id", ""),
            eligibility=eligibility,
            breakdown=breakdown,
            matched_skills=matched_skills[:8],
            missing_critical_skills=missing_skills[:5],
            matching_projects=[],
            explanation=rationale,
            raw_ai_metadata={"model": "deterministic-heuristic-v1"},
        )

    async def batch_evaluate_jobs(
        self,
        job_ids: List[str],
        profile_id: str,
    ) -> List[MatchEvaluationResult]:
        return []
