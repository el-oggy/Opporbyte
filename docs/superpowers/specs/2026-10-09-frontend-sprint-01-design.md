# Opporbyte Frontend Sprint 01

The supplied Frontend Sprint 01 brief is the approved scope: a warm cream public landing page, original orange ceramic 3D core, dimensional fictional career cards across industries, reversible short scroll choreography, responsive navigation, and a frontend-only onboarding preview. No backend, authentication, AI integration, uploads, or applications are added.

## Composition

Use an editorial split composition: immediately readable copy on the left, an unboxed Three.js scene on the right. Cream #F4E7D2, ink #202420, orange #FF6B2B, cyan #B9F0EC, and white #FFFDF8. Expressive locally hosted Space Grotesk headings and Inter interface text. Fine grid details, orbit lines, and small editorial labels unify the environment.

The scene uses modeled geometry for the core and thick beveled cards, canvas textures for crisp fictional card content, warm hemisphere/directional lighting, and a soft procedural ground shadow. No external model or image assets. A shared progress ref driven by GSAP ScrollTrigger interpolates scattered cards through an orbit to a small organized workspace. Pointer easing adds restrained parallax. A desktop-only short pinned interval avoids trapping mobile scrolling.

## Routes and boundaries

`/` contains navigation, the hero, and only the start of "Goodbye, endless tabs." Navigation anchors point to real elements inside that section. `/onboarding` is labeled frontend preview; users can choose a field and explore fictional examples without entering personal information. All choices remain in memory. The public routes have no auth/API providers.

Existing frontend sources import a missing `@/lib/api` client with no tracked historical version. Preserve the existing app, hooks, types and dashboard components under `frontend/legacy`, outside the active build. Preserve the root README and all backend files. Document this boundary; do not invent the API client.

## Accessibility and performance

Accessible mobile menu, Escape/focus handling, focus rings, skip link, semantic headings and labeled links. Mobile copy precedes a smaller scene. Reduced motion uses a static scene, no pinning, and immediate anchor scrolling. WebGL failure/context loss uses a CSS dimensional fallback. IntersectionObserver pauses offscreen rendering; bounded DPR and modest geometry keep the scene lightweight. Important content never depends on the canvas.

## Acceptance

Install dependencies; run lint, strict typecheck, production build and browser checks. Verify desktop/mobile overflow, both CTA paths, menu keyboard behavior, reverse scroll, reduced motion, WebGL fallback, and no console errors or backend requests on public routes. Deliver screenshots, local run instructions, limitations and git/PR status.
