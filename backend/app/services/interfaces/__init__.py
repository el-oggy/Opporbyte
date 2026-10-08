"""Export abstract future service interfaces."""

from app.services.interfaces.job_discovery import JobDiscoveryProvider, DiscoveredJobPayload
from app.services.interfaces.matching import (
    AIMatchingEngine,
    MatchBreakdown,
    MatchClassification,
    MatchEvaluationResult,
    EligibilityEvaluation,
)
from app.services.interfaces.resume import (
    ResumeGenerationEngine,
    TailoredResumePayload,
    TailoredResumeSection,
)
from app.services.interfaces.application import (
    ApplicationAutomationEngine,
    ApplicationPackage,
    ApplicationApprovalStatus,
)
from app.services.interfaces.outreach import (
    RecruiterOutreachEngine,
    RecruiterContact,
    OutreachEmailDraft,
)

__all__ = [
    "JobDiscoveryProvider",
    "DiscoveredJobPayload",
    "AIMatchingEngine",
    "MatchBreakdown",
    "MatchClassification",
    "MatchEvaluationResult",
    "EligibilityEvaluation",
    "ResumeGenerationEngine",
    "TailoredResumePayload",
    "TailoredResumeSection",
    "ApplicationAutomationEngine",
    "ApplicationPackage",
    "ApplicationApprovalStatus",
    "RecruiterOutreachEngine",
    "RecruiterContact",
    "OutreachEmailDraft",
]
