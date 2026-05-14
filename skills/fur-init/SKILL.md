---
name: fur-init
description: Initialize `.fur.planning` in the current project with task folders, local behavior config, questionLevel, projectMaturity, and workspace tracker hints. Use when starting the simplified Fur loop in a repo.
disable-model-invocation: true
---

# fur-init

Bootstrap the Fur planning workspace so later skills (`fur-task`, `fur-do`, …) have a consistent on-disk contract.

## Goal

Create a clean `.fur.planning/` tree, write `config.json` with `questionLevel` and `projectMaturity`, seed `context/` stubs, and surface workspace (`/.fur.workspace/`) registration status — without implementing product code.

## When to Use

- Starting the Fur loop in a **new** project repository.
- Cloning a repo that has no `.fur.planning/` yet.
- Re-orienting after deleting a broken planning folder (only if the user explicitly wants a fresh init).

## When NOT to Use

- `.fur.planning/` already exists and is valid — report status; do not blindly overwrite `config.json` without user consent.
- You need tasks or implementation — use `fur-task` / `fur-do` after init.
- You only need a progress summary — use `fur-status` or `fur progress`.

## Workflow

### Phase 1: Preconditions

1. Operate from the **project git root** (or the root the user treats as the repo).
2. If `.fur.planning/` exists, list `config.json`, `tasks/*`, and `progress/latest.md`; stop unless the user asked to re-init or repair.
3. Read `references/planning-layout.md` if you need the full layout rationale.

### Phase 2: Run the CLI

1. Choose `questionLevel` and `projectMaturity` using AGENTS.md defaults: **new → `high`**, **established → `normal`** unless the user overrides.
2. Run `fur init` from the project root. In TTY it prompts; in non-TTY/CI it defaults to `--gitignore`, `--project-maturity new`, `--question-level high`.

Non-interactive examples:

```bash
fur init --gitignore --project-maturity new --question-level high
```

```bash
fur init --gitignore --project-maturity established --question-level normal
```

3. If the user must not ignore planning in git, use `--no-gitignore` and explain the tradeoff (commits may include `.fur.planning/`).

### Phase 3: Verify layout and config

1. Confirm the **Created structure** below exists (folders + `README.md` + `context/*.md` stubs).
2. Open `.fur.planning/config.json` and confirm keys: `questionLevel`, `projectMaturity`, `questionPolicy`, `localTaskMode`, `gitignore` (boolean reflects CLI).
3. Optionally run `fur progress` — it may say no snapshot yet; that is OK until the first `fur refresh`.

### Phase 4: Workspace discovery

1. Walk parent directories for `.fur.workspace/config.json` (same behavior as `fur` CLI).
2. If missing: suggest `fur workspace init` from the **workspace root** when multi-repo tracker routing is desired.
3. If present: if this repo path is **not** in `repositories[]`, report that external imports/writes stay blocked until registered.

## Created structure

```txt
.fur.planning/
  README.md
  config.json
  tasks/
    backlog/
    ready/
    done/
  plans/
  progress/
    archive/     # populated by `fur compact`
  context/
    archive/     # optional long digests — see references/context-window.md
    issue-tracker.md
    mcp.md
    verification.md
```

## Question levels

- `low`: ask only for blocker ambiguity, unsafe tracker routing, or high-risk irreversible choices.
- `normal`: ask when scope, acceptance criteria, tracker target, or verification is missing.
- `high`: also ask product, edge-case, data, and rollout questions when requirements are thin.

## Rules

- Do not implement application code or create tracker issues during init.
- Do not over-design folders beyond what `fur init` creates unless the user asks.
- Never delete an existing `.fur.planning/` tree without explicit user approval.
- Repo-local `config.json` is for planning behavior only; tracker routing lives in `.fur.workspace/config.json`.
- Point long explanations to `plans/` or `context/archive/` per `references/context-window.md` instead of bloating chat.

## Output

```md
## Initialization complete

- Project root: [path]
- Created or verified folders: [list]
- .gitignore updated (fur planning): yes / no / skipped
- questionLevel: low | normal | high
- projectMaturity: new | established
- Workspace config: found [path] | not found
- Repo registered in workspace: yes [id] | no (action: add repositories[] entry)
- Next CLI hints: fur refresh | fur task (skill)
```

## Suggested Next Step

`fur-task` to capture the first unit of work, or `fur workspace init` + `fur workspace doctor` if tracker-aware multi-repo setup is needed.
