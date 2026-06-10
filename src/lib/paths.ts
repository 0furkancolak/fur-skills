import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** fur-skills repository root (parent of src/). */
export function repoRoot(): string {
  if (process.env.FUR_SKILLS_ROOT) {
    return resolve(process.env.FUR_SKILLS_ROOT);
  }
  return resolve(__dirname, "../..");
}

/** Packaged content root (skills, evals, references, docs). */
export function srcRoot(root = repoRoot()): string {
  return join(root, "src");
}

export function skillsDir(root = repoRoot()): string {
  return join(srcRoot(root), "skills");
}

export function evalsDir(root = repoRoot()): string {
  return join(srcRoot(root), "evals");
}

export function referencesDir(root = repoRoot()): string {
  return join(srcRoot(root), "references");
}

export function docsDir(root = repoRoot()): string {
  return join(srcRoot(root), "docs");
}

export function skillPath(name: string, root = repoRoot()): string {
  return join(skillsDir(root), name, "SKILL.md");
}

export function evalPath(name: string, root = repoRoot()): string {
  return join(evalsDir(root), name);
}

/** Executable CLI entry (package.json bin target). */
export function cliEntryPath(root = repoRoot()): string {
  return join(srcRoot(root), "cli.ts");
}

export function homeBinFur(): string {
  return join(process.env.HOME ?? "", "bin", "fur");
}

export type SkillHostId = "claude" | "agents" | "cursor";

export interface SkillHostTarget {
  readonly id: SkillHostId;
  readonly label: string;
  readonly dir: string;
}

export function homeDir(): string {
  return process.env.HOME ?? "";
}

export function skillHostTargets(home = homeDir()): SkillHostTarget[] {
  return [
    {
      id: "claude",
      label: "Claude Code",
      dir: join(home, ".claude", "skills"),
    },
    {
      id: "agents",
      label: "Codex / Agents",
      dir: join(home, ".agents", "skills"),
    },
    {
      id: "cursor",
      label: "Cursor",
      dir: join(home, ".cursor", "skills"),
    },
  ];
}

/** @deprecated Use skillHostTargets() for install flows. */
export const SKILL_INSTALL_DIRS = skillHostTargets().map((h) => h.dir);

export const OBSOLETE_SKILLS = [
  "fur-parallel",
  "fur-quick",
  "fur-task-write",
  "fur-task-import",
  "fur-task-external-write",
  "fur-task-pick",
  "fur-implement",
  "fur-review",
  "fur-task-done",
  "fur-refresh",
  "fur-progress",
  "fur-grill",
  "fur-simplify",
  "fur-check",
  "fur-debug",
] as const;
