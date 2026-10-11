# 3D skill verification

Baseline review, 2026-10-09, before the custom skill was written:

- Existing WebGL hero: 0.09-unit card extrusion, nearly frontal camera, unlit
  faces, shallow rotations, zero-rotation organized poses, and one CSS shadow.
  These cues make real geometry look flat.
- Desktop animation must become more expressive while mobile keeps natural
  scrolling and reduced motion remains genuinely frozen.
- Ordinary requests such as "this 3D looks flat" must select the skill from its
  description; requiring a special command fails the user's requirement.

The independent reviewer established these acceptance conditions before reading
the new skill: visible inner-wall and two card side faces in a frozen frame;
occlusion across three depth layers; changing silhouettes under interaction;
reversible convergence; dimensional assembled workspace; mobile overflow checks;
identical reduced-motion frames; graceful WebGL failure; working actions.

After writing the skill, re-evaluate these scenarios with the complete skill and
validate its frontmatter and UI metadata. Browser implementation checks are
recorded separately in the revision handoff.

Independent review with the skill: all three scenarios passed. Backend-only and
simple CRUD requests do not match the scoped trigger description. The reviewer
recommended generalizing the core/card criteria for other scene subjects,
explicitly checking live context loss, and making perspective changes immediate
under reduced motion. All three refinements were incorporated.
