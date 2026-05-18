import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { planningDir } from "../lib/planning.ts";

const SKILL_DIRS = [
  join(process.env.HOME ?? "", ".claude", "skills"),
  join(process.env.HOME ?? "", ".agents", "skills"),
  join(process.env.HOME ?? "", ".cursor", "skills"),
];

const GSD_DIRS = [
  ...SKILL_DIRS,
  join(process.env.HOME ?? "", ".codex", "skills"),
];

async function findSkillMd(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink() || entry.isDirectory()) {
      const skillMd = join(full, "SKILL.md");
      if (existsSync(skillMd)) results.push(skillMd);
    }
  }
  return results.sort();
}

export async function cmdDoctorLocal(): Promise<number> {
  const projectRoot = process.cwd();

  console.log("Fur doctor");
  console.log("==========");
  console.log("");
  console.log(`Project: ${projectRoot}`);
  console.log(`Planning dir: ${planningDir(projectRoot)}`);
  console.log("");

  const furInPath = Bun.which("fur");
  if (furInPath) {
    console.log(`fur CLI: ${furInPath}`);
  } else {
    console.log("fur CLI: not found in PATH");
  }

  console.log("");

  for (const d of SKILL_DIRS) {
    console.log(`## ${d}`);
    if (existsSync(d)) {
      const files = await findSkillMd(d);
      for (const f of files) console.log(f);
    } else {
      console.log("missing");
    }
    console.log("");
  }

  console.log("## Non-fur skills");
  for (const d of SKILL_DIRS) {
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
  console.log("## GSD leftovers");
  for (const d of GSD_DIRS) {
    if (!existsSync(d)) continue;
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("gsd-")) {
        console.log(join(d, entry.name));
      }
    }
  }

  return 0;
}
