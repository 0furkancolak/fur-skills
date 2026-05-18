import type { GraderProfile } from "./grader-profiles.ts";

export interface GraderResult {
  headings_ok: boolean;
  yaml_valid: boolean;
  no_fabricated_checks: boolean;
  ac_coverage: boolean;
  control_plane: boolean;
  score: number;
  max_score: number;
  notes: string[];
}

const YAML_REQUIRED_KEYS = [
  "status",
  "next_skill",
  "scope_respected",
  "verification_state",
  "risk_level",
];

const VAGUE_PATTERNS = [
  /- .*pass\s*✅\s*\n(?![\s\S]*?`)/,
  /All tests pass/,
  /Everything works/,
];

export function gradeOutput(
  _skillPath: string,
  outputText: string,
  profile: GraderProfile,
): GraderResult {
  const results: GraderResult = {
    headings_ok: false,
    yaml_valid: false,
    no_fabricated_checks: true,
    ac_coverage: false,
    control_plane: false,
    score: 0,
    max_score: 5,
    notes: [],
  };

  const missing = profile.requiredHeadings.filter((h) => !outputText.includes(h));
  if (missing.length === 0) {
    results.headings_ok = true;
    results.score += 1;
  } else {
    results.notes.push(`Missing headings: ${JSON.stringify(missing)}`);
  }

  const yamlBlock = outputText.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlock) {
    const yamlText = yamlBlock[1] ?? "";
    const yamlOk = YAML_REQUIRED_KEYS.every((k) => yamlText.includes(k));
    if (yamlOk) {
      results.yaml_valid = true;
      results.score += 1;
    } else {
      results.notes.push("YAML control plane missing required keys");
    }
  } else {
    results.notes.push("Missing YAML control plane");
  }

  const isBlocked = outputText.includes("status: blocked");
  const hasExplicitFail =
    /\|\s*fail\s*\|/.test(outputText) ||
    /Result:\s*fail/.test(outputText) ||
    /\bfail\s*\|/.test(outputText);

  if (!isBlocked && !hasExplicitFail) {
    for (const pattern of VAGUE_PATTERNS) {
      if (pattern.test(outputText)) {
        results.no_fabricated_checks = false;
        results.notes.push(`Possible fabricated check: matched '${pattern.source}'`);
        break;
      }
    }
  }
  if (results.no_fabricated_checks) {
    results.score += 1;
  }

  const hasAcCoverage =
    outputText.includes("| AC |") || outputText.includes("- AC item");
  if (hasAcCoverage || isBlocked) {
    results.ac_coverage = true;
    results.score += 1;
  } else {
    results.notes.push("Missing AC coverage table or bullets");
  }

  if (outputText.includes("```yaml")) {
    results.control_plane = true;
    results.score += 1;
  } else {
    results.notes.push("Missing control plane block");
  }

  return results;
}

export async function gradeFiles(
  skillPath: string,
  outputPath: string,
  profile: GraderProfile,
): Promise<GraderResult> {
  const outputText = await Bun.file(outputPath).text();
  return gradeOutput(skillPath, outputText, profile);
}
