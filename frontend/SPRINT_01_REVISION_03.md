# Opporbyte — Sprint 01, full viewport revision

The hero now uses one unboxed 3D environment across the desktop viewport.
Centered two-line typography sits above the orange ceramic O; dimensional jobs,
a layered resume, a cyan match card and an interview status occupy different
lateral depths. The actual WebGL canvas spans the hero at both tested desktop
widths, 1024px and 1440px.

Scroll contracts the scattered opportunities into visible connecting paths and
then a miniature named workspace. Camera framing and headline scale evolve
together through the reversible 850px sequence. Captions and the keyboard
perspective control have their own footer space. Card labels are crisp while
their extruded bodies retain physical lighting, side faces and shadows.

The approved copy, cream/orange/ink/cyan palette, Space Grotesk/Inter, navigation,
frontend onboarding demo and next-section beginning remain. Tablet uses its own
compact composition; mobile uses three objects. Neither compact layout pins.
Reduced motion freezes a useful pose, and WebGL startup failure/context loss
preserve a static visual and the actions.

## Preview

The verified production preview is at [127.0.0.1:3000](http://127.0.0.1:3000/).
Try **Turn the view** and scroll through Discover → Connect → Organize.

To run later:

```powershell
Set-Location 'C:\Users\adars\OneDrive\Desktop\Opporbyte\frontend'
npm ci
npm run dev -- --hostname 127.0.0.1
```

For production, use `npm run build`, followed by
`npm run start -- --hostname 127.0.0.1`. Stop an existing server before reusing
its port. The server started for this handoff is a local preview, not a deployment.

## Skills and recalled context

Ran the exact requested Find Skills command, read its complete output, followed
the discovery instructions and installed 37 additional global skills: Find Skills,
the six Ponytail skills, ten Three.js skills, five Emil design/animation skills,
two Taste skills, Remotion with its supporting subskills, and twelve Hyperframes
and media skills. They join the 190 prior imports and custom immersive 3D skill.
Every new skill enables implicit invocation; no special user command is needed.

Verified all 37 folders, 615 source/supporting files and 56 local supporting links.
The source commits, hashes, installation details and repeatable audit prerequisites
are in [skill installation notes](../docs/skills/README.md).
Installing instructions does not itself install every video runtime or connect
cloud services. No service accounts, plugin hooks or deployment were configured.

The accessible user messages in ChatGPT's **Automate Job Applications** conversation
confirmed the full-screen immersive choice and scattered-to-workspace story.
Saved motion notes reinforced ambitious, editable code animation. The ChatGPT
reader did not expose the earlier assistant message bodies, so this refinement
uses the actual available user decisions and supplied Sprint 01 brief.

Applied frontend design, the custom immersive 3D workflow, Three.js lighting,
Emil design engineering and Ponytail's engineering standards. A read-only code
review checked the framing, cleanup and skill verification workflow.

## Verified

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: all 7 pose tests passed, including compact layout isolation during
  scroll/breakpoint changes.
- `npm run build`: Next.js 16.4.0 production build passed; `/`, `/onboarding`,
  `/icon.svg` and the not-found page were prerendered.
- Production Edge acceptance: 42/42 checks passed. Both routes have no horizontal
  overflow at 320/390/768/1024/1440px. Checks cover full-width desktop WebGL,
  pinning/reversal, resizing and reduced-motion changes during the story,
  both CTAs, keyboard perspective, mobile focus/Escape, local demo behavior,
  startup fallback, live context loss and a tighter 1440×768 laptop composition.
- Reduced-motion poses remained frozen: zero changed pixels beyond a one-level
  RGB tolerance in captures 700ms apart, including the inspected pose.
- Browser suite: no console/page errors and no backend/external API requests.
- `npm audit --omit=dev`: zero known production dependency vulnerabilities.
  This does not claim that development dependencies have no advisories.
- Independent review: no remaining critical or important findings after fixes.

The first full-width resize assertion ran before ScrollTrigger's asynchronous
refresh. The acceptance runner now waits for the final pinned width before
checking it; the complete production rerun passed.

No website dependencies were added in this revision. Backend, root README and
legacy source are preserved. Work stays on local `feat/frontend-sprint-01`;
main and origin/main remain at `f951f278d05e60f3abe4e3f7fbf0d83ce231bc07`.
Nothing was pushed, published or opened as a pull request.

## Evidence and limits

[Production screenshots and browser results](../docs/frontend-sprint-01/revision-03/)
cover discovery, perspective, connection, organization, narrow desktop, tablet,
mobile, short laptop, section preview, onboarding, reduced motion and fallback.
The WebM recording shows the actual browser's 3D perspective, transformation and
reversal. It is 1440×900, 48.48 seconds, with no narration or audio. Native browser
verification completed playback at 4× speed and sought successfully to 25% and
75%; [playback results](../docs/frontend-sprint-01/revision-03/playback-results.json)
record those checks. Revision 02's
evidence remains intact.

These checks used desktop Edge and emulated viewport/media conditions. They do
not establish real-phone performance, Safari/Firefox coverage, backend readiness
or end-to-end job application functionality. Job, company, match and status
content is fictional demonstration content.
