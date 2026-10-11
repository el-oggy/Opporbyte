# Opporbyte complete frontend redesign handoff

The public website, four-step onboarding preview, owner sign-in and all existing
workspace areas have been redesigned on local branch
`design/full-frontend-redesign`. Backend source, migrations, models and the root
README are preserved. Nothing has been pushed, published or changed on GitHub.

## Experience and routes

| Area | Completed route or sections |
| --- | --- |
| Landing | `/`: immersive hero, endless tabs, every career, four-stage process, workspace demonstration, resume comparison, human review, cinematic finale, FAQ/footer |
| Onboarding | `/get-started`: career interests, preferences, candidate profile selection/manual entry, review |
| Authentication | `/login`: existing owner credentials and server-managed HTTP-only cookie |
| Dashboard | `/app`: profile selection, recorded metrics, recommendations, activity and quick actions |
| Discovery | `/app/discover`: search, location/work filters, cards/list view, supported employer-board discovery, review queue actions |
| Job details | `/app/jobs/[id]`: description, match evidence, skill gaps, evaluation/tailoring and validated official link |
| Profiles | `/app/profiles`: independent real Software/Semiconductor configurations, projects and preferences; additional career fields marked planned |
| Resume Studio | `/app/resumes`: fact creation/extraction/verification, role-specific versions, review, text/HTML exports |
| Application Queue | `/app/applications`: staging, filters, resume association, notes, approve/reject, manual submission recording and deletion confirmation |
| Analytics | `/app/analytics`: backend counts, distributions, pipeline and activity with honest empty states |
| Settings | `/app/settings`: account/service information, device appearance/accessibility preferences and explicit unavailable integrations/notifications |
| Review demos | `/preview` and the same subpages: labeled fictional examples, in-memory actions, no private API requests |
| Existing links | `/onboarding` → `/get-started`; `/discover`, `/profiles`, `/resumes`, `/applications`, `/analytics`, `/settings` → their protected `/app` equivalents |

## Hero and design system

The former autoplay film is replaced as the primary hero by dynamically loaded
React Three Fiber/Three.js. Original geometry includes an extruded, beveled orange
ceramic O with dark inner-wall material, layered curved paper, thick job cards,
status objects, restrained connections and a dimensional workspace board.
Desktop uses a short 0.6-viewport sticky convergence sequence; scrolling backward
reverses the poses. Mobile uses a smaller, separate three-object composition
without pinning. Text, navigation and CTAs remain DOM elements.

Reduced motion freezes a deliberate three-quarter view and removes the pin.
Offscreen/hidden scenes stop rendering; DPR is capped. Both WebGL startup failure
and live context loss retain a lightweight fallback and usable controls. Existing
film assets and editable source remain preserved for optional future use.

Shared palette, typography, controls, cards, badges, fields, tabs, native modal
drawers, empty states and focus rules are centralized. The former broad CSS-loader
rule now excludes CSS modules so scoped styles keep their exports correctly.
The missing legacy API client was reconstructed directly from existing backend
routes. Match reads pass `min_score=0` to request existing records without the
backend's implicit empty-list evaluation path; evaluation remains an explicit action.

## Specialist contributions

Four actual workers contributed, within non-overlapping component directories:
Agent A (`hero3d`) built scene/lighting/poses/fallbacks; Agent B (`marketing`)
built all nine sections/navigation/demos; Agent C (`workspace`) rebuilt the typed
API adapter and all workspace screens/actions; Agent D (`onboarding`) built the
wizard and owner entry. A/B/C ran concurrently, and D used a freed worker slot.
The lead built shared infrastructure, routing/session protection/proxy, integrated
the work and performed final fixes and browser verification.

## Validation evidence

Baseline before implementation: lint, TypeScript, seven pose tests and production
build passed. Existing backend regressions: **27 passed**, using an isolated
in-memory database and test-only owner values. One dependency deprecation warning
was reported; no backend source change was needed.

Current frontend regressions: **18 passed**, covering reversible poses, mobile
independence, cookie requests, API failures, safe sign-in destinations and
frame-rate-independent scroll damping.
Final ESLint and TypeScript checks passed without errors or warnings. The
optimized production build passed, generating 27 pages plus dynamic job routes.
Desktop captures inspected for all ten onboarding/demo routes and all eight
below-the-fold landing sections. Public/demo navigation issued **zero** private
API requests. Four additional width matrices (1280, 768, 390, 320) covered 11
routes each: **44 checks, zero horizontal-overflow failures**. Desktop 1440 was
also inspected. This is desktop Chromium viewport emulation, not physical-device QA.

Functional browser checks: **23 passed** for career switching, keyboard timeline,
human review, wizard validation/file rejection/summary, private-route gating,
invalid credentials, HTTP-only cookie login, real backend jobs, independent
profiles, candidate facts/verification, tailoring/text export, Escape drawer close,
application staging/approval, analytics and logout. Real API actions used a
separate QA database, not the owner's private data; no external scraping,
employer application or recruiter message was sent.

Scene browser checks: **8 passed** for visible organized state, reverse progress,
rendered pointer response, offscreen pausing, live context loss, reduced-motion
pin removal, identical frozen WebGL frames and mobile startup fallback.
Editable acceptance scripts are under `frontend/tests/redesign-*.txt`.
Screenshot evidence is saved under `docs/frontend-review/`; open
`docs/frontend-review/GALLERY.md` for the review index. The final production
preview returned HTTP 200, all seven legacy routes returned the expected HTTP
307 redirects, and the ten onboarding/demo production captures reported zero
JavaScript runtime errors or private API requests.

The subsequent motion refinement also passed **34 focused production-browser
checks** and repeated all eight scene checks. See
`docs/FRONTEND_MOTION_REFINEMENT.md` for the selection fix, continuous reversible
card choreography, corrected closing composition, replay behavior and evidence.

## Product limits

Broader careers and onboarding are ephemeral previews. Real persistence supports
the existing owner's Software and Semiconductor profiles. Resume file selection
does not read file contents, upload, parse or store files. Text extraction within
the authenticated Resume Studio is the existing supported API. No public signup,
automatic employer submission, recruiter outreach, unsupported PDF export or new
integration is presented as working. Template selection changes the browser
review layout; existing export formats remain determined by the backend.

Live external employer-board discovery was not exercised in QA. Tests establish
the unchanged backend's local contracts, not external provider availability,
production deployment, GPU performance on physical phones or full WCAG certification.
The scene dependencies emit a Three.Clock library deprecation warning; it does
not prevent rendering. The final private workspace needs the existing backend and
configured owner account. Public/demo review works independently.

## Local run instructions

From `C:\Users\adars\OneDrive\Desktop\Opporbyte\frontend`:

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

For production preview, use `npm run build` then
`npm run start -- --hostname 127.0.0.1 --port 3001`.
Open `http://127.0.0.1:3001/`, `/get-started` or `/preview`.

For private features, run the existing FastAPI backend from the backend folder
with its configured owner account/database. The frontend forwards `/api/v1` to
`http://127.0.0.1:8000` by default. Set `OPPORBYTE_API_URL` before starting/building
the frontend if your existing backend has another origin. The same-origin proxy
preserves backend cookie authentication; no token is stored in browser storage.

```powershell
cd C:\Users\adars\OneDrive\Desktop\Opporbyte\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Do not use the isolated QA owner's credentials as a real account. That test
service is stopped after verification. No PR was created because publishing and
GitHub changes remain subject to the user's later review and authorization.
