import type { SkillHostId } from "../lib/paths.ts";

export interface InstallOptions {
  hosts: SkillHostId[];
  installCli: boolean;
  installOpencode: boolean;
  removeObsolete: boolean;
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

export const DEFAULT_INSTALL_OPTIONS: InstallOptions = {
  hosts: ["claude", "agents", "cursor"],
  installCli: true,
  installOpencode: true,
  removeObsolete: true,
};
