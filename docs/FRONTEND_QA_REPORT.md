# Opporbyte frontend verification and stabilization

**Status: PASS — complete and ready for local design review.** Tested on 11 October
2026. No push, pull request, merge, deployment, scraping, employer submission,
recruiter outreach, or new backend architecture was performed.

## Revision and preservation

- Branch: `design/full-frontend-redesign`.
- Exact tested frontend revision: `fdd713ba59276521e88a43396833498e52c35f64`.
- Starting clean redesign revision: `a2e6be891843055922ac1a3411a3a39f46397eb2`.
- Source checks and the build ran against the same frontend files committed in
  `fdd713b`; final production acceptance ran after that commit. The subsequent
  handoff commit adds documentation and captured evidence only.
- Local `main` and `origin/main` remain at
  `f951f278d05e60f3abe4e3f7fbf0d83ce231bc07`. The existing local redesign branch was
  retained. One worktree was found; attached artifacts and the read-only search
  for open repository pull requests returned none.
- **PASS:** backend source and root `README.md` have no changes relative to the
  starting revision. Existing work, lockfiles, credentials and owner data were
  preserved. Backend integration used new disposable databases under ignored
  `output/playwright`, never the owner's database.
- Three QA agents were attempted as requested, but their runs stopped at the
  account usage limit before completing browser audits. The lead executed the
  three workstreams and integration checks directly; their results below come
  from actual browser and test execution.

## Verified fixes

| Confirmed issue / refinement | Result | Status |
| --- | --- | --- |
| Escape did not close public mobile navigation | Escape closes it and returns focus to the trigger | PASS |
| Closed workspace navigation accepted offscreen focus; Escape did not close the open panel | Closed panel is inert and hidden; the open mobile panel contains Tab/Shift+Tab focus, blocks background interaction and scroll, and closes with Escape | PASS |
| Changing workspace pages reset Semiconductor selection to Software | Selection lives in the workspace layout and survives navigation in both the live workspace and preview | PASS |
| Visible hero had continuous idle motion without a user pause control | Pause freezes the actual WebGL frame and stops its loop; Resume restarts it. System reduced motion remains supported | PASS |
| Skip-link destinations needed explicit keyboard focus targets | Landing and workspace main elements receive focus after activating their skip links | PASS |

The profile selection is session layout state. A full reload or leaving the
workspace restores the initial Software selection; saved profile records remain
independent and unchanged. Career/resume data is not added to browser storage.

The approved palette and composition were retained. The real 3D hero still has
extruded geometry, a beveled orange core with a dark inner wall, curved resume
paper, dimensional job cards, studio lighting and reversible convergence.
Headlines and CTAs remain immediate DOM content. The existing closing scene's
grid, staged docking, heading clearance, and neutral text selection passed their
regressions; they were not redesigned again.

## Working experiences and evidence boundaries

| Experience | Status | Executed verification |
| --- | --- | --- |
| `/` — hero, endless tabs, career discovery, process, workspace showcase, resume comparison, control, closing, FAQ/footer | PASS | All nine categories, all process/showcase tabs, six FAQ items, local save demonstrations, CTA destinations, keyboard controls, choreography and screenshots |
| `/get-started`, `/onboarding` redirect | DEMO ONLY | All four steps at all five widths, Next/Back, target-role validation, negative compensation rejection, unsupported file rejection, manual entry and review. No upload or public account is created |
| `/login` | PASS | Invalid credentials rejected; real fixture owner login preserves a protected destination and sets the existing HTTP-only cookie; logout clears it |
| `/preview` and seven preview subpages | DEMO ONLY | Responsive routes and usable fictional controls. Public interaction and route passes issued zero private API requests |
| `/app` overview | PASS | Recorded fixture metrics, recommendations, activity and protected rendering |
| `/app/discover` | PASS | Existing jobs/matches load; filters and clear action work; selected Semiconductor view displays its recorded 78% match |
| `/app/jobs/qa-job-1` | PASS | Existing job details and evidence render; application staging calls the existing API |
| `/app/profiles` | PASS | Software saves, independent Semiconductor data, selection across navigation, rejected-save draft retention and unchanged persisted data |
| `/app/resumes` | PASS | Candidate fact creation, human verification, tailoring from verified facts, review, text download, and accessible narrow drawer |
| `/app/applications` | PASS | Staging and human package approval through the existing API; no employer submission |
| `/app/analytics` | PASS | Existing recorded data loads |
| `/app/settings` | PASS | Real fixture API/database check; device density and reduced-motion settings |
| Seven legacy routes | PASS | Correct HTTP 307 destinations for onboarding/discover/profiles/resumes/applications/analytics/settings |
| Live external job-board discovery; manual employer-site submission; HTML export download; extraction/delete/reject actions | NOT TESTED | Existing capabilities retained, but these actions were not exercised by this sprint's browser acceptance. No external provider requests were made |
| Public registration, broader persisted careers, automatic applications, alerts and recruiter outreach | DEMO ONLY | Planned or unavailable features remain explicitly labeled; no success is fabricated |

## Executed build and test results

Browser: installed Chromium 1234 using SwiftShader for WebGL. This is desktop
viewport emulation. Integration ran on Next dev `3002` with the unchanged backend
at `8011`; production acceptance ran on Next start `3001`, built with the normal
backend rewrite to `http://127.0.0.1:8000`.

| Check | Status | Actual result |
| --- | --- | --- |
| Lockfile installation | PASS | `npm ci --no-audit --no-fund` completed. The first offline attempt lacked one cached package; the normal restore completed successfully |
| Backend dependency consistency | PASS | Existing virtualenv `python -m pip check`: no broken requirements |
| ESLint | PASS | `npm run lint`, no lint errors/warnings |
| TypeScript | PASS | `npm run typecheck`, no errors |
| Frontend regression tests | PASS | `npm test`: **18 passed**, 0 failed |
| Existing backend regressions | PASS | **27 passed**, 0 failed, 1 dependency deprecation warning, isolated in-memory databases |
| Optimized production build | PASS | `npm run build`: compiled successfully, **27 static pages** generated plus dynamic job routes |
| Critical journeys and stabilization smoke | PASS | **40 checks**, actual fixture API writes and reads |
| Continuous motion/FAQ/closing regressions | PASS | **66 checks**, including five widths, intermediate/reverse poses, exact aligned edges, heading clearance, neutral selection and reduced motion |
| Production public controls | PASS | **39 checks**, zero private API requests and runtime errors |
| Error recovery and focused accessibility | PASS | **11 checks**, failed PUT/GET, honest messages, retained draft, retry/session recovery, skip focus and measured contrast |
| Production 3D scene | PASS | **8 checks**, organized/reverse motion, rendered pointer response, offscreen pause, reduced-motion identical frames, startup fallback and live context loss |
| Dev route/width matrix | PASS | **95 observations**: 11 public/demo + 8 real API-connected routes × 5 widths, no overflow, clipped page headings, failed assets or runtime errors |
| Production route/width matrix | PASS | **55 observations**: 11 public/demo routes × 5 widths, no overflow or clipped page headings, zero private API requests/runtime errors |
| Production onboarding | PASS | **20 step/width observations**, 5 Back-state checks, no overflow or clipped page headings |
| Production legacy redirects | PASS | **7/7** expected HTTP 307 destinations |
| Warning-free dependency console | FAIL | Non-blocking `THREE.Clock` deprecation originates in installed React Three Fiber. SwiftShader also reports shader precision warnings. No application runtime failure was observed; vendor code was not patched and warnings were not suppressed |

Counts describe separate suites and overlap in coverage; they are not a count of
unique product features. Machine-readable browser results are saved in
[QA_RESULTS.json](frontend-review/stabilization/QA_RESULTS.json).

## Responsive, accessibility and performance findings

| Width | Live routes | Public/demo production routes | Four wizard steps | Result |
| --- | --- | --- | --- | --- |
| 1440 | 8 | 11 | 4 | PASS |
| 1280 | 8 | 11 | 4 | PASS |
| 768 | 8 | 11 | 4 | PASS |
| 390 | 8 | 11 | 4 | PASS |
| 320 | 8 | 11 | 4 | PASS |

- **PASS:** keyboard menu containment/Escape/focus return, native drawer Escape,
  both skip links, timeline arrow keys, form labels and visible validation/error
  messages. The 320px resume drawer had no horizontal overflow, could scroll to
  its controls, and a wheel at its lower edge did not move the background.
- **PASS:** measured primary ink/cream contrast **12.89:1**, CTA text/orange
  **5.54:1**, and muted note/cream **4.72:1**. This checks these selected controls
  and copy, not a full WCAG certification or every possible text combination.
- **PASS:** offscreen hero loop suspension, matching frozen WebGL frames under
  system reduced motion, user pause/resume and usable startup/context-loss
  fallback CTAs. Mobile has independent composition and no desktop pin.
- **PASS:** public/demo testing observed zero private API requests; route matrix
  observed no failed CSS/JS/font/image assets. Screenshots were visually inspected
  for the hero, organized/fallback/mobile scenes, closing alignment, discovery,
  onboarding and drawer.
- **NOT TESTED:** physical-device FPS, battery/GPU usage, touch gesture behavior
  on real hardware, Safari/Firefox, screen-reader testing and a complete WCAG or
  Lighthouse/Core Web Vitals audit. SwiftShader results do not establish native
  mobile GPU performance.

Frontend/immersive-3D and browser-testing skills guided the pass. The pause
control follows the continuous-motion guidance in the
[Vercel web interface guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## Screenshots and review

Open [the stabilization gallery](frontend-review/stabilization/GALLERY.md) for
desktop/mobile hero, organized scene, reduced motion, WebGL fallback, closing,
onboarding, real API-connected discovery/resumes, and the 320px drawer. All
workspace screenshots contain fictional fixture data.

The local optimized preview is **http://127.0.0.1:3001/**. The public demo is
**http://127.0.0.1:3001/preview**. Owner sign-in requires the user's existing
backend and credentials; fixture accounts are not installed into that service.

## Run locally

From `C:\Users\adars\OneDrive\Desktop\Opporbyte\frontend`:

```powershell
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --port 3001
```

The default rewrite is the existing API on port `8000`. Start that backend using
its established configuration for owner sign-in; public pages and `/preview`
do not require it. The review server is already running, so start commands are
only needed after it is stopped. For development use `npm run dev -- --port 3002`.

To repeat isolated integration QA, in one terminal at the repository root:

```powershell
$qaDatabase = Join-Path $PWD ("output/playwright/qa-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + ".db")
backend/.venv/Scripts/python.exe frontend/tests/support/qa_backend.py --database $qaDatabase --port 8011
```

The harness refuses existing databases or paths outside `output/playwright`,
creates fictional jobs/matches and the existing two profiles, and contacts no
external job boards. Use a **fresh fixture database for each smoke run**. In a
second terminal under `frontend`, set `$env:OPPORBYTE_API_URL` to
`http://127.0.0.1:8011` before running Next dev on `3002`. Do not build the owner
review preview with that fixture URL.

The browser suites are editable `async (page) => …` Playwright CLI drivers under
`frontend/tests/stabilization-*.txt`. From the root, the installed CLI can open
the local QA URL with `output/playwright/redesign.config.json`, then run each
driver using `run-code --filename <path>` in that session. Example on this host:

```powershell
$qaCli = "C:/Users/adars/AppData/Local/npm-cache/_npx/31e32ef8478fbf80/node_modules/@playwright/cli/playwright-cli.js"
node $qaCli -s=opporbyte-qa open http://127.0.0.1:3002/ --config output/playwright/redesign.config.json
node $qaCli -s=opporbyte-qa run-code --filename frontend/tests/stabilization-smoke.txt
node $qaCli -s=opporbyte-qa run-code --filename frontend/tests/stabilization-responsive.txt
node $qaCli -s=opporbyte-qa run-code --filename frontend/tests/stabilization-errors.txt
```

CLI/browser paths are host-specific. The public/release drivers can run in a
separate session at production `3001`; mutation-capable QA drivers verify the
backend's `frontend-browser-qa` environment before proceeding. Run scripts
sequentially within a browser session. Raw runs, logs and disposable databases
are ignored under `output/playwright`.

Backend regression reproduction uses the existing virtualenv and sets
`DATABASE_URL=sqlite:///:memory:` and fictional `FIRST_USER_EMAIL`,
`FIRST_USER_PASSWORD`, and `SECRET_KEY` in that test terminal before `python -m
pytest -q`. This keeps application startup away from the owner's database.

## Review and merge readiness

**PASS:** frontend stabilization is complete for local review with preserved
backend compatibility and the executed evidence above. **NOT TESTED:** external
deployment, actual owner records and physical-device/cross-browser performance.
Review the design and these limitations before authorizing a merge or release.
The branch and commits remain local; GitHub `main` has not been changed. No
further automation or backend work is started by this handoff.
