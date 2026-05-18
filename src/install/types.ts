import type { SkillHostId } from "../lib/paths.ts";
import type { InstallLocale } from "./i18n/types.ts";

export type { InstallLocale };

export interface InstallOptions {
  hosts: SkillHostId[];
  installCli: boolean;
  installOpencode: boolean;
  removeObsolete: boolean;
  locale: InstallLocale;
}

export interface InstallCheck {
  readonly id: string;
  readonly ok: boolean;
  readonly message: string;
  readonly hint?: string;
}

export interface PreflightReport {
  readonly checks: InstallCheck[];
  readonly skillNames: string[];
  readonly repoRoot: string;
  readonly canProceed: boolean;
}

export interface PostflightReport {
  readonly checks: InstallCheck[];
  readonly allOk: boolean;
}

export function defaultInstallOptions(
  locale: InstallLocale = "en",
): InstallOptions {
  return {
    hosts: ["claude", "agents", "cursor"],
    installCli: true,
    installOpencode: true,
    removeObsolete: true,
    locale,
  };
}

/** @deprecated Use defaultInstallOptions(resolveInstallLocale([])) */
export const DEFAULT_INSTALL_OPTIONS: InstallOptions = defaultInstallOptions("en");
