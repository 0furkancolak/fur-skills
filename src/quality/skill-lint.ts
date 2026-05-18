import { readdir } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";

const REQUIRED_SECTIONS: RegExp[] = [
  /##\s*Identity/i,
  /##\s*Goal/i,
  /##\s*When to Use/i,
  /##\s*When NOT to Use/i,
  /##\s*Workflow/i,
  /##\s*Rules/i,
  /##\s*Output/i,
  /##\s*Anti-patterns/i,
  /##\s*Suggested Next Step/i,
];

function extractFrontmatter(text: string): string | null {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/m);
  return match?.[1] ?? null;
}

export interface LintIssue {
  name: string;
  message: string;
}

export function lintSkillSections(name: string, text: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const fm = extractFrontmatter(text);
  if (!fm) {
    issues.push({ name, message: "skipped (no frontmatter)" });
    return issues;
  }

  let data: Record<string, unknown>;
  try {
    data = YAML.parse(fm) as Record<string, unknown>;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    issues.push({ name, message: `lint error (${msg})` });
    return issues;
  }

  const version = data.skill_version ?? data.skillVersion;
  if (version == null || String(version) !== "2") {
    issues.push({ name, message: "skipped (not v2)" });
    return issues;
  }

  const missing = REQUIRED_SECTIONS.filter((re) => !re.test(text));
  if (missing.length > 0) {
    const names = missing.map((re) =>
      re.source.replace(/\\s\*\?/g, " ").replace(/##\\s\*/g, ""),
    );
    issues.push({
      name,
      message: `missing sections: ${names.join(", ")}`,
    });
  }

  if (!/##\s*Examples/i.test(text)) {
    issues.push({ name, message: "missing Examples section" });
  }

  if (issues.length === 0) {
    issues.push({ name, message: "ok (all sections present)" });
  }

  return issues;
}

export async function lintAllSkills(
  skillsRoot: string,
): Promise<{ errors: number; lines: string[] }> {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const furDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("fur-"))
    .map((e) => e.name)
    .sort();

  let errors = 0;
  const lines: string[] = [];

  for (const name of furDirs) {
    const path = join(skillsRoot, name, "SKILL.md");
    const text = await Bun.file(path).text();
    const issues = lintSkillSections(name, text);
    for (const issue of issues) {
      lines.push(`- ${issue.name}: ${issue.message}`);
      if (
        issue.message.includes("missing sections") ||
        issue.message.includes("missing Examples") ||
        issue.message.startsWith("lint error")
      ) {
        errors++;
      }
    }
  }

  return { errors, lines };
}
