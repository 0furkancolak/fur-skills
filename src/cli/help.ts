export function printHelp(): void {
  console.log(`fur - simple personal AI agent workflow helper

Usage:
  fur help
  fur init [--gitignore|--no-gitignore] \\
           [--question-level low|normal|high] \\
           [--project-maturity new|established] \\
           [--response-depth concise|standard|deep] \\
           [--evidence-style paths-only|inline|inline-plus-paths] \\
           [--verification-strictness loose|normal|strict]
  fur workspace init
  fur workspace doctor
  fur refresh
  fur progress
  fur plan list
  fur plan status <slug>
  fur compact
  fur doctor
  fur install [--yes] [--hosts claude,agents,cursor] [--no-cli] [--no-opencode]
  fur uninstall
  fur repo-doctor
  fur eval meta <skill>...
  fur eval grade <skill> <skill_md> <output_md>

Commands:
  init                  Create .fur.planning; TTY prompts, non-TTY defaults
  workspace init        Create .fur.workspace/config.json
  workspace doctor      Validate .fur.workspace/config.json
  refresh               Create a progress snapshot
  progress              Show current progress summary
  plan list             List plans with task/duration rollup
  plan status <slug>    Show manifest progress for one plan
  compact               Archive old progress snapshots
  doctor                Check installation and local state
  install               Interactive install (clack prompts) + pre/post checks
  uninstall             Remove fur skill symlinks and CLI
  repo-doctor           Validate fur-skills repo quality (CI)
  eval meta             Check eval fixture metadata for skill(s)
  eval grade            Run deterministic grader on an output file
`);
}
