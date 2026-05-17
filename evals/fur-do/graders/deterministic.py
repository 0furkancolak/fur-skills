#!/usr/bin/env python3
"""
Deterministic grader for fur-do output.
Checks frontmatter, required headings, YAML validity, and basic honesty heuristics.
Usage: python deterministic.py <skill_md_path> <output_md_path>
"""

import sys
import re
import json

def grade(skill_path: str, output_path: str) -> dict:
    with open(skill_path, 'r') as f:
        skill_text = f.read()
    with open(output_path, 'r') as f:
        output_text = f.read()

    results = {
        "frontmatter_ok": False,
        "headings_ok": False,
        "yaml_valid": False,
        "no_fabricated_checks": True,
        "ac_coverage": False,
        "control_plane": False,
        "score": 0,
        "max_score": 6,
        "notes": []
    }

    # 1. Frontmatter presence
    fm = re.search(r'\A---\n(.*?)\n---\n', output_text, re.DOTALL)
    if fm:
        results["frontmatter_ok"] = True
        results["score"] += 1
    else:
        results["notes"].append("Missing frontmatter")

    # 2. Required headings
    required = [
        "## Task Understanding",
        "## Acceptance Criteria Coverage",
        "## Implementation Details",
        "## Files Changed",
        "## Verification",
        "## Risks and Follow-ups"
    ]
    missing = [h for h in required if h not in output_text]
    if not missing:
        results["headings_ok"] = True
        results["score"] += 1
    else:
        results["notes"].append(f"Missing headings: {missing}")

    # 3. YAML control plane
    yaml_block = re.search(r'```yaml\n(.*?)\n```', output_text, re.DOTALL)
    if yaml_block:
        yaml_text = yaml_block.group(1)
        required_keys = ["status", "next_skill", "scope_respected", "verification_state", "risk_level"]
        yaml_ok = all(k in yaml_text for k in required_keys)
        if yaml_ok:
            results["yaml_valid"] = True
            results["score"] += 1
        else:
            results["notes"].append("YAML control plane missing required keys")
    else:
        results["notes"].append("Missing YAML control plane")

    # 4. No fabricated checks (heuristic: look for vague green checks)
    vague_patterns = [r"- .*pass\s*✅\s*\n(?![\s\S]*?`)", r"All tests pass", r"Everything works"]
    for pattern in vague_patterns:
        if re.search(pattern, output_text):
            results["no_fabricated_checks"] = False
            results["notes"].append(f"Possible fabricated check: matched '{pattern}'")
            break
    if results["no_fabricated_checks"]:
        results["score"] += 1

    # 5. AC coverage (look for table or bullet mapping)
    if "| AC |" in output_text or "- AC item" in output_text:
        results["ac_coverage"] = True
        results["score"] += 1
    else:
        results["notes"].append("Missing AC coverage table or bullets")

    # 6. Control plane presence
    if "```yaml" in output_text:
        results["control_plane"] = True
        results["score"] += 1
    else:
        results["notes"].append("Missing control plane block")

    return results

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python deterministic.py <skill_md_path> <output_md_path>")
        sys.exit(1)
    skill_path = sys.argv[1]
    output_path = sys.argv[2]
    results = grade(skill_path, output_path)
    print(json.dumps(results, indent=2))
    if results["score"] < results["max_score"]:
        sys.exit(1)
    sys.exit(0)
