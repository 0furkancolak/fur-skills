import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { executeInstall } from "../install/executor.ts";
import { createInstallMessages, resolveInstallLocale } from "../install/i18n/index.ts";
import { runPostflight } from "../install/postflight.ts";
import { runPreflight } from "../install/preflight.ts";
import {
  confirmPreflight,
  parseInstallArgs,
  resolveInstallOptions,
  showPostflight,
} from "../install/prompts-install.ts";
import { homeBinFur, skillHostTargets } from "../lib/paths.ts";

export async function cmdInstall(args: string[] = []): Promise<number> {
  const parsed = parseInstallArgs(args);
  if (parsed.invalidLang) {
    console.error("Invalid --lang. Use: en | tr");
    return 1;
  }

  const options = await resolveInstallOptions(args);
  if (!options) return 1;

  const m = createInstallMessages(options.locale);
  const preflight = await runPreflight(options, undefined, m);
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const nonInteractive = parsed.nonInteractive;

  if (interactive && !nonInteractive) {
    const proceed = await confirmPreflight(preflight, m);
    if (!proceed) return 1;
  } else {
    for (const check of preflight.checks) {
      const prefix = check.ok ? "✓" : "✗";
      console.log(`${prefix} ${check.message}`);
    }
    if (!preflight.canProceed) {
      console.error(`\n${m.t("cli.criticalFailed")}`);
      return 1;
    }
  }

  const spinner = p.spinner();
  spinner.start(m.t("cli.installing"));

  let result;
  try {
    result = await executeInstall(options);
    spinner.stop(
      m.t("cli.skillsInstalled", {
        count: result.installedSkills.length,
        names: result.installedSkills.join(", "),
      }),
    );
  } catch (e) {
    spinner.stop(m.t("cli.installFailed"));
    const msg = e instanceof Error ? e.message : String(e);
    p.log.error(msg);
    return 1;
  }

  const postflight = await runPostflight(options, result.installedSkills, undefined, m);

  if (interactive && !nonInteractive) {
    showPostflight(postflight, options, m);
  } else {
    for (const check of postflight.checks) {
      const prefix = check.ok ? "✓" : "✗";
      console.log(`${prefix} ${check.message}`);
    }
    console.log(
      postflight.allOk
        ? `\n${m.t("cli.installDone")}`
        : `\n${m.t("cli.installDoneIssues")}`,
    );
  }

  return postflight.allOk ? 0 : 1;
}

export async function cmdUninstall(args: string[] = []): Promise<number> {
  const locale = resolveInstallLocale(args);
  const m = createInstallMessages(locale);
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (interactive) p.intro(m.t("uninstall.intro"));

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
    p.outro(m.t("uninstall.done", { count: removed }));
  } else {
    console.log(m.t("uninstall.nonInteractiveDone", { count: removed }));
  }
  return 0;
}
