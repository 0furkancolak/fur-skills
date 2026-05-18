export type InstallLocale = "en" | "tr";

export const INSTALL_LOCALES: readonly InstallLocale[] = ["en", "tr"];

export type MessageKey =
  | "install.intro"
  | "install.cancelled"
  | "install.doneOk"
  | "install.doneIssues"
  | "install.noTtyDefaults"
  | "prompt.language"
  | "prompt.languageEn"
  | "prompt.languageTr"
  | "prompt.hosts"
  | "prompt.installCli"
  | "prompt.installOpencode"
  | "prompt.removeObsolete"
  | "prompt.continueInstall"
  | "prompt.opencodeSourceMissing"
  | "note.preflightTitle"
  | "note.postflightOk"
  | "note.postflightIssues"
  | "preflight.homeMissing"
  | "preflight.homeOk"
  | "preflight.bunMissing"
  | "preflight.bunFound"
  | "preflight.bunHint"
  | "preflight.cliSourceOk"
  | "preflight.cliSourceMissing"
  | "preflight.skillsFound"
  | "preflight.skillsMissing"
  | "preflight.skillsDirUnreadable"
  | "preflight.hostOk"
  | "preflight.hostNotWritable"
  | "preflight.cliTargetOk"
  | "preflight.cliTargetFail"
  | "preflight.opencodeWillInstall"
  | "preflight.opencodeWillSkip"
  | "preflight.pathHint"
  | "preflight.criticalFailed"
  | "postflight.symlinkBad"
  | "postflight.sharedBad"
  | "postflight.cliExecutable"
  | "postflight.cliNotExecutable"
  | "postflight.cliRunOk"
  | "postflight.cliRunFail"
  | "postflight.opencodeOk"
  | "postflight.opencodeBad"
  | "cli.criticalFailed"
  | "cli.installing"
  | "cli.installFailed"
  | "cli.skillsInstalled"
  | "cli.installDone"
  | "cli.installDoneIssues"
  | "uninstall.intro"
  | "uninstall.done"
  | "uninstall.nonInteractiveDone"
  | "warn.pathMissing";

export type MessageParams = Record<string, string | number>;

export type MessageCatalog = Record<MessageKey, string>;

export interface InstallMessages {
  readonly locale: InstallLocale;
  t(key: MessageKey, params?: MessageParams): string;
}
