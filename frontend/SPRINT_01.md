# Opporbyte — Frontend Sprint 01

Completed locally on `feat/frontend-sprint-01`. No push, pull request, GitHub main change, or publishing action was performed. The root README and backend are unchanged.

## Open locally

The verified production preview is currently served at **http://127.0.0.1:3000**. Open `/onboarding` to explore the explicitly labeled frontend preview.

To start development from a fresh checkout (Node.js 22.18+ or 24 recommended):

```powershell
cd "C:\Users\adars\OneDrive\Desktop\Opporbyte\frontend"
npm ci
npm run dev
```

For production, stop an existing server on port 3000 before starting:

```powershell
npm run build
npm run start -- --hostname 127.0.0.1
```

No backend process, environment file, credentials, or database is required for these prototype routes.

## What was delivered

- Milky cream editorial landing page with the approved headline, CTA copy, colors, locally hosted Space Grotesk/Inter, and responsive navigation.
- Real React Three Fiber / Three.js scene: ceramic orange sculptural O, dark inner ring and cyan detail, modeled beveled job/resume/status/match objects, studio reflections and connection paths. All content and companies are fictional.
- GSAP ScrollTrigger progress gathers independent cards through connection/alignment into a workspace. Desktop pin spans 850 scroll pixels; tablet and mobile have ordinary scrolling. Pointer responses ease toward their target.
- Smaller three-card mobile composition below the headline/CTAs, no horizontal overflow, accessible menu and focus return on Escape.
- Frozen reduced-motion scene, static HTML/CSS visual during initialization and when WebGL is unavailable or lost, and offscreen render suspension. Copy and navigation never depend on WebGL.
- Only the beginning of “Goodbye, endless tabs.” with discovery, resume preparation and application organization previews.
- `/onboarding` offers field/role filtering and saving fictional examples entirely in memory. It collects no credentials, resumes or contact information. It explicitly explains its limitations and reset behavior.

## Files created or changed

| Files | Purpose |
| --- | --- |
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/icon.svg` | Public page shell, landing route, responsive palette/type/layout, brand icon |
| `app/onboarding/page.tsx` | Frontend preview route |
| `components/landing/Brand.tsx`, `Navigation.tsx`, `Hero.tsx`, `WorkspacePreview.tsx`, `OnboardingPreview.tsx`, `useMediaQuery.ts` | Brand, accessible navigation, hero/scroll coordination, secondary preview, demo controls and reactive motion/media preferences |
| `components/scene/CoreScene.tsx`, `SceneHost.tsx`, `StaticScene.tsx`, `card-textures.ts` | Geometry/rendering, dynamic scene/error boundary/lifecycle, static fallback and procedural card/studio textures |
| `lib/scene-layout.ts` | Stateless reversible scene interpolation |
| `tests/scene-layout.test.mjs`, `tests/browser-acceptance.txt` | Scroll pose tests and repeatable browser acceptance script |
| `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, root `.gitignore` | Necessary dependencies/scripts/configuration and deliberate legacy isolation |
| `legacy/` | Original frontend app, components, hooks and types retained, with an explanation of the missing original API client |
| `../docs/superpowers/`, `../docs/frontend-sprint-01/` | Design/plan, screenshots and machine-readable browser evidence |

The original frontend fails a fresh production build because `@/lib/api` is missing from tracked files and repository history. Rather than fabricate an API client or connect the sprint to an incomplete backend, the old source is preserved under `legacy/`, outside active routing, lint and type checking. All 20 original source files match the baseline after Git line-ending normalization. Original dashboard routes are not exposed by this prototype. Reintroducing them with their real API client is a separate integration task.

## Verification — 9 October 2026

| Check | Result |
| --- | --- |
| Dependency installation | Existing lockfile installed; required 3D/animation/font packages added and lockfile updated |
| `npm run lint` | Pass, no errors/warnings in active frontend |
| `npm run typecheck` | Pass |
| `npm test` | 4/4 pass: pose API, convergence endpoints, reverse scroll and clamping/finite coordinates |
| `npm run build` | Pass; `/`, `/onboarding`, icon and not-found routes statically generated |
| Edge browser acceptance against production | 30/30 pass; see `../docs/frontend-sprint-01/browser-results.json` |
| Independent code review | No critical or important findings |
| Preservation | Root README/backend unchanged; old frontend source preserved |

The browser checks exercise both routes at 320, 390, 768, 1024 and 1440px, real WebGL initialization, organization and reverse-scroll stages, both CTAs, menu focus/Escape, local save/reset/filter/empty-state behavior, no mobile/reduced-motion pinning, pixel-identical reduced-motion frames, actual context-loss recovery, simulated unavailable WebGL, and zero browser errors/backend or external API requests during the acceptance run. Production screenshots were visually inspected.

To repeat browser acceptance, start a fresh Playwright CLI session at the repository root; a fresh session matters because the final test intentionally disables WebGL on subsequent navigations:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=opporbyte open http://127.0.0.1:3000 --browser msedge
$opporbyteChecks = Get-Content frontend/tests/browser-acceptance.txt -Raw
npx --yes --package @playwright/cli playwright-cli -s=opporbyte run-code $opporbyteChecks --raw
npx --yes --package @playwright/cli playwright-cli -s=opporbyte close
```

## Screenshots

[Desktop hero](../docs/frontend-sprint-01/desktop.png) · [Scroll convergence](../docs/frontend-sprint-01/convergence.png) · [Mobile hero](../docs/frontend-sprint-01/mobile.png) · [Secondary section](../docs/frontend-sprint-01/section-preview.png) · [Onboarding](../docs/frontend-sprint-01/onboarding.png) · [Reduced motion](../docs/frontend-sprint-01/reduced-motion.png) · [Fallback](../docs/frontend-sprint-01/fallback.png).

## Known limitations

- Fictional demonstration only. No real discovery, AI matching, authentication, resume handling or application submission was implemented; selections reset on navigation/refresh.
- Browser checks cover desktop Edge and emulated responsive dimensions, not physical phones, Safari/Firefox or a full assistive-technology audit. GPU performance has not been benchmarked on low-end devices.
- React Three Fiber currently invokes Three.js's deprecated Clock API, producing a dependency warning; this is not a browser error. This Edge/GPU combination also emitted shader precision warnings. Rendering and context-loss recovery passed.
- `npm audit` reports five inherited high-severity findings in the development-only ESLint/fast-glob/micromatch/braces chain. No runtime dependency findings were reported. Its suggested automatic fix would downgrade eslint-config-next across major versions, so it was not applied in this frontend sprint. Reconcile the build-tool dependency versions before public deployment.
- The existing backend suite was not run because the backend is untouched and outside this sprint. No remote CI or deployment ran.

Stop point: Frontend Sprint 01. Review locally before deciding whether to publish.
