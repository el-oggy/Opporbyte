# Frontend Sprint 01 Implementation Plan

**Goal:** Deliver the supplied Opporbyte landing-page prototype and harmless onboarding preview.

**Architecture:** Next.js App Router public pages, reusable navigation and card components, lazily loaded React Three Fiber scene, shared GSAP scroll progress, and static fallback. Preserve old frontend code under `frontend/legacy` because its API client is missing.

**Tech stack:** Existing Next.js/React/TypeScript/Tailwind/Lucide plus Three.js, React Three Fiber, GSAP and locally hosted fonts.

**Spec:** `docs/superpowers/specs/2026-10-09-frontend-sprint-01-design.md` and the user's supplied Sprint 01 brief.

## Global constraints

- Exact approved headline, colors and CTAs.
- Fictional demonstration content across industries.
- No backend integration, credential collection, resume upload, or fake account creation.
- Keep existing root README/backend intact and preserve old frontend sources.
- No additional landing sections beyond the next-section preview.

## Review focus

- Narrow widths: readable copy and no horizontal overflow.
- WebGL failure: meaningful static visual and working CTAs.
- Reduced motion: no pinning, idle rotation or pointer animation.
- Menu keyboard: Escape closes and focus returns to toggle.
- Returning scroll: scene positions interpolate reversibly without accumulated state.

## Tasks

- [x] Preserve legacy source; verify local Next.js guides; install only needed dependencies; configure active frontend and scripts.
- [x] Build navigation, immediate hero copy and next-section preview with semantic links and mobile styling.
- [x] Model ceramic core and textured dimensional cards; implement reversible GSAP choreography and render lifecycle/fallback handling.
- [x] Build in-memory, clearly labeled onboarding preview with multi-industry examples.
- [x] Run lint/typecheck/build and browser checks; inspect screenshots and correct issues.
- [x] Document local run/evidence/limitations; prepare local commit on development branch. User explicitly defers all pushing, PR creation and publishing until after local review.

## Execution record

Baseline production build failed on the missing original `@/lib/api`. Preserving the old source in `frontend/legacy` avoids inventing backend integration. Four scene-pose tests were observed failing before implementation, then passing. Browser checks caught field selection incorrectly matching job-title substrings; exact field selection now filters by field while custom text searches fields/titles. Imperative environment assignment was changed to declarative attachment to satisfy React's lint rules. Generated old route types were refreshed by production build.

Final lint/typecheck, 4 tests and production build passed. 30 browser acceptance checks passed against production. Independent read-only review found no critical/important issues and confirmed original source preservation. All GitHub writes remain deferred by the user's explicit instruction.
