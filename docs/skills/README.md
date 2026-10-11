# Your global skills

Installed 190 unique skills from your existing Gemini/Antigravity and
Claude/gstack libraries, the new `immersive-3d-web` skill, and 37 additional skills
from the discovery pass below. Existing same-name
skills were preserved; 126 duplicate or already available entries were skipped.

Global destination: `C:\Users\adars\.agents\skills`.

The imported collection includes frontend design, React performance, browser QA,
brand design, GSD project workflows, gstack engineering/design workflows, cloud
data applications, Google Cloud pipelines, storage, SQL, MCP development, and
your other global specializations. Supporting files were copied. Original
instructions remain in each imported folder as `IMPORTED-SKILL.original.md`.

Every imported skill has `allow_implicit_invocation: true`. The new 3D skill
recognizes ordinary requests such as “build a cinematic 3D website” or “this
WebGL hero looks flat.” You do not need a special command. Opporbyte's root
`AGENTS.md` also routes relevant work to design, 3D, React and browser skills.

Codex selects skills by their descriptions. New skills are detected automatically;
if they do not appear in the app, restart Codex. See the
[official skill documentation](https://developers.openai.com/codex/skills/).

## Adding another skill later

Put its entire folder, including `SKILL.md` and referenced scripts/assets, into
`C:\Users\adars\.agents\skills\your-skill-name`. The `SKILL.md` frontmatter
needs a unique `name` and a clear `description` stating which ordinary requests
should trigger it. An optional `agents/openai.yaml` can explicitly enable
implicit invocation. Ask Codex to install or create it; no slash command is needed.

## Verified portability

All 190 imports have valid required metadata, matching preserved original
instructions, and implicit invocation enabled. All 121 GSD file references were
checked. Five stale references were repaired by adding this directory junction:

`C:\Users\adars\.gemini\antigravity\gsd-core` →
`C:\Users\adars\.gemini\antigravity-ide\gsd-core`.

The custom 3D skill passed the skill creator's validator and independent scenario
review before use. Its scope excludes backend-only and ordinary CRUD requests.

Skills provide workflows and instructions. They do not themselves install cloud
services, authentication, MCP connections or every host-specific binary. Imported
skills include Codex compatibility notes; use actual available tools and verify
dependencies when a task needs them. No cloud services or credentials were
configured by this installation.

Detailed records: [installation report](installation-report.json),
[verification results](verification-results.json),
[3D skill](immersive-3d-web/SKILL.md),
[scenario review](skill-test-scenarios.md).

## Discovery pass: 37 additional skills

Ran your exact command and read its complete generated instructions:

```powershell
npx skills use "https://github.com/vercel-labs/skills" --skill "find-skills"
```

The output embedded the skill instructions directly; it did not supply a separate
supporting-files directory. Followed its discovery workflow: inspected the
skills.sh leaderboard, searched relevant categories, reviewed primary GitHub
sources and installed selected skills from local copies of reviewed commits.
All existing same-name skill folders were preserved.

| Collection                                               | Added | Ordinary task triggers                                                                     |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------ |
| [Find Skills](https://github.com/vercel-labs/skills)     |     1 | Discover an appropriate skill                                                              |
| [Ponytail](https://github.com/DietrichGebert/ponytail)   |     6 | Engineering quality, review, audits and technical debt                                     |
| [Three.js](https://github.com/cloudai-x/threejs-skills)  |    10 | Geometry, materials, light, textures, animation, loading, shaders, effects and interaction |
| [Emil Kowalski](https://github.com/emilkowalski/skills)  |     5 | Frontend craft and deliberate animation                                                    |
| [Taste](https://github.com/leonxlnx/taste-skill)         |     2 | Visual quality and refinement of existing websites                                         |
| [Remotion](https://github.com/remotion-dev/skills)       |     1 | Editable code-written videos; includes nested supporting skills                            |
| [Hyperframes](https://github.com/heygen-com/hyperframes) |    12 | Motion graphics, video composition, media, timing and audio                                |

Verified 37 skill folders, all 615 source/supporting files and 56 local supporting
links. Each new skill explicitly enables implicit invocation. Referenced paths
remain relative to that skill's original directory structure. The verification
records source commits, skill hashes and repository popularity at review time;
popularity is a selection signal, not a security guarantee. No repository hooks,
plugin installers, service integrations or video runtimes were executed.

The app has already discovered the new skill catalog. You can describe the task
normally; relevant skills are selected automatically. Their instructions guide
the work, while dependencies and API compatibility still need verification for
each project. Opporbyte keeps its approved palette, fonts and frontend-only scope
when a general-purpose skill suggests a different default.

Records: [complete generated instructions](find-skills-generated.txt),
[selected skills](discovery-selection.json),
[verified installation](discovery-verification.json).

### Reproducing the installation audit

`scripts/verify-discovered-skills.py` is a local source-comparison audit, not a
standalone network installer. This session's source clones and manifest are in
ignored `output/playwright/skill-discovery/`; they are not included in a fresh
checkout. Its Python dependency is declared in
`scripts/skill-verification-requirements.txt`.

To repeat elsewhere, clone the repositories at the commits recorded in the
verification report. Supply a JSON manifest array with one record per repository:
`{"source":"owner/repository","sha":"commit","stars":0,"path":"checkout-directory"}`.
Paths can be absolute or relative to `--source-root`. The script accepts
`--source-manifest`, `--source-root` and `--destination`; it requires the original
`skills/` supporting directories. Install PyYAML using the requirements file, or
pass `--python-support-dir` for an existing installation. It is read-only for
installed skills unless `--enable-implicit` is explicitly passed. The audit
updates the tracked JSON verification report.

For this session's retained cache:

```powershell
python scripts/verify-discovered-skills.py --python-support-dir output/skill-validation
```
