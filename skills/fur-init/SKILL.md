---
name: fur-init
description: Initialize `.fur.planning` in the current project with task folders, local behavior config, questionLevel, projectMaturity, and workspace tracker hints. Use when starting the simplified Fur loop in a repo.
disable-model-invocation: true
---

# fur-init

Use this skill when starting the Fur workflow inside a project.

## Goal

Create a clean `.fur.planning` workspace and configure how much the agent should ask before creating tasks.

## When to Use

- Starting work in a new project repo
- Setting up the Fur workflow for the first time
- After cloning a repo that doesn't have `.fur.planning/` yet

## When NOT to Use

- If `.fur.planning/` already exists and is functional
- If you need to implement code (use `fur-do` instead)
- If you need to create tasks (use `fur-task` after init)

## Workflow

1. Choose git mode, project maturity, and question level.
2. From the project root, run `fur init`. In a TTY, it prompts for defaults. In non-TTY/CI, it defaults to `--gitignore`, `--project-maturity new`, and `--question-level high`.

Common explicit command:

```bash
fur init --gitignore --project-maturity new --question-level high
```

For established projects:

```bash
fur init --gitignore --project-maturity established --question-level normal
```

3. Confirm the layout matches **Created Structure**.
4. Confirm `.fur.planning/config.json` includes `questionLevel`, `projectMaturity`, and `questionPolicy`.
5. Check for a parent `.fur.workspace/config.json`.
6. If no workspace config exists, suggest `fur workspace init` for tracker-aware multi-repo work.
7. If workspace config exists but this repo is not registered, report that tracker-aware imports/writes need a `repositories[]` entry.

## Created Structure

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
    archive/     # created when you run fur compact
  context/
    archive/     # optional long digests (see references/context-window.md)
    issue-tracker.md
    mcp.md
    verification.md
```

## Question Levels

- `low`: ask only for blocker ambiguity, unsafe tracker routing, or high-risk irreversible choices.
- `normal`: ask when scope, acceptance criteria, tracker target, or verification is missing.
- `high`: also ask product, edge-case, data, and rollout questions when requirements are thin.

## Rules

- Do not implement code.
- Do not create Jira/GitHub issues.
- Do not over-design the planning system.
- Only initialize the workspace.
- If `.fur.planning/` already exists, report its status instead of reinitializing.
- Repo-local `.fur.planning/config.json` stores local planning metadata only; tracker source selection belongs in `.fur.workspace/config.json`.
- New projects should default to `questionLevel: high`; established projects should usually use `normal`.

## Output

```md
## Initialization Complete

- Created folders: [list]
- .gitignore updated: yes/no
- Planning mode: personal / team
- Question level: low / normal / high
- Project maturity: new / established
- Workspace config: found / not found / repo not registered
```

## Suggested Next Step

`fur-task` for local work or external Jira/GitHub references. For multi-repo tracker routing, first run `fur workspace init` from the workspace root.
