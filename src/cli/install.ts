import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { isCancel } from "@clack/core";
import { executeInstall } from "../install/executor.ts";
import { runPostflight } from "../install/postflight.ts";
import { runPreflight } from "../install/preflight.ts";
import {
  confirmPreflight,
  resolveInstallOptions,
  showPostflight,
} from "../install/prompts-install.ts";
import { homeBinFur, skillHostTargets } from "../lib/paths.ts";

export async function cmdInstall(args: string[] = []): Promise<number> {
  const options = await resolveInstallOptions(args);
  if (!options) return 1;

  const preflight = await runPreflight(options);
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const parsed = args.some((a) => a === "--yes" || a === "-y" || a === "--non-interactive");

  if (interactive && !parsed) {
    const proceed = await confirmPreflight(preflight);
    if (!proceed) return 1;
  } else {
    for (const check of preflight.checks) {
      const prefix = check.ok ? "✓" : "✗";
      console.log(`${prefix} ${check.message}`);
    }
    if (!preflight.canProceed) {
      console.error("\nKritik kontroller başarısız — kurulum iptal.");
      return 1;
    }
  }

  const spinner = p.spinner();
  spinner.start("Kuruluyor…");

  let result;
  try {
    result = await executeInstall(options);
    spinner.stop(
      `${result.installedSkills.length} skill kuruldu: ${result.installedSkills.join(", ")}`,
    );
  } catch (e) {
    spinner.stop("Kurulum başarısız");
    const msg = e instanceof Error ? e.message : String(e);
    p.log.error(msg);
    return 1;
  }

  const postflight = await runPostflight(options, result.installedSkills);

  if (interactive && !parsed) {
    showPostflight(postflight, options);
  } else {
    for (const check of postflight.checks) {
      const prefix = check.ok ? "✓" : "✗";
      console.log(`${prefix} ${check.message}`);
    }
    console.log(postflight.allOk ? "\nKurulum tamamlandı." : "\nKurulum bitti — sorunlar var.");
  }

  return postflight.allOk ? 0 : 1;
}

export async function cmdUninstall(): Promise<number> {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (interactive) p.intro("fur uninstall");

  const hosts = skillHostTargets();
  let removed = 0;

  for (const host of hosts) {
    if (!existsSync(host.dir)) continue;
    const entries = await readdir(host.dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith("fur-") || entry.name === "_shared") {
        try {
          await unlink(join(host.dir, entry.name));
          removed++;
        } catch {
          /* ignore */
        }
      }
    }
  }

  const furBin = homeBinFur();
  try {
    if (existsSync(furBin)) {
      await unlink(furBin);
      removed++;
    }
  } catch {
    /* ignore */
  }

  if (interactive) {
    p.outro(`${removed} symlink kaldırıldı.`);
  } else {
    console.log(`Uninstalled ${removed} symlink(s).`);
  }
  return 0;
}
