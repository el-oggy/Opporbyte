# Closing scene alignment and motion

The closing workspace illustration now uses a shared 465 by 360 coordinate
frame. The frame scales as a whole, so card edges and text retain the same
relationships at desktop and mobile widths.

| Before | After | Why |
| --- | --- | --- |
| Board and objects had separate perspective and scaling | One shared stage, with all objects docking in its plane | Keep the finished arrangement consistent at every width |
| Orange O occupied a loose position beside the profile | O settles into the board header as a compact brand mark | Give the composition a clear hierarchy and more room for the cards |
| Unequal card positions and spacing | Profile and opportunity share a top edge; opportunity and review share a width; profile and review share a baseline | Make “Everything has a place” visible in the layout |
| Similar movement across all objects | Brand, opportunity, profile and review dock at separate points in the scroll | Let visitors follow the assembly without an abrupt state change |
| Floating objects crossed the workspace title | Brand enters from above; profile travels below the title | Keep the title clear through the assembly |

The motion follows native scrolling and reverses to the same poses. Smooth
interpolation eases the local movement into and out of each docking phase;
subtle depth, rotation and curved movement disappear as the cards settle.
Reduced motion presents the complete composition immediately. The existing
CTA, FAQ, selection behavior, authentication and workspace routes are retained.

The browser regression source is
`frontend/tests/marketing-motion-browser.txt`. Final production verification
and screenshots are linked from `docs/frontend-review/GALLERY.md`.

## Verification

- Frontend lint and all 18 unit tests passed.
- Production build and TypeScript checks passed; 27 static pages generated.
- All 66 checks passed against the rebuilt production preview on port 3001.
- Measured card edges agree within one CSS pixel at 1440, 1280, 768, 390 and
  320px. Those widths also passed card containment, row/column separation,
  title clearance and horizontal-overflow checks.
- The title remains unobstructed at 0, 25, 50, 75 and 100 percent assembly.
- Scroll reversal, distinct docking phases, FAQ keyboard controls, neutral
  selection, reduced-motion presentation and zero JavaScript errors passed.

Mobile verification uses desktop Chromium viewport emulation. Physical-device
performance has not been measured in this refinement. Detailed production
results are in `docs/frontend-review/FINALE_QA.json`.

All work remains on the local `design/full-frontend-redesign` branch. No push,
PR, GitHub main change or publication is part of this refinement. Backend code
and the root README are preserved.
