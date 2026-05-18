import { en } from "./en.ts";
import { tr } from "./tr.ts";
import type {
  InstallLocale,
  InstallMessages,
  MessageCatalog,
  MessageKey,
  MessageParams,
} from "./types.ts";
import { INSTALL_LOCALES } from "./types.ts";

export type { InstallLocale, InstallMessages, MessageKey, MessageParams };
export { INSTALL_LOCALES };

const catalogs: Record<InstallLocale, MessageCatalog> = { en, tr };

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function createInstallMessages(locale: InstallLocale): InstallMessages {
  const catalog = catalogs[locale];
  return {
    locale,
    t(key: MessageKey, params?: MessageParams): string {
      const template = catalog[key];
      if (!template) return key;
      return interpolate(template, params);
    },
  };
}

export function isInstallLocale(value: string): value is InstallLocale {
  return (INSTALL_LOCALES as readonly string[]).includes(value);
}

/** Detect locale from LANG / LC_ALL (tr* → tr, else en). */
export function detectLocaleFromEnv(
  env: Record<string, string | undefined> = process.env,
): InstallLocale {
  const raw = env.LC_ALL ?? env.LANG ?? "";
  const primary = raw.split(".")[0]?.split("_")[0]?.toLowerCase() ?? "";
  return primary === "tr" ? "tr" : "en";
}

/** Parse --lang from install argv without consuming other flags. */
export function parseLangFromArgs(args: string[]): InstallLocale | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length).toLowerCase();
      if (isInstallLocale(value)) return value;
      return undefined;
    }
    if (arg === "--lang" && args[i + 1]) {
      const value = args[i + 1]!.toLowerCase();
      if (isInstallLocale(value)) return value;
      return undefined;
    }
  }
  return undefined;
}

/**
 * Resolution order: --lang → FUR_LANG → LANG/LC_ALL → en
 */
export function resolveInstallLocale(
  args: string[],
  env: Record<string, string | undefined> = process.env,
): InstallLocale {
  const fromArg = parseLangFromArgs(args);
  if (fromArg) return fromArg;

  const furLang = env.FUR_LANG?.toLowerCase();
  if (furLang && isInstallLocale(furLang)) return furLang;

  return detectLocaleFromEnv(env);
}
