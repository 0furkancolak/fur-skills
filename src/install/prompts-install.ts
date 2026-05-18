import * as p from "@clack/prompts";
import { isCancel } from "@clack/core";
import { join } from "node:path";
import { isTty } from "../lib/prompts.ts";
import {
  homeDir,
  repoRoot,
  skillHostTargets,
  type SkillHostId,
} from "../lib/paths.ts";
import {
  formatChecksForNote,
  hostIdsFromArg,
  runPreflight,
} from "./preflight.ts";
import {
  DEFAULT_INSTALL_OPTIONS,
  type InstallOptions,
  type PostflightReport,
} from "./types.ts";

export interface ParsedInstallArgs {
  readonly nonInteractive: boolean;
  readonly options: Partial<InstallOptions>;
}

export function parseInstallArgs(args: string[]): ParsedInstallArgs {
  let nonInteractive = false;
  const options: Partial<InstallOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--yes" || arg === "-y" || arg === "--non-interactive") {
      nonInteractive = true;
      continue;
    }
    if (arg === "--no-cli") {
      options.installCli = false;
      continue;
    }
    if (arg === "--no-opencode") {
      options.installOpencode = false;
      continue;
    }
    if (arg === "--skip-obsolete") {
      options.removeObsolete = false;
      continue;
    }
    if (arg.startsWith("--hosts=")) {
      const hosts = hostIdsFromArg(arg.slice("--hosts=".length));
      if (hosts) options.hosts = hosts;
      continue;
    }
    if (arg === "--hosts" && args[i + 1]) {
      const hosts = hostIdsFromArg(args[++i]!);
      if (hosts) options.hosts = hosts;
      continue;
    }
  }

  return { nonInteractive, options };
}

function mergeOptions(partial: Partial<InstallOptions>): InstallOptions {
  return { ...DEFAULT_INSTALL_OPTIONS, ...partial };
}

async function promptInstallOptions(
  partial: Partial<InstallOptions>,
): Promise<InstallOptions | null> {
  const root = repoRoot();
  const home = homeDir();
  const targets = skillHostTargets(home);
  const opencodeAvailable = await Bun.file(
    join(root, ".opencode", "commands", "clone-website.md"),
  ).exists();

  p.intro("fur install");

  const hosts = await p.multiselect<SkillHostId>({
    message: "Skill'leri hangi ortamlara kurulsun?",
    options: targets.map((t) => ({
      value: t.id,
      label: t.label,
      hint: t.dir,
    })),
    initialValues: partial.hosts ?? DEFAULT_INSTALL_OPTIONS.hosts,
    required: true,
  });
  if (isCancel(hosts)) {
    p.cancel("Kurulum iptal edildi.");
    return null;
  }

  const installCli = await p.confirm({
    message: "~/bin/fur CLI symlink kurulsun mu?",
    initialValue: partial.installCli ?? true,
  });
  if (isCancel(installCli)) {
    p.cancel("Kurulum iptal edildi.");
    return null;
  }

  let installOpencode = partial.installOpencode ?? true;
  if (opencodeAvailable) {
    const opencodeAnswer = await p.confirm({
      message: "OpenCode clone-website komutu kurulsun mu?",
      initialValue: installOpencode,
    });
    if (isCancel(opencodeAnswer)) {
      p.cancel("Kurulum iptal edildi.");
      return null;
    }
    installOpencode = opencodeAnswer;
  } else {
    p.log.warn("OpenCode kaynağı bulunamadı — clone-website atlanacak.");
    installOpencode = false;
  }

  const removeObsolete = await p.confirm({
    message: "Eski/obsolete fur skill symlink'leri temizlensin mi?",
    initialValue: partial.removeObsolete ?? true,
  });
  if (isCancel(removeObsolete)) {
    p.cancel("Kurulum iptal edildi.");
    return null;
  }

  return {
    hosts: hosts as SkillHostId[],
    installCli,
    installOpencode,
    removeObsolete,
  };
}

export async function resolveInstallOptions(
  args: string[],
): Promise<InstallOptions | null> {
  const parsed = parseInstallArgs(args);
  const merged = mergeOptions(parsed.options);

  if (parsed.nonInteractive || !isTty()) {
    if (!parsed.nonInteractive && !isTty()) {
      p.log.info("TTY yok — varsayılan kurulum seçenekleri kullanılıyor.");
    }
    return merged;
  }

  return promptInstallOptions(parsed.options);
}

export async function confirmPreflight(
  report: Awaited<ReturnType<typeof runPreflight>>,
): Promise<boolean> {
  p.note(formatChecksForNote(report.checks), "Kurulum öncesi kontroller");

  if (!report.canProceed) {
    p.log.error("Kritik kontroller başarısız — kuruluma devam edilemiyor.");
    return false;
  }

  const proceed = await p.confirm({
    message: "Kuruluma devam edilsin mi?",
    initialValue: true,
  });
  if (isCancel(proceed)) {
    p.cancel("Kurulum iptal edildi.");
    return false;
  }
  return proceed;
}

export function showPostflight(
  report: PostflightReport,
  options: InstallOptions,
): void {
  p.note(
    formatChecksForNote(report.checks),
    report.allOk ? "Kurulum sonrası — tamam" : "Kurulum sonrası — sorunlar var",
  );

  if (options.installCli) {
    const homeBin = join(homeDir(), "bin");
    const pathEnv = process.env.PATH ?? "";
    if (!pathEnv.split(":").includes(homeBin)) {
      p.log.warn(
        'PATH içinde ~/bin yok. Shell config\'e ekleyin:\n  export PATH="$HOME/bin:$PATH"',
      );
    }
  }

  if (report.allOk) {
    p.outro("Kurulum tamamlandı. `fur help` ile deneyebilirsiniz.");
  } else {
    p.outro("Kurulum bitti ancak bazı kontroller başarısız — yukarıyı inceleyin.");
  }
}
