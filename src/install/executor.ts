import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { ensureDir, symlinkForce } from "../infrastructure/symlink.ts";
import { installCliWrapper } from "./cli-wrapper.ts";
import {
  homeBinFur,
  homeDir,
  OBSOLETE_SKILLS,
  repoRoot,
  skillHostTargets,
  skillsDir,
} from "../lib/paths.ts";
import type { InstallOptions } from "./types.ts";

export interface InstallResult {
  readonly installedSkills: string[];
}

export async function executeInstall(
  options: InstallOptions,
  root = repoRoot(),
): Promise<InstallResult> {
  const home = homeDir();
  const hosts = skillHostTargets(home).filter((h) =>
    options.hosts.includes(h.id),
  );

  for (const host of hosts) {
    await ensureDir(host.dir);
  }

  if (options.installCli) {
    await ensureDir(join(home, "bin"));
  }

  if (options.installOpencode) {
    await ensureDir(join(home, ".config", "opencode", "commands"));
  }

  if (options.removeObsolete) {
    for (const obsolete of OBSOLETE_SKILLS) {
      for (const host of hosts) {
        const link = join(host.dir, obsolete);
        try {
          if (existsSync(link)) await unlink(link);
        } catch {
          /* ignore */
        }
      }
    }
  }

  const skillsRoot = skillsDir(root);
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const installedSkills: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("fur-")) continue;

    const skillPath = join(skillsRoot, entry.name);
    for (const host of hosts) {
      await symlinkForce(skillPath, join(host.dir, entry.name));
    }
    installedSkills.push(entry.name);
  }

  const shared = join(skillsRoot, "_shared");
  if (existsSync(shared)) {
    for (const host of hosts) {
      await symlinkForce(shared, join(host.dir, "_shared"));
    }
  }

  if (options.installCli) {
    await installCliWrapper(root);
  }

  if (options.installOpencode) {
    const opencodeCmd = join(root, ".opencode", "commands", "clone-website.md");
    if (existsSync(opencodeCmd)) {
      await symlinkForce(
        opencodeCmd,
        join(home, ".config", "opencode", "commands", "clone-website.md"),
      );
    }
  }

  return { installedSkills };
}
