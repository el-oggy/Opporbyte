"""Import the user's existing local skill libraries without running their installers.

Run with --dry-run first. Existing skills are never overwritten. Original helpers
and external references stay available at their original Windows locations.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil

HOME_DIR = Path.home()
DEST = HOME_DIR / ".agents" / "skills"
ROOTS = [
    HOME_DIR / ".gemini" / "config" / "skills",
    HOME_DIR / ".gemini" / "antigravity" / "skills",
    HOME_DIR / ".gemini" / "antigravity-ide" / "skills",
    HOME_DIR / ".claude" / "skills",
]
EXCLUDED = {".git", "node_modules", ".next", "__pycache__", ".venv"}
# These same-name skills are already provided by Codex or the installed plugins.
PROVIDED = {"skill-creator", "brag", "brag-slim", "motion", "playwright"}

def metadata(path):
    raw = path.read_text(encoding="utf-8-sig")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", raw, re.S)
    if not match:
        raise ValueError(f"Missing frontmatter: {path}")
    name = re.search(r"^name:\s*[\"']?([^\n\"']+)", match[1], re.M)
    if not name or not re.search(r"^description:", match[1], re.M):
        raise ValueError(f"Missing name/description: {path}")
    return raw, match, name[1].strip()

def candidates():
    for root in ROOTS:
        if not root.exists():
            continue
        for folder in sorted(root.iterdir()):
            if not folder.is_dir() or not (folder / "SKILL.md").exists():
                continue
            if folder.name == "gstack":
                yield folder, "gstack"
                for child in sorted(folder.iterdir()):
                    if child.is_dir() and (child / "SKILL.md").exists():
                        yield child, f"gstack-{child.name}"
            else:
                yield folder, folder.name

def ignore(_directory, names):
    return [name for name in names if name in EXCLUDED]

def run(install):
    seen_names = set(PROVIDED)
    for root in [DEST, HOME_DIR / ".codex" / "skills"]:
        if root.exists():
            for file in root.glob("*/SKILL.md"):
                try:
                    seen_names.add(metadata(file)[2])
                    seen_names.add(file.parent.name)
                except ValueError:
                    pass
    seen_hashes = set()
    records = []
    for source, target_name in candidates():
        raw, match, original_name = metadata(source / "SKILL.md")
        digest = hashlib.sha256(raw.encode()).hexdigest()
        target = DEST / target_name
        if digest in seen_hashes or target_name in seen_names or target.exists():
            records.append({"name": target_name, "source": str(source), "status": "already-available-or-duplicate"})
            continue
        seen_hashes.add(digest)
        seen_names.add(target_name)
        status = "planned"
        if install:
            shutil.copytree(source, target, ignore=ignore)
            # Give collection members unique names in Codex. Preserve the original.
            (target / "IMPORTED-SKILL.original.md").write_text(raw, encoding="utf-8")
            header = re.sub(r"^name:.*$", f"name: {target_name}", match[1], flags=re.M)
            adapter = f"""\n## Codex compatibility\n\nImported from `{source}`; original instructions are saved in\n`IMPORTED-SKILL.original.md`. Read referenced local files explicitly, expanding\n`~` to the user's home. Supporting files in this skill were preserved. External\nAntigravity/GSD/gstack helpers remain at their original source locations.\n\nTranslate host tool names to available Codex tools: Read/Glob/Grep to file tools\nor rg, Bash to the available shell (use Bash only if installed), browser tools to\nthe available Playwright/browser integration, and AskUserQuestion to the available\nuser-input tool. Do not invent unavailable tools or claim a copied skill installs\na runtime, MCP connector, credentials, or a service. Respect the current user's\nauthorization: skill setup, telemetry, publishing, pushing, and messaging are not\nautomatically authorized by importing this library.\n\n"""
            (target / "SKILL.md").write_text("---\n" + header + "\n---\n" + adapter + raw[match.end():], encoding="utf-8")
            # Explicitly opt in to matching ordinary requests, preserving UI metadata.
            yaml_path = target / "agents" / "openai.yaml"
            yaml_path.parent.mkdir(exist_ok=True)
            yaml = yaml_path.read_text(encoding="utf-8") if yaml_path.exists() else ""
            if "allow_implicit_invocation:" in yaml:
                yaml = re.sub(r"allow_implicit_invocation:\s*(?:true|false)", "allow_implicit_invocation: true", yaml)
            elif re.search(r"^policy:\s*$", yaml, re.M):
                yaml = re.sub(r"^policy:\s*$", "policy:\n  allow_implicit_invocation: true", yaml, flags=re.M)
            else:
                yaml += "\npolicy:\n  allow_implicit_invocation: true\n"
            yaml_path.write_text(yaml, encoding="utf-8")
            metadata(target / "SKILL.md")
            status = "installed"
        records.append({"name": target_name, "original_name": original_name, "source": str(source), "destination": str(target), "status": status})
    report = {"destination": str(DEST), "records": records}
    if install:
        report_file = Path(__file__).resolve().parents[1] / "docs" / "skills" / "installation-report.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        report_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
    counts = {}
    for record in records:
        counts[record["status"]] = counts.get(record["status"], 0) + 1
    print(json.dumps({"destination": str(DEST), "counts": counts, "skills": [r["name"] for r in records if r["status"] in {"planned", "installed"}]}, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true")
    group.add_argument("--install", action="store_true")
    args = parser.parse_args()
    run(args.install)
