# Landing motion and selection refinement

The review feedback is implemented on the local `design/full-frontend-redesign`
branch. The updated production preview runs at <http://127.0.0.1:3001/>.
Refresh an existing tab to load the current production bundle.

| Before | After | Why |
| --- | --- | --- |
| All selected/copied text used cyan | Neutral gray selection; FAQ summary controls do not select their labels | Prevent accidental color changes while preserving text copying and keyboard focus |
| Hero poses followed raw scroll steps | Shared, frame-rate-independent damping eases toward the native scroll position | Smooth wheel/touch changes without taking over browser scrolling |
| Endless Tabs used a one-time intersection trigger and animated top/left | Continuous, reversible, staggered transforms; card spacing adapts to width and height | Keep the explanation connected to the visitor's scroll and avoid layout animation |
| Finale switched between two states at an intersection threshold | Continuous, reversible assembly with a consistent board coordinate system | Eliminate threshold flicker and keep the title clear as objects align |
| Mobile finale mixed scaled pieces with unscaled board text | Board contents and objects use the same scale; illustration sits above the copy | Keep the final arrangement readable and separated on narrow screens |
| Bringing the replay button into view could reset its state | Replay persists; actual wheel/touch/page-key input resumes scroll control | Preserve mouse and keyboard interactions, including reduced motion |
| Settled scenes kept writing identical styles | Animation frames finish at the target; unchanged scroll progress does not repaint | Reduce unnecessary work and keep reduced-motion compositions frozen |

Section headings have restrained one-time reveals. All copy and controls remain
available immediately, and reduced motion presents the organized compositions
without the scroll movement. Resize and font readiness refresh geometry; effects,
observers and listeners are cleaned up on unmount.

## Verification

- Final frontend lint passed.
- Final production build and its TypeScript checks passed (27 generated pages).
- All 18 automated frontend tests passed, including three meaningful damping and
  progress regressions.
- 34 focused production-browser checks passed, covering FAQ selection/copying,
  keyboard controls, partial poses, reversal, manual replay, wheel resumption,
  reduced motion, zero redundant frozen-scene style writes and runtime errors.
- The existing eight WebGL checks passed again, including startup failure, live
  context loss, offscreen pausing, pointer response and identical frozen frames.
- Card separation, finale title clearance and zero horizontal overflow were
  verified at 1440, 1280, 768, 390 and 320 pixels in desktop Chromium emulation.

Editable browser verification is in `frontend/tests/marketing-motion-browser.txt`.
The result summaries and captures are under `docs/frontend-review/`.
Physical-device performance remains a separate check; no measured hardware
frame-rate claim is made.

Backend code, authentication, workspace APIs and root README were preserved.
This refinement is local only; no push, PR or publication was performed.
