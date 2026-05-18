import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { evalPath, repoRoot, skillsDir } from "../lib/paths.ts";
import { checkEvalMeta } from "../quality/eval-meta.ts";
import { validateAllFrontmatter } from "../quality/frontmatter.ts";
import { lintAllSkills } from "../quality/skill-lint.ts";

const SHARED_PATHS = [
  "src/skills/_shared/overlays/claude.md",
  "src/skills/_shared/overlays/openai-reasoning.md",
  "src/skills/_shared/overlays/generic.md",
  "src/skills/_shared/examples/executor-example.md",
  "src/skills/_shared/examples/gate-example.md",
  "src/skills/_shared/examples/diagnostic-example.md",
  "src/skills/_shared/examples/planner-example.md",
  "src/skills/_shared/examples/orchestrator-example.md",
  "src/skills/_shared/anti-patterns/global.md",
  "src/skills/_shared/anti-patterns/executor.md",
  "src/skills/_shared/anti-patterns/gate.md",
  "src/skills/_shared/anti-patterns/diagnostic.md",
  "src/skills/_shared/anti-patterns/planner.md",
  "src/skills/_shared/anti-patterns/orchestrator.md",
] as const;

const CORE_EVAL_SKILLS = ["fur-task", "fur-do", "fur-check", "fur-debug"] as const;

const REMAINING_EVAL_SKILLS = [
  "fur-init",
  "fur-done",
  "fur-status",
  "fur-ui-design",
  "fur-ui-review",
  "fur-ui-clone",
] as const;

export async function cmdRepoDoctor(): Promise<number> {
  const root = repoRoot();
  let exitCode = 0;

  console.log("fur-skills doctor");
  console.log("=================");
  console.log("");
  console.log(`Repo: ${root}`);
  console.log("");

  console.log("Source skills:");
  const glob = new Bun.Glob("**/SKILL.md");
  const skillFiles: string[] = [];
  for await (const file of glob.scan({ cwd: skillsDir(root), onlyFiles: true })) {
    skillFiles.push(`src/skills/${file}`);
  }
  skillFiles.sort();
  for (const f of skillFiles) console.log(f);
  console.log("");

  console.log("Frontmatter validation:");
  const fm = await validateAllFrontmatter(skillsDir(root));
  for (const line of fm.lines) console.log(line);
  console.log("");
  console.log(`Warnings: ${fm.warns}, Errors: ${fm.errors}`);
  if (fm.errors > 0) exitCode = 1;
  console.log("");

  console.log("Skill lint (v2 sections):");
  const lint = await lintAllSkills(skillsDir(root));
  for (const line of lint.lines) console.log(line);
  console.log("");
  console.log(`Warnings: 0, Errors: ${lint.errors}`);
  if (lint.errors > 0) exitCode = 1;
  console.log("");

  console.log("Installed skills:");
  const installDirs = [
    join(process.env.HOME ?? "", ".claude", "skills"),
    join(process.env.HOME ?? "", ".agents", "skills"),
    join(process.env.HOME ?? "", ".cursor", "skills"),
  ];
  for (const d of installDirs) {
    console.log(`## ${d}`);
    if (existsSync(d)) {
      const mdGlob = new Bun.Glob("**/SKILL.md");
      const files: string[] = [];
      for await (const f of mdGlob.scan({ cwd: d, onlyFiles: true, followSymlinks: true })) {
        files.push(join(d, f));
      }
      files.sort();
      for (const f of files) console.log(f);
    } else {
      console.log("missing");
    }
    console.log("");
  }

  console.log("Non-fur skills:");
  for (const d of installDirs) {
    if (!existsSync(d)) continue;
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !entry.name.startsWith("fur-") &&
        entry.name !== "_shared"
      ) {
        console.log(join(d, entry.name));
      }
    }
  }

  console.log("");
  console.log("GSD leftovers:");
  const gsdDirs = [
    ...installDirs,
    join(process.env.HOME ?? "", ".codex", "skills"),
  ];
  for (const d of gsdDirs) {
    if (!existsSync(d)) continue;
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("gsd-")) {
        console.log(join(d, entry.name));
      }
    }
  }

  console.log("");
  console.log("OpenCode commands:");
  const opencodeDir = join(process.env.HOME ?? "", ".config", "opencode", "commands");
  if (existsSync(opencodeDir)) {
    const entries = await readdir(opencodeDir);
    for (const e of entries.filter((f) => f.endsWith(".md")).sort()) {
      console.log(join(opencodeDir, e));
    }
  } else {
    console.log(`missing: ${opencodeDir}`);
  }

  console.log("");
  console.log("Shared source resources:");
  for (const rel of SHARED_PATHS) {
    const full = join(root, rel);
    if (existsSync(full)) {
      console.log(`- ok: ${rel}`);
    } else {
      console.log(`- missing: ${rel}`);
      exitCode = 1;
    }
  }
  console.log("");

  console.log("Installed shared resources:");
  for (const d of installDirs) {
    const shared = join(d, "_shared");
    if (existsSync(shared)) {
      console.log(`- ok: ${d}/_shared`);
    } else {
      console.log(`- missing: ${d}/_shared`);
    }
  }
  console.log("");

  console.log("Core eval readiness:");
  for (const skill of CORE_EVAL_SKILLS) {
    const code = await checkEvalMeta(skill);
    if (code === 0) {
      console.log(`- ${skill}: eval ready`);
    } else {
      console.log(`- ${skill}: eval NOT ready`);
      exitCode = 1;
    }
  }
  console.log("");

  console.log("Remaining skill eval status:");
  for (const skill of REMAINING_EVAL_SKILLS) {
    if (existsSync(evalPath(skill, root))) {
      console.log(`- ${skill} eval: present`);
    } else {
      console.log(`- ${skill} eval: missing (warning)`);
    }
  }
  console.log("");

  const furInPath = Bun.which("fur");
  if (furInPath) {
    console.log(`fur CLI: ${furInPath}`);
  } else {
    console.log("fur CLI not found in PATH");
  }

  return exitCode;
}
