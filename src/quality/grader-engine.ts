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
    yaml_valid: true,
    no_fabricated_checks: true,
    ac_coverage: false,
    control_plane: false,
    score: 0,
    max_score: 3,
    notes: [],
  };

  const missing = profile.requiredHeadings.filter((h) => !outputText.includes(h));
  if (missing.length === 0) {
    results.headings_ok = true;
    results.score += 1;
  } else {
    results.notes.push(`Missing headings: ${JSON.stringify(missing)}`);
  }

  const isBlocked =
    outputText.includes("status: blocked") ||
    /blocked/i.test(outputText);
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
    results.notes.push("Legacy control-plane YAML present (optional; prefer plain text)");
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
