# Opporbyte — Sprint 01, 3D revision

The revised hero communicates depth through a thick beveled ceramic O, a recessed
ribbed graphite inner wall, a cyan seam, dimensional UI slabs, layered resume
pages, lit faces, three depth layers, occlusion, and soft physical shadows.

Desktop scroll drives a camera arc and gathers the scattered objects into an
angled miniature workspace. The 850px sequence reverses cleanly. Pointer movement
changes camera framing and object tilt. The keyboard-operable **Turn the view** /
**Original view** control provides a more pronounced perspective change.

The approved headline, palette, description, navigation and CTAs remain. Mobile
uses three objects with its own framing, with headline/actions before the scene,
natural touch scrolling and no pinning. Reduced motion freezes the composition;
the perspective control applies an immediate pose change. Startup and live WebGL
failure retain the static visual and working actions.

## Open locally

The production preview is running at [127.0.0.1:3000](http://127.0.0.1:3000).
Try **Turn the view**, then scroll through Discover → Connect → Organize.

To start development later in PowerShell:

```powershell
Set-Location 'C:\Users\adars\OneDrive\Desktop\Opporbyte\frontend'
npm ci
npm run dev -- --hostname 127.0.0.1
```

If the preview is still running, stop that server before using the same port.
For a production preview use `npm run build`, then
`npm run start -- --hostname 127.0.0.1`.

## Skills installed

190 unique existing global skills were imported, plus the new
`immersive-3d-web` skill, into `C:\Users\adars\.agents\skills`. Natural-language
matching is enabled. Existing skills were preserved and 126 duplicate/already
available entries skipped. All 190 imports and 121 GSD file references were
verified. The custom 3D skill passed the official validator and an independent
scenario review before being applied to this revision.

See [skill installation notes](../docs/skills/README.md) for sources, future
installation, automatic selection, supporting files and runtime limits.

## Files changed

- `components/scene/CoreScene.tsx`: sculptural geometry, physical materials,
  lighting/shadows, camera rig, layered cards, angled workspace and first-frame
  readiness.
- `components/scene/card-textures.ts`: portrait resume artwork and larger labels.
- `lib/scene-layout.ts`: deterministic depth-aware card/camera poses and inspection
  framing, with exact reversible endpoints.
- `components/landing/Hero.tsx`, `components/scene/SceneHost.tsx`,
  `app/globals.css`: perspective control, accessible visible labels, renderer
  state, and responsive integration.
- `public/favicon.ico`: resolves the browser's fallback favicon request.
- `tests/scene-layout.test.mjs`, `tests/browser-acceptance.txt`: pose and browser
  checks, including keyboard perspective under reduced motion.
- Root `AGENTS.md`, `.gitignore`, `scripts/import-local-skills.py`,
  `scripts/verify-local-skills.py`, `docs/skills/`: automatic skill routing,
  installer/verifier, reusable 3D skill and installation records.
- `docs/frontend-sprint-01/revision-02/`: current production screenshots,
  interaction recording and browser verification results.

Root README, existing backend and previously preserved legacy source were not
changed by this revision. The original sprint handoff remains in `SPRINT_01.md`.

## Validation

- `npm ci`: clean installation from the existing lockfile succeeded.
- `npm run lint`: passed with no errors or warnings.
- TypeScript: production compilation passed; standalone `npm run typecheck`
  also passed during verification.
- `npm test`: 6/6 pose tests passed, covering endpoints, depth, camera inspection,
  reversal, clamping and finite values.
- `npm run build`: Next.js 16.4.0 production build passed; `/`, `/onboarding`,
  `/icon.svg`, and the not-found page were prerendered.
- Production Edge browser suite: 34/34 checks passed, including both CTAs,
  mobile focus/Escape, overflow at 320/390/768/1024/1440px on both routes,
  real desktop WebGL, short pinning, scroll reversal, reduced-motion freeze,
  keyboard perspective, startup unavailability, live context loss,
  zero console errors, and no backend or external API requests.
- Reduced-motion screenshots 700ms apart showed zero changed pixels beyond a
  one-level RGB tolerance. GPU readback otherwise varied by one color level at
  one edge pixel; the pose itself remains fixed.
- `npm audit --omit=dev`: zero production dependency vulnerabilities.
- Independent implementation review confirmed visible depth and reversible
  transforms; its accessible-name finding was fixed.

## Evidence and limits

Current screenshots and the real browser interaction recording are in
[revision evidence](../docs/frontend-sprint-01/revision-02/).
The 44.36-second recording is 1440×900 and was verified for local playback and
midpoint seeking with no media error. Its stream was remuxed to add a usable
duration/seek index without re-encoding the captured frames.

The miniature card copy is illustrative and can be small, particularly on mobile.
Essential copy and actions remain readable DOM content. This remains a frontend
prototype: no authentication, resume upload, matching service or job submission.

The clean install reports five inherited development-tool vulnerabilities. The
production dependency audit is clean. The installed R3F version emits an upstream
Three.js Clock deprecation warning; browser verification recorded no errors.

Skills supply instructions and workflows; cloud accounts, service runtimes and
host-specific helper tools still need verification when a future task uses them.
No cloud accounts, credentials or backend services were configured.

## Local Git

Development remains on `feat/frontend-sprint-01`. This revision is committed
locally. No push, PR or publication was performed. Local `main` and `origin/main`
remain at `f951f278d05e60f3abe4e3f7fbf0d83ce231bc07`.
