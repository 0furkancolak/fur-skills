import { access, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import {
  cliEntryPath,
  homeBinFur,
  homeDir,
  repoRoot,
  skillHostTargets,
  skillsDir,
  type SkillHostId,
} from "../lib/paths.ts";
import type { InstallMessages } from "./i18n/index.ts";
import { createInstallMessages } from "./i18n/index.ts";
import type { InstallCheck, InstallOptions, PreflightReport } from "./types.ts";

async function pathWritable(dir: string): Promise<boolean> {
  try {
    await access(dir, constants.W_OK);
    return true;
  } catch {
    try {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(dir, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

async function discoverFurSkills(root: string): Promise<string[]> {
  const skillsRoot = skillsDir(root);
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith("fur-"))
    .map((e) => e.name)
    .sort();
}

export async function runPreflight(
  options: InstallOptions,
  root = repoRoot(),
  messages: InstallMessages = createInstallMessages(options.locale),
): Promise<PreflightReport> {
  const m = messages;
  const checks: InstallCheck[] = [];
  const home = homeDir();

  if (!home) {
    checks.push({
      id: "home",
      ok: false,
      message: m.t("preflight.homeMissing"),
    });
  } else {
    checks.push({
      id: "home",
      ok: true,
      message: m.t("preflight.homeOk", { home }),
    });
  }

  const bunPath = Bun.which("bun");
  checks.push({
    id: "bun",
    ok: Boolean(bunPath),
    message: bunPath
      ? m.t("preflight.bunFound", { path: bunPath })
      : m.t("preflight.bunMissing"),
    hint: bunPath ? undefined : m.t("preflight.bunHint"),
  });

  const cliPath = cliEntryPath(root);
  const cliExists = await Bun.file(cliPath).exists();
  checks.push({
    id: "cli-source",
    ok: cliExists,
    message: cliExists
      ? m.t("preflight.cliSourceOk", { path: cliPath })
      : m.t("preflight.cliSourceMissing", { path: cliPath }),
  });

  let skillNames: string[] = [];
  try {
    skillNames = await discoverFurSkills(root);
    checks.push({
      id: "skills",
      ok: skillNames.length > 0,
      message:
        skillNames.length > 0
          ? m.t("preflight.skillsFound", { count: skillNames.length })
          : m.t("preflight.skillsMissing"),
    });
  } catch {
    checks.push({
      id: "skills",
      ok: false,
      message: m.t("preflight.skillsDirUnreadable", { path: skillsDir(root) }),
    });
  }

  const selectedHosts = skillHostTargets(home).filter((h) =>
    options.hosts.includes(h.id),
  );

  for (const host of selectedHosts) {
    const writable = await pathWritable(host.dir);
    checks.push({
      id: `host-${host.id}`,
      ok: writable,
      message: writable
        ? m.t("preflight.hostOk", { label: host.label, dir: host.dir })
        : m.t("preflight.hostNotWritable", { label: host.label, dir: host.dir }),
    });
  }

  if (options.installCli) {
    const binDir = join(home, "bin");
    const binWritable = await pathWritable(binDir);
    checks.push({
      id: "cli-target",
      ok: binWritable && cliExists,
      message: binWritable
        ? m.t("preflight.cliTargetOk", { path: homeBinFur() })
        : m.t("preflight.cliTargetFail"),
    });
  }

  if (options.installOpencode) {
    const opencodeSource = join(root, ".opencode", "commands", "clone-website.md");
    const opencodeExists = await Bun.file(opencodeSource).exists();
    checks.push({
      id: "opencode-source",
      ok: true,
      message: opencodeExists
        ? m.t("preflight.opencodeWillInstall")
        : m.t("preflight.opencodeWillSkip"),
    });
  }

  const pathEntries = (process.env.PATH ?? "").split(":");
  const homeBin = join(home, "bin");
  const pathHasHomeBin = pathEntries.includes(homeBin);
  if (options.installCli && !pathHasHomeBin) {
    checks.push({
      id: "path-hint",
      ok: true,
      message: m.t("preflight.pathHint"),
      hint: 'export PATH="$HOME/bin:$PATH"',
    });
  }

  const blocking = checks.filter((c) => !c.ok);
  const canProceed = blocking.length === 0 && skillNames.length > 0;

  return {
    checks,
    skillNames,
    repoRoot: root,
    canProceed,
  };
}

export function formatChecksForNote(checks: InstallCheck[]): string {
  return checks
    .map((c) => {
      const icon = c.ok ? "✓" : "✗";
      const hint = c.hint ? `\n  → ${c.hint}` : "";
      return `${icon} ${c.message}${hint}`;
    })
    .join("\n");
}

export function hostIdsFromArg(value: string): SkillHostId[] | null {
  const valid: SkillHostId[] = ["claude", "agents", "cursor"];
  const parts = value.split(",").map((p) => p.trim()) as SkillHostId[];
  if (parts.length === 0) return null;
  if (!parts.every((p) => valid.includes(p))) return null;
  return parts;
}
