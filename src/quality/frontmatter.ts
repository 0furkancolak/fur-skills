import { readdir } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";

export interface FrontmatterIssue {
  name: string;
  message: string;
  level: "error" | "warn";
}

const V2_REQUIRED = [
  "skill_class",
  "default_response_depth",
  "quality_contract",
] as const;

const QC_REQUIRED = [
  "must_map_every_ac",
  "must_report_assumptions",
  "must_report_verification_truthfully",
  "must_call_out_risks",
  "must_include_user_facing_explanation",
  "self_check_required",
] as const;

function extractFrontmatter(text: string): string | null {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/m);
  return match?.[1] ?? null;
}

export function validateSkillFrontmatter(
  name: string,
  text: string,
): FrontmatterIssue | null {
  const fm = extractFrontmatter(text);
  if (!fm) {
    return { name, message: "missing frontmatter", level: "error" };
  }

  let data: Record<string, unknown>;
  try {
    data = YAML.parse(fm) as Record<string, unknown>;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { name, message: `invalid YAML (${msg})`, level: "error" };
  }

  const desc = data.description;
  if (desc == null || String(desc).trim() === "") {
    return { name, message: "missing description", level: "error" };
  }

  const version = data.skill_version ?? data.skillVersion;
  if (version == null) {
    return { name, message: "ok (v1, consider migrating to v2)", level: "warn" };
  }

  if (String(version) !== "2") {
    return { name, message: `ok (v${version})`, level: "warn" };
  }

  const missing = V2_REQUIRED.filter((k) => !(k in data));
  if (missing.length > 0) {
    return {
      name,
      message: `v2 missing fields: ${missing.join(", ")}`,
      level: "error",
    };
  }

  const qc = data.quality_contract as Record<string, unknown> | undefined;
  const qcMissing = QC_REQUIRED.filter((k) => !qc || !(k in qc));
  if (qcMissing.length > 0) {
    return {
      name,
      message: `v2 quality_contract missing: ${qcMissing.join(", ")}`,
      level: "error",
    };
  }

  return { name, message: "ok (v2)", level: "warn" };
}

export async function validateAllFrontmatter(
  skillsRoot: string,
): Promise<{ errors: number; warns: number; lines: string[] }> {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const furDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("fur-"))
    .map((e) => e.name)
    .sort();

  let errors = 0;
  let warns = 0;
  const lines: string[] = [];

  for (const name of furDirs) {
    const path = join(skillsRoot, name, "SKILL.md");
    const text = await Bun.file(path).text();
    const issue = validateSkillFrontmatter(name, text);
    if (!issue) continue;

    if (issue.level === "error") {
      lines.push(`- ${name}: ${issue.message}`);
      errors++;
    } else if (issue.message.startsWith("ok (v2)")) {
      lines.push(`- ${name}: ${issue.message}`);
    } else {
      lines.push(`- ${name}: ${issue.message}`);
      warns++;
    }
  }

  return { errors, warns, lines };
}
