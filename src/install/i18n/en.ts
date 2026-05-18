import type { MessageCatalog } from "./types.ts";

export const en: MessageCatalog = {
  "install.intro": "fur install",
  "install.cancelled": "Installation cancelled.",
  "install.doneOk": "Installation complete. Try `fur help`.",
  "install.doneIssues":
    "Installation finished but some checks failed — review the output above.",
  "install.noTtyDefaults": "No TTY — using default install options.",

  "prompt.language": "Installation language",
  "prompt.languageEn": "English",
  "prompt.languageTr": "Türkçe",
  "prompt.hosts": "Install skills to which environments?",
  "prompt.installCli": "Install ~/bin/fur CLI launcher?",
  "prompt.installOpencode": "Install OpenCode clone-website command?",
  "prompt.removeObsolete": "Remove obsolete fur skill symlinks?",
  "prompt.continueInstall": "Continue with installation?",
  "prompt.opencodeSourceMissing":
    "OpenCode source not found — clone-website will be skipped.",

  "note.preflightTitle": "Pre-install checks",
  "note.postflightOk": "Post-install — all good",
  "note.postflightIssues": "Post-install — issues found",

  "preflight.homeMissing": "HOME environment variable is not set",
  "preflight.homeOk": "HOME: {home}",
  "preflight.bunMissing": "Bun not found on PATH",
  "preflight.bunFound": "Bun: {path}",
  "preflight.bunHint": "Install from https://bun.sh",
  "preflight.cliSourceOk": "CLI source: {path}",
  "preflight.cliSourceMissing": "CLI source missing: {path}",
  "preflight.skillsFound": "{count} fur skills found",
  "preflight.skillsMissing": "No fur skills found to install",
  "preflight.skillsDirUnreadable": "Cannot read skills directory: {path}",
  "preflight.hostOk": "{label}: {dir}",
  "preflight.hostNotWritable": "{label}: not writable — {dir}",
  "preflight.cliTargetOk": "CLI target: {path}",
  "preflight.cliTargetFail": "Cannot create or write ~/bin",
  "preflight.opencodeWillInstall": "OpenCode clone-website command will be installed",
  "preflight.opencodeWillSkip": "OpenCode source missing — step will be skipped",
  "preflight.pathHint":
    "~/bin is not on PATH — you may need to add it to your shell config after install",
  "preflight.criticalFailed": "Critical checks failed — cannot continue.",

  "postflight.symlinkBad": "{label} / {skill} — symlink missing or invalid",
  "postflight.sharedBad": "{label} / _shared — symlink invalid",
  "postflight.cliExecutable": "fur CLI (executable): {path}",
  "postflight.cliNotExecutable": "fur CLI not executable: {path}",
  "postflight.cliRunOk": "`fur help` ran successfully via PATH",
  "postflight.cliRunFail": "`fur help` failed (exit {code})",
  "postflight.opencodeOk": "OpenCode clone-website command",
  "postflight.opencodeBad": "OpenCode symlink missing or invalid",

  "cli.criticalFailed": "Critical checks failed — installation aborted.",
  "cli.installing": "Installing…",
  "cli.installFailed": "Installation failed",
  "cli.skillsInstalled": "{count} skills installed: {names}",
  "cli.installDone": "Installation complete.",
  "cli.installDoneIssues": "Installation finished — see issues above.",

  "uninstall.intro": "fur uninstall",
  "uninstall.done": "{count} symlink(s) removed.",
  "uninstall.nonInteractiveDone": "Uninstalled {count} symlink(s).",

  "warn.pathMissing":
    'PATH does not include ~/bin. Add to your shell config:\n  export PATH="$HOME/bin:$PATH"',
};
