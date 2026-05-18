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
): Promise<PreflightReport> {
  const checks: InstallCheck[] = [];
  const home = homeDir();

  if (!home) {
    checks.push({
      id: "home",
      ok: false,
      message: "HOME ortam değişkeni tanımlı değil",
    });
  } else {
    checks.push({
      id: "home",
      ok: true,
      message: `HOME: ${home}`,
    });
  }

  const bunPath = Bun.which("bun");
  checks.push({
    id: "bun",
    ok: Boolean(bunPath),
    message: bunPath ? `Bun: ${bunPath}` : "Bun PATH içinde bulunamadı",
    hint: bunPath ? undefined : "https://bun.sh adresinden kurun",
  });

  const cliPath = cliEntryPath(root);
  const cliExists = await Bun.file(cliPath).exists();
  checks.push({
    id: "cli-source",
    ok: cliExists,
    message: cliExists
      ? `CLI kaynağı: ${cliPath}`
      : `CLI kaynağı eksik: ${cliPath}`,
  });

  let skillNames: string[] = [];
  try {
    skillNames = await discoverFurSkills(root);
    checks.push({
      id: "skills",
      ok: skillNames.length > 0,
      message:
        skillNames.length > 0
          ? `${skillNames.length} fur skill bulundu`
          : "Kurulacak fur skill bulunamadı",
    });
  } catch {
    checks.push({
      id: "skills",
      ok: false,
      message: `Skills dizini okunamadı: ${skillsDir(root)}`,
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
        ? `${host.label}: ${host.dir}`
        : `${host.label}: yazılamıyor — ${host.dir}`,
    });
  }

  if (options.installCli) {
    const binDir = join(home, "bin");
    const binWritable = await pathWritable(binDir);
    checks.push({
      id: "cli-target",
      ok: binWritable && cliExists,
      message: binWritable
        ? `CLI hedefi: ${homeBinFur()}`
        : `~/bin oluşturulamıyor veya yazılamıyor`,
    });
  }

  if (options.installOpencode) {
    const opencodeSource = join(root, ".opencode", "commands", "clone-website.md");
    const opencodeExists = await Bun.file(opencodeSource).exists();
    checks.push({
      id: "opencode-source",
      ok: true,
      message: opencodeExists
        ? "OpenCode clone-website komutu kurulacak"
        : "OpenCode kaynağı yok — bu adım atlanacak",
    });
  }

  const pathEntries = (process.env.PATH ?? "").split(":");
  const homeBin = join(home, "bin");
  const pathHasHomeBin = pathEntries.includes(homeBin);
  if (options.installCli && !pathHasHomeBin) {
    checks.push({
      id: "path-hint",
      ok: true,
      message: `PATH içinde ~/bin yok — kurulumdan sonra shell config'e eklemeniz gerekebilir`,
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
