"""Audit reviewed skill copies against local source checkouts. Requires PyYAML."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--enable-implicit", action="store_true")
    parser.add_argument("--source-manifest", type=Path, default=ROOT / "output/playwright/skill-discovery/source-metadata.json")
    parser.add_argument("--source-root", type=Path, default=ROOT, help="Base directory for relative source checkout paths in the manifest")
    parser.add_argument("--destination", type=Path, default=Path.home() / ".agents/skills")
    parser.add_argument("--python-support-dir", type=Path, help="Optional directory containing an existing PyYAML installation")
    args = parser.parse_args()
    if args.python_support_dir:
        sys.path.insert(0, str(args.python_support_dir.resolve()))
    try:
        import yaml
    except ImportError:
        parser.error("Install scripts/skill-verification-requirements.txt or pass --python-support-dir with PyYAML available")
    if not args.source_manifest.is_file():
        parser.error(f"Source audit manifest missing: {args.source_manifest}. See docs/skills/README.md for the source-cache requirements.")
    selection = json.loads((ROOT / "docs/skills/discovery-selection.json").read_text())
    metadata = json.loads(args.source_manifest.read_text(encoding="utf-8-sig"))
    sources = {item["source"].lower(): item for item in metadata}
    destination = args.destination
    results, issues = [], []
    for entry in selection["sources"]:
        source = sources[entry["repo"].lower()]
        source_root = args.source_root / source["path"]
        if not (source_root / "skills").is_dir():
            parser.error(f"Reviewed source checkout missing: {source_root}")
        available = {}
        for path in (source_root / "skills").glob("*/SKILL.md"):
            frontmatter = yaml.safe_load(path.read_text(encoding="utf-8").split("---", 2)[1])
            available[frontmatter["name"]] = path.parent
        for name in entry["skills"]:
            original, installed = available[name], destination / name
            if not (installed / "SKILL.md").is_file():
                issues.append(f"Missing installed skill: {name}")
                continue
            policy_path = installed / "agents/openai.yaml"
            if args.enable_implicit:
                policy = yaml.safe_load(policy_path.read_text(encoding="utf-8")) if policy_path.exists() else {}
                policy = policy or {}
                policy.setdefault("policy", {})["allow_implicit_invocation"] = True
                policy_path.parent.mkdir(exist_ok=True)
                policy_path.write_text(yaml.safe_dump(policy, sort_keys=False), encoding="utf-8")
            file_count, references = 0, 0
            for path in original.rglob("*"):
                if not path.is_file():
                    continue
                relative = path.relative_to(original)
                copied = installed / relative
                file_count += 1
                if not copied.is_file():
                    issues.append(f"Missing supporting file: {name}/{relative}")
                elif relative.as_posix() != "agents/openai.yaml" and digest(path) != digest(copied):
                    issues.append(f"Changed supporting file: {name}/{relative}")
            body = (installed / "SKILL.md").read_text(encoding="utf-8")
            frontmatter = yaml.safe_load(body.split("---", 2)[1])
            if frontmatter.get("name") != name or not isinstance(frontmatter.get("description"), str):
                issues.append(f"Invalid trigger metadata: {name}")
            for target in re.findall(r"\]\(([^)]+)\)", body):
                target = target.split("#", 1)[0]
                if not target or ":" in target or target.startswith("/"):
                    continue
                # Check actual local supporting references, not example project paths.
                if (original / target).is_file():
                    references += 1
                    if not (installed / target).is_file():
                        issues.append(f"Broken installed reference: {name}/{target}")
            policy = (yaml.safe_load(policy_path.read_text(encoding="utf-8")) if policy_path.exists() else {}) or {}
            if policy.get("policy", {}).get("allow_implicit_invocation") is not True:
                issues.append(f"Implicit invocation not enabled: {name}")
            results.append({"name": name, "repo": entry["repo"], "sha": source["sha"], "repositoryStarsAtReview": source["stars"], "path": str(installed), "sourceFilesVerified": file_count, "localReferencesVerified": references, "skillSha256": digest(installed / "SKILL.md"), "implicitInvocation": policy.get("policy", {}).get("allow_implicit_invocation") is True})
    report = {"installed": len(results), "supportingFilesVerified": sum(item["sourceFilesVerified"] for item in results), "localReferencesVerified": sum(item["localReferencesVerified"] for item in results), "issues": issues, "skills": results}
    (ROOT / "docs/skills/discovery-verification.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "skills"}, indent=2))
    return bool(issues)


if __name__ == "__main__":
    sys.exit(main())
