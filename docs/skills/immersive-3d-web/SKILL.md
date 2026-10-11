---
name: immersive-3d-web
description: Use when building or improving a 3D website, cinematic landing page, interactive WebGL hero, Three.js or React Three Fiber scene, scroll-driven 3D animation, or when an existing 3D frontend looks flat or lacks visible depth. Applies to natural-language requests without requiring a skill command.
---

# Immersive 3D Web

The result must **look dimensional in the rendered browser**, including a still
frame. Having a canvas, torus, or WebGL renderer alone is not visual acceptance.

## Design before implementation

Read the brief, existing UI, stack, and local instructions. Keep specified copy,
palette, accessibility, backend boundaries, and Git workflow. Make routine
creative choices and continue when the user has already authorized the work.

Choose one memorable sculptural object that relates to the product. Define a
composition with foreground, middle ground, and background. Keep navigation,
headline, and actions immediately visible in the DOM. Integrate the scene into
the page; use a feature-card container only when the brief calls for one.

## Make depth unmistakable

Use real meshes and physical materials. Give UI objects believable extrusion,
beveled edges, backs, layered details, and deliberate three-quarter poses. Light
their faces as well as edges. Place objects at different depths so they overlap,
cast soft shadows, and exhibit perspective. Use restrained environment lighting
and a clear key/fill/rim relationship. For a core-and-cards design, check the
core's inner walls and at least two card side faces in a rendered still frame,
including the frozen composition. For other subjects require equivalent visible
thickness, silhouette, shading, occlusion, and depth on the principal objects.

Avoid stacking frontal texture planes around a nearly frontal torus and calling
the scene finished. Texture labels may provide readable content; their bodies,
lighting, occlusion, and changing silhouettes must provide the dimensionality.

## Choreograph the experience

Map scroll progress to deterministic poses and camera framing. For example,
scattered cards approach an orange ceramic core, curved connections activate,
then cards assemble into a small dimensional workspace. Every stage must reverse
cleanly without accumulating transforms. The organized state must retain depth.

Use a short desktop sequence with visible perspective change. Pointer parallax
and gentle tilt should visibly affect depth without interfering with links.
An optional keyboard-operable perspective toggle can let visitors inspect the
sculpture; its pose change is immediate under reduced motion. Keep idle motion
gentle; heavier movement should serve an interaction
or transition. Read library docs in the installed version before choosing APIs.

## Preserve reach and performance

Use fewer objects and a separate mobile framing. Do not trap touch scrolling or
pin narrow screens. Reduced motion uses an attractive frozen three-quarter pose:
disable idle, entrance, parallax, and scroll animation; render on demand. Provide
a useful static fallback for unavailable or lost WebGL and maintain all CTAs.

Lazy-load heavy scene code, cap pixel ratio, pause offscreen rendering, reuse
geometry/materials, and dispose textures and listeners. Avoid new dependencies
when the existing renderer can implement the effect.

## Verify the result, then deliver

Run relevant lint, types, production build, and reversible-pose tests. Inspect
actual browser screenshots at desktop, 320/390px mobile, reduced motion, and
fallback, both startup unavailability and live WebGL context loss. Compare pointer
and scroll frames for changing silhouettes and occlusion;
verify reverse scrolling and time-separated identical reduced-motion frames.
Check console errors and navigation. Improve what still appears flat before
claiming completion. Include a live local preview and clear implementation limits.

Never push, publish, connect a backend, or upload user data unless authorized.
