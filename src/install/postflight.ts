import { existsSync } from "node:fs";
import { access, readlink } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import {
  homeBinFur,
  homeDir,
  repoRoot,
  skillHostTargets,
  skillsDir,
} from "../lib/paths.ts";
import type { InstallMessages } from "./i18n/index.ts";
import { createInstallMessages } from "./i18n/index.ts";
import type { InstallCheck, InstallOptions, PostflightReport } from "./types.ts";

async function symlinkTarget(linkPath: string): Promise<string | null> {
  if (!existsSync(linkPath)) return null;
  try {
    const target = await readlink(linkPath);
    return resolve(join(linkPath, ".."), target);
  } catch {
    return null;
  }
}

export async function runPostflight(
  options: InstallOptions,
  installedSkills: string[],
  root = repoRoot(),
  messages: InstallMessages = createInstallMessages(options.locale),
): Promise<PostflightReport> {
  const m = messages;
  const checks: InstallCheck[] = [];
  const home = homeDir();
  const skillsRoot = skillsDir(root);

  for (const host of skillHostTargets(home)) {
    if (!options.hosts.includes(host.id)) continue;

    for (const skill of installedSkills) {
      const link = join(host.dir, skill);
      const expected = join(skillsRoot, skill);
      const actual = await symlinkTarget(link);
      const ok = actual !== null && resolve(actual) === resolve(expected);
      checks.push({
        id: `symlink-${host.id}-${skill}`,
        ok,
        message: ok
          ? `${host.label} / ${skill}`
          : m.t("postflight.symlinkBad", { label: host.label, skill }),
      });
    }

    if (installedSkills.length > 0) {
      const sharedLink = join(host.dir, "_shared");
      const expectedShared = join(skillsRoot, "_shared");
      const actualShared = await symlinkTarget(sharedLink);
      const sharedOk =
        !existsSync(expectedShared) ||
        (actualShared !== null &&
          resolve(actualShared) === resolve(expectedShared));
      checks.push({
        id: `symlink-${host.id}-shared`,
        ok: sharedOk,
        message: sharedOk
          ? `${host.label} / _shared`
          : m.t("postflight.sharedBad", { label: host.label }),
      });
    }
  }

  if (options.installCli) {
    const cliLink = homeBinFur();
    let executable = false;
    try {
      await access(cliLink, constants.X_OK);
      executable = existsSync(cliLink);
    } catch {
      executable = false;
    }

    checks.push({
      id: "cli-wrapper",
      ok: executable,
      message: executable
        ? m.t("postflight.cliExecutable", { path: cliLink })
        : m.t("postflight.cliNotExecutable", { path: cliLink }),
    });

    if (executable) {
      const proc = Bun.spawn([cliLink, "help"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const code = await proc.exited;
      checks.push({
        id: "cli-run",
        ok: code === 0,
        message:
          code === 0
            ? m.t("postflight.cliRunOk")
            : m.t("postflight.cliRunFail", { code }),
      });
    }
  }

  if (options.installOpencode) {
    const opencodeLink = join(
      home,
      ".config",
      "opencode",
      "commands",
      "clone-website.md",
    );
    const opencodeExpected = join(
      root,
      ".opencode",
      "commands",
      "clone-website.md",
    );
    if (existsSync(opencodeExpected)) {
      const actual = await symlinkTarget(opencodeLink);
      const ok =
        actual !== null && resolve(actual) === resolve(opencodeExpected);
      checks.push({
        id: "opencode-symlink",
        ok,
        message: ok
          ? m.t("postflight.opencodeOk")
          : m.t("postflight.opencodeBad"),
      });
    }
  }

  const allOk = checks.every((c) => c.ok);
  return { checks, allOk };
}
