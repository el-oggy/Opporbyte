# Your global skills

Installed 190 unique skills from your existing Gemini/Antigravity and
Claude/gstack libraries, plus the new `immersive-3d-web` skill. Existing same-name
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
