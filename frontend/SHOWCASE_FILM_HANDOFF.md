# Opporbyte showcase film handoff

The opening is now an actual continuous 35-second 3D product film. It brings
scattered search objects together, shows the local discovery interface, moves
through resume preparation and tracking previews, and resolves into the invitation
"Your next chapter starts here." The narration, music and effects share one
encoded soundtrack, so they follow native video seeking and pausing exactly.

## Review locally

Open http://127.0.0.1:3001/. The current server uses the production build.
Click **Sound off** in the top controls to enable sound and restart the story
from the opening line. The page starts muted to allow browser autoplay. Pause,
replay and English captions are alongside sound; Enter Opporbyte is available
throughout and opens the existing frontend demo. The bottom chapter strip is gone.

For a later session, from `frontend`:

```powershell
npm run build
npm run start -- --hostname 127.0.0.1 --port 3001
```

## Delivered files

- `public/films/opporbyte-landscape.mp4`: 1920x1080, 35s, 30fps, 1050 frames.
- `public/films/opporbyte-portrait.mp4`: separately composed 1080x1920, same duration.
- `public/films/opporbyte-en.vtt`: seven complete narration cues.
- `public/films/opporbyte-*-poster.jpg`: workspace poster for loading/paused views.
- `../videos/opporbyte-showcase/`: editable animation, original music/effects code,
  voice/score/effects stems, source UI captures, brief, credits and render commands.
- `../docs/showcase/browser-acceptance.json`: 34 passing browser checks.
- `../docs/showcase/evidence/`: desktop, mobile and media-failure screenshots.

The authorized narration uses Fish Audio's Sarah voice (524 package credits).
All website playback media is local; the browser does not call Fish Audio.

## Verified

Production build, lint and typecheck passed. Seven existing scene regressions
passed earlier in this revision. Source QA checked eight frames in each format,
including equality between direct seeking and sequential rendering.

Both final MP4s passed complete decoding and independent checks for exact size,
35s duration, 30fps, 1050 frames, AAC stereo at 48kHz and fast-start metadata.
The encoded soundtrack measured -17.29 LUFS integrated and -1.37 dBTP.
The local server serves byte ranges (206) for seeking.

Actual browser checks covered muted autoplay; sound activation, restarting and
muting; nonzero decoded audio routed through the browser; captions; pause;
completion and replay; format-switch continuity; offscreen pause/resume; 320px,
390px, tablet, desktop and short landscape layouts; reduced motion; a failed
initial media request; and entry into the unchanged local preview. No unexpected
runtime/resource errors or external frontend service requests occurred.

Audio decoding, signal and loudness were measured. Perceptual listening through
the user's speakers is left to their review. Verification reports are adjacent
to the final MP4s as `.verification.json`.

## Boundaries

Feature examples remain fictional. Discovery captures show the real local demo;
resume and tracking scenes illustrate the intended product. The landing does not
claim live job search, real AI matching, automatic applications or completed
backend workflows. Backend, legacy and root README are untouched. Work stays on
local `feat/frontend-sprint-01`; nothing is pushed, deployed or published.
