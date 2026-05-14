# fur-skills

Personal AI agent skill set for a small, fast project workflow.

## Purpose

Fur keeps project work moving through one simple loop:

```txt
fur-init -> fur-task -> fur-do -> fur-check -> fur-done -> fur-status
                 \-> fur-debug ->/
```

UI-specific work stays separate in the UI skills.

## Principles

- All custom skills start with `fur-`.
- Keep the core loop small; prefer config over extra skills.
- External resources (Jira, GitHub, MCP) are optional; local markdown is the fallback.
- Multi-repo tracker routing lives in `.fur.workspace/config.json`.
- Repo-local behavior lives in `.fur.planning/config.json`.
- Question asking is controlled by `questionLevel`, not a separate planning skill.
- Old context should stay in files, not in chat; use `progress/latest.md` and `fur compact`.

## Installation

```bash
cd /path/to/fur-skills
./scripts/install.sh
```

The `fur` command requires `~/bin` in your PATH:

```bash
export PATH="$HOME/bin:$PATH"
```

Verify:

```bash
fur help
./scripts/doctor.sh
```

The installer also exposes the website clone workflow to OpenCode as:

```txt
/clone-website <url>
```

It symlinks `.opencode/commands/clone-website.md` to `~/.config/opencode/commands/clone-website.md`.

## Quick Start

From a repo:

```bash
fur init
```

Explicit setup:

```bash
fur init --gitignore --project-maturity new --question-level high
fur init --gitignore --project-maturity established --question-level normal
```

For a folder that contains multiple repos:

```bash
fur workspace init
fur workspace doctor
```

## Core Skills

| Skill | Purpose |
|---|---|
| **fur-init** | Create `.fur.planning/`, local behavior config, question level, and workspace hints. |
| **fur-task** | Create/select/split local tasks; import Jira/GitHub references; draft/write external tasks when config permits. |
| **fur-do** | Implement one selected task or tiny clear fix. |
| **fur-check** | Review and verify acceptance criteria, tests, risk, and changed code. |
| **fur-done** | Move verified task to done, snapshot progress, and sync tracker completion when config permits. |
| **fur-status** | Show task counts, latest snapshot, tracker sync state, and one next action. |
| **fur-debug** | Diagnose unknown root cause with a phase-based debugging loop. |

## UI Skills

| Skill | Purpose |
|---|---|
| **fur-ui-design** | Decide UI direction before implementation. |
| **fur-ui-clone** | Pixel-perfect website clone pipeline based on browser extraction, specs, builders, assets, and visual QA. |
| **fur-ui-review** | Review implemented UI/UX quality. |

## Question Levels

`fur init` writes these settings to `.fur.planning/config.json`.

| Level | Behavior |
|---|---|
| `low` | Ask only for blocker ambiguity, unsafe tracker routing, or high-risk irreversible choices. |
| `normal` | Ask when scope, acceptance criteria, tracker target, or verification is missing. |
| `high` | Also ask product, edge-case, data, and rollout questions when requirements are thin. |

Defaults:

- New project: `projectMaturity: "new"`, `questionLevel: "high"`.
- Established project: `projectMaturity: "established"`, `questionLevel: "normal"`.

## CLI Commands

| Command | Purpose |
|---|---|
| `fur init` | Create `.fur.planning/`; TTY prompts, non-TTY uses safe defaults. |
| `fur init --gitignore --question-level high --project-maturity new` | Non-interactive init with explicit behavior. |
| `fur workspace init` | Create `.fur.workspace/config.json` in the current folder. |
| `fur workspace doctor` | Validate workspace repo/tracker config. |
| `fur refresh` | Helper used by `fur-done`; create a progress snapshot. |
| `fur progress` | Helper used by `fur-status`; print counts and latest snapshot. |
| `fur compact` | Move old progress snapshots to `progress/archive/`. |
| `fur doctor` | Check skill symlinks and CLI installation status. |

## Tracker Config

Workspace-level config routes external references:

```json
{
  "version": 1,
  "defaultTaskSource": "local",
  "writePolicy": "config-allowed",
  "repositories": [
    {
      "id": "nafru-website",
      "path": "nafru/nafru-website",
      "github": {
        "owner": "OWNER",
        "repo": "REPO",
        "issuePrefix": "#",
        "mcp": "github",
        "writeAllowed": true,
        "closeAllowed": true
      },
      "jira": {
        "projectKeys": ["NAF"],
        "mcp": "atlassian",
        "writeAllowed": true,
        "transitionAllowed": true
      }
    }
  ]
}
```

`fur-task` resolves `NAF-11`, `#56`, and issue URLs through this config. If the match is ambiguous, it asks.

## Reference Files

- `references/planning-layout.md` — `.fur.planning` and `.fur.workspace` layout
- `references/task-template.md` — task file template
- `references/context-window.md` — context budget rules

## Turkish Translations

See `docs/tr/` for Turkish translations of key documents.
