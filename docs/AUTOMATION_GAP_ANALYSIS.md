# Phase 5 capability audit

Audit baseline: `design/full-frontend-redesign` at `6f984d8` (tested frontend code
`fdd713ba59276521e88a43396833498e52c35f64`). The worktree was clean before
`codex/phase-5-automation` was created from that revision. Main remains separate.
This audit describes the **pre-Phase-5 implementation**, not planned capabilities.
The existing 27 backend tests passed against an isolated SQLite database.

| Capability | Baseline status | Inspected evidence and boundary |
| --- | --- | --- |
| Greenhouse, Ashby, Lever public API adapters | PARTIAL | `backend/app/services/discovery/{greenhouse,ashby,lever}.py`: fixed public ATS endpoints and 10-second requests; errors become empty results; no retry policy or malformed-record isolation. |
| Normalization and deduplication | PARTIAL | `discovery_service.py`, `models/job.py`, `tests/test_discovery.py`: HTML cleaner, canonical SHA-256, database uniqueness. No in-batch flush with production `autoflush=False`, concurrent conflict handling, posting updates, or expiry reconciliation. Company inferred from board slug. |
| Source configuration | PARTIAL | `JobSource`: source identity, active flag and rate setting. Ingestion creates sources implicitly; rate setting unused. No explicit automation configuration or schedule. |
| Candidate career profiles | IMPLEMENTED | `models/profile.py`, `profile_service.py`, profile endpoints/tests: owner-scoped software/semiconductor preferences, uniqueness, independent tracks. |
| Hard eligibility | PARTIAL | `heuristic_engine.py`: excluded companies are ineligible; work-mode mismatch can require review. Matching still persists ineligible rows. Location, salary and visa fields do not establish enforced eligibility. |
| Ranking and evidence | IMPLEMENTED | `matching_service.py`, `heuristic_engine.py`, matching tests: deterministic 40/25/20/15 weighting, evidence, profile/job uniqueness. This is heuristic scoring, not a trained AI model or employment guarantee. |
| Candidate facts and verification | PARTIAL | `fact_service.py`, fact tests: owner-scoped CRUD; extracted facts require human verification. Legacy explicit `/facts/seed` creates fictional facts marked verified; do not use it for real candidate claims. |
| Resume tailoring | PARTIAL | `resume_service.py`, resume tests: selected bullets reference verified facts; no external AI provider. Fixed summary language can overstate background, and HTML export does not escape all candidate text. Requires a separate provenance/export hardening pass before production. |
| Application review/staging | IMPLEMENTED | `application_service.py`, `models/application.py`, application tests: `ready_for_review`, user/job uniqueness across profiles, owned resume checks on creation. Sync must never auto-stage or submit. |
| Provider-confirmed submission | MISSING | Application/outreach interfaces are contracts, not integrations. Status can be manually recorded as submitted; that is user-reported tracking, not a provider confirmation. Update transition/resume validation needs hardening before submission automation. |
| Background execution and persisted sync history | MISSING | `TaskRun` model and analytics readers exist; no source-sync execution writes tasks, queue, scheduler, cancellation, ownership or retry orchestration. |
| Analytics/activity | PARTIAL | `api/v1/analytics.py`, analytics test: persisted counts and task readers; baseline task queries are global, and no discovery tasks populate them. |
| Authentication/authorization | PARTIAL | `api/deps.py`, auth/profile/fact/resume/application tests: signed token, HTTP-only cookie, owned resources. Single-user bootstrap, development secret/password defaults, global catalog and telemetry; not a production multi-tenant design. |
| End-to-end sync → eligibility → ranked Discover → save | MISSING | Discovery and matching are separate calls. Discover saves through existing review staging, but board ingestion has no task history or integrated ranking. |
| Deterministic adapter/retry/recovery tests | MISSING | Existing discovery tests cover HTML, canonical hashing, seeds and job listing, not actual provider responses or failure/concurrency paths. |
| Live external integration qualification | BLOCKED | No employer boards were supplied for this phase. Automated verification will use mocked public API responses; live freshness, permission/terms and provider pagination require explicit operational qualification. |

## Preserved frontend verification limits

`docs/FRONTEND_QA_REPORT.md` records 18 frontend unit tests, 27 backend tests,
lint/type/build and browser passes across public and isolated authenticated flows.
Owner database, live job sources, physical devices/GPU performance, Safari/Firefox,
screen-reader/full WCAG and Lighthouse were not qualified. WebGL deprecation and
software-renderer warnings remain. Phase 5 must not imply these limits disappeared.

## Scope of this phase

Connect a configured public source to the existing profile/matcher/catalog and
review queue. Add durable sync control records and bounded manual execution.
Keep application and resume APIs intact; document their existing safety gaps.
No automatic submissions, fact seeding, credentials to providers, scraping,
recruiter contact, deployment or merge is part of this slice.

Post-implementation results and remaining gaps are recorded in
`docs/PHASE5_AUTOMATION.md` so this baseline stays auditable.
