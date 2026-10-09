# Opporbyte: full viewport composition

The visible user messages in ChatGPT's **Automate Job Applications** conversation
confirm the choice of a full-screen immersive hero and the scattered-to-workspace
story. The original Sprint 01 attachment supplies the exact copy, palette,
technology, frontend-only scope and reduced-motion requirements. Saved motion
notes reinforce editable code, deliberate visual transitions and an ambitious
finish; they do not add a separate narrated film to this website sprint.

| Before                                                     | After                                                                                                                                  | Why                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Text column beside a bounded right-hand scene              | An unboxed canvas spans the hero; type sits above a central sculpture and opportunities occupy different lateral depths                | Honor the chosen immersive composition  |
| Pale lit texture labels                                    | Crisp text on physically lit, extruded card bodies                                                                                     | Legibility and depth must coexist       |
| Cards migrate a short distance around the same focal point | Wider scattered positions contract into connections, then a named miniature workspace; the camera and headline framing evolve together | The transformation explains the product |

Keep Milky Bar cream `#F4E7D2`, soft black `#202420`, orange `#FF6B2B`,
cyan `#B9F0EC` and warm white `#FFFDF8`. Retain Space Grotesk/Inter, the
approved headline, existing onboarding preview and next-section preview.
Use the existing renderer and GSAP; no new website dependencies.

Desktop: two-line centered type with readable description and actions, a
sculptural orange O below the central reading zone, asymmetric foreground and
background opportunity objects, a short reversible pinned transformation.
Tablet/mobile: copy and actions precede a separately framed, smaller scene;
no pin, reduced object count on mobile. Reduced motion freezes a useful pose;
unavailable/lost WebGL preserves a useful static composition and all actions.

Verify actual browser frames for readability, visible card side faces, occlusion,
story progression, reversal, keyboard actions, mobile overflow, reduced motion,
startup fallback and context loss. Run lint, types, pose tests and production
build. Save new screenshots without replacing previous evidence. Keep all work
on the local feature branch; preserve main, backend and the original README.
