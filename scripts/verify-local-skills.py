"""Verify installed skill metadata, original instructions, and GSD references."""
from pathlib import Path
import hashlib
import json
import re
import yaml

project = Path(__file__).resolve().parents[1]
report = json.loads((project / "docs/skills/installation-report.json").read_text())
verified, references, issues = 0, 0, []
for record in report["records"]:
    if record["status"] != "installed":
        continue
    folder = Path(record["destination"])
    raw = (folder / "SKILL.md").read_text(encoding="utf-8-sig")
    frontmatter = yaml.safe_load(raw.split("---", 2)[1])
    policy = yaml.safe_load((folder / "agents/openai.yaml").read_text())
    if frontmatter["name"] != record["name"] or not frontmatter.get("description"):
        issues.append(f"Invalid metadata: {record['name']}")
    if policy["policy"]["allow_implicit_invocation"] is not True:
        issues.append(f"Implicit invocation disabled: {record['name']}")
    source = (Path(record["source"]) / "SKILL.md").read_text(encoding="utf-8-sig")
    original = (folder / "IMPORTED-SKILL.original.md").read_text()
    if hashlib.sha256(source.encode()).digest() != hashlib.sha256(original.encode()).digest():
        issues.append(f"Original instructions changed: {record['name']}")
    if record["name"].startswith("gsd-"):
        for ref in re.findall(r"@(~[/\\][^\s<>]+\.md)", original):
            references += 1
            if not Path(ref).expanduser().exists():
                issues.append(f"Missing GSD reference: {ref}")
    verified += 1
result = {"imported_skills_verified": verified, "external_gsd_references_verified": references, "issues": issues}
(project / "docs/skills/verification-results.json").write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
raise SystemExit(bool(issues))
