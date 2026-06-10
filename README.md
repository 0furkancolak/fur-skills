# Agent context toolkit

Bun/TypeScript CLI + agent skills for project context under `docs/ai/`.

Agent rules: `AGENTS.md`. Claude entry: `CLAUDE.md` → `AGENTS.md` only.

## What it does

1. **`fur init`** — create or refresh `docs/ai/` (config, context files, task folders), update `AGENTS.md` block, set `CLAUDE.md` redirect.
2. **Optional skills** — task tracking (`fur-task`, `fur-do`, `fur-done`), status, ship, session handoff, UI helpers. Each skill is standalone; combine with superpowers or other toolchains as you like.
3. **`fur install`** — symlink skills to `~/.claude/skills`, `~/.cursor/skills`, etc.

## Quick start

```bash
bun install
fur install          # or: bun src/cli.ts install
export PATH="$HOME/bin:$PATH"

cd /your/project
fur init
```

Non-interactive:

```bash
fur init --gitignore --project-maturity established --question-level normal
```

## Context layout

See `AGENTS.md` and `src/references/context-window.md`.

```txt
docs/ai/
  config.json
  progress/latest.md
  context/{architecture,verification,mcp,issue-tracker,conventions}.md
  tasks/{backlog,ready,done}/
  plans/
```

Re-run `fur init` after scripts, layout, or agent rules change.

## Skills (independent)

| Skill | Role |
|-------|------|
| `fur-init` | Init/refresh `docs/ai` and agent routing |
| `fur-task` | Optional local task files |
| `fur-do` | Implement one scoped task |
| `fur-done` | Close verified task, snapshot progress |
| `fur-status` | Queue/progress orientation |
| `fur-session-handoff` | Turkish continuation prompt |
| `fur-ship` | Branch/PR prep (approval gates) |
| `fur-ui-design` | UI direction before code |
| `fur-ui-clone` | Website clone pipeline |
| `fur-ui-review` | Implemented UI review |

## Config (`docs/ai/config.json`)

| Key | Values |
|-----|--------|
| `questionLevel` | `low`, `normal`, `high` |
| `projectMaturity` | `new`, `established` |
| `responseDepth` | `concise`, `standard`, `deep` |
| `evidenceStyle` | `paths-only`, `inline`, `inline-plus-paths` |
| `verificationStrictness` | `loose`, `normal`, `strict` |
| `automationMode` | `guided`, `streamlined` |

Workspace tracker: `.fur.workspace/config.json` (multi-repo).

## CLI

| Command | Purpose |
|---------|---------|
| `fur init` | Create/refresh `docs/ai/` |
| `fur refresh` | Progress snapshot + `state.json` |
| `fur progress` | Counts and latest snapshot |
| `fur compact` | Archive old progress files |
| `fur workspace init` / `doctor` | Workspace config |
| `fur install` / `uninstall` | Skill symlinks + CLI |
| `fur repo-doctor` | Validate this repo |
| `fur eval meta <skill>` | Eval fixture check |

## Development

```bash
bun test src/tests
fur repo-doctor
```

References: `src/references/`. Turkish: `src/docs/tr/`.
