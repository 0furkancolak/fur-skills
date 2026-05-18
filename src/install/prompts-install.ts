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
  createInstallMessages,
  isInstallLocale,
  parseLangFromArgs,
  resolveInstallLocale,
  type InstallLocale,
  type InstallMessages,
} from "./i18n/index.ts";
import {
  formatChecksForNote,
  hostIdsFromArg,
  runPreflight,
} from "./preflight.ts";
import {
  defaultInstallOptions,
  type InstallOptions,
  type PostflightReport,
} from "./types.ts";

export interface ParsedInstallArgs {
  readonly nonInteractive: boolean;
  readonly options: Partial<InstallOptions>;
  readonly langExplicit: boolean;
  readonly invalidLang: boolean;
}

export function parseInstallArgs(args: string[]): ParsedInstallArgs {
  let nonInteractive = false;
  const options: Partial<InstallOptions> = {};
  let langExplicit = false;
  let invalidLang = false;

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
    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length).toLowerCase();
      langExplicit = true;
      if (isInstallLocale(value)) options.locale = value;
      else invalidLang = true;
      continue;
    }
    if (arg === "--lang" && args[i + 1]) {
      const value = args[++i]!.toLowerCase();
      langExplicit = true;
      if (isInstallLocale(value)) options.locale = value;
      else invalidLang = true;
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

  return { nonInteractive, options, langExplicit, invalidLang };
}

function mergeOptions(partial: Partial<InstallOptions>): InstallOptions {
  const locale =
    partial.locale ?? resolveInstallLocale([]);
  return { ...defaultInstallOptions(locale), ...partial, locale: partial.locale ?? locale };
}

async function promptLanguage(
  initial: InstallLocale,
  m: InstallMessages,
): Promise<InstallLocale | null> {
  const choice = await p.select<InstallLocale>({
    message: m.t("prompt.language"),
    options: [
      { value: "en", label: m.t("prompt.languageEn") },
      { value: "tr", label: m.t("prompt.languageTr") },
    ],
    initialValue: initial,
  });
  if (isCancel(choice)) return null;
  return choice;
}

async function promptInstallOptions(
  partial: Partial<InstallOptions>,
  langExplicit: boolean,
): Promise<InstallOptions | null> {
  const root = repoRoot();
  const home = homeDir();
  const targets = skillHostTargets(home);
  const opencodeAvailable = await Bun.file(
    join(root, ".opencode", "commands", "clone-website.md"),
  ).exists();

  let locale = partial.locale ?? resolveInstallLocale([]);
  let m = createInstallMessages(locale);

  p.intro(m.t("install.intro"));

  if (!langExplicit) {
    const picked = await promptLanguage(locale, m);
    if (picked === null) {
      p.cancel(m.t("install.cancelled"));
      return null;
    }
    locale = picked;
    m = createInstallMessages(locale);
  }

  const hosts = await p.multiselect<SkillHostId>({
    message: m.t("prompt.hosts"),
    options: targets.map((t) => ({
      value: t.id,
      label: t.label,
      hint: t.dir,
    })),
    initialValues: partial.hosts ?? defaultInstallOptions(locale).hosts,
    required: true,
  });
  if (isCancel(hosts)) {
    p.cancel(m.t("install.cancelled"));
    return null;
  }

  const installCli = await p.confirm({
    message: m.t("prompt.installCli"),
    initialValue: partial.installCli ?? true,
  });
  if (isCancel(installCli)) {
    p.cancel(m.t("install.cancelled"));
    return null;
  }

  let installOpencode = partial.installOpencode ?? true;
  if (opencodeAvailable) {
    const opencodeAnswer = await p.confirm({
      message: m.t("prompt.installOpencode"),
      initialValue: installOpencode,
    });
    if (isCancel(opencodeAnswer)) {
      p.cancel(m.t("install.cancelled"));
      return null;
    }
    installOpencode = opencodeAnswer;
  } else {
    p.log.warn(m.t("prompt.opencodeSourceMissing"));
    installOpencode = false;
  }

  const removeObsolete = await p.confirm({
    message: m.t("prompt.removeObsolete"),
    initialValue: partial.removeObsolete ?? true,
  });
  if (isCancel(removeObsolete)) {
    p.cancel(m.t("install.cancelled"));
    return null;
  }

  return {
    hosts: hosts as SkillHostId[],
    installCli,
    installOpencode,
    removeObsolete,
    locale,
  };
}

export async function resolveInstallOptions(
  args: string[],
): Promise<InstallOptions | null> {
  const parsed = parseInstallArgs(args);
  const merged = mergeOptions(parsed.options);

  if (parsed.nonInteractive || !isTty()) {
    if (!parsed.nonInteractive && !isTty()) {
      const m = createInstallMessages(merged.locale);
      p.log.info(m.t("install.noTtyDefaults"));
    }
    return merged;
  }

  return promptInstallOptions(parsed.options, parsed.langExplicit);
}

export async function confirmPreflight(
  report: Awaited<ReturnType<typeof runPreflight>>,
  messages: InstallMessages,
): Promise<boolean> {
  p.note(formatChecksForNote(report.checks), messages.t("note.preflightTitle"));

  if (!report.canProceed) {
    p.log.error(messages.t("preflight.criticalFailed"));
    return false;
  }

  const proceed = await p.confirm({
    message: messages.t("prompt.continueInstall"),
    initialValue: true,
  });
  if (isCancel(proceed)) {
    p.cancel(messages.t("install.cancelled"));
    return false;
  }
  return proceed;
}

export function showPostflight(
  report: PostflightReport,
  options: InstallOptions,
  messages: InstallMessages = createInstallMessages(options.locale),
): void {
  p.note(
    formatChecksForNote(report.checks),
    report.allOk
      ? messages.t("note.postflightOk")
      : messages.t("note.postflightIssues"),
  );

  if (options.installCli) {
    const homeBin = join(homeDir(), "bin");
    const pathEnv = process.env.PATH ?? "";
    if (!pathEnv.split(":").includes(homeBin)) {
      p.log.warn(messages.t("warn.pathMissing"));
    }
  }

  if (report.allOk) {
    p.outro(messages.t("install.doneOk"));
  } else {
    p.outro(messages.t("install.doneIssues"));
  }
}

export { parseLangFromArgs, resolveInstallLocale };
