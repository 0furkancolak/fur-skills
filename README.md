# fur-skills

Personal AI agent skill set for a small, fast project workflow.

## Purpose

Fur keeps project work moving through one simple loop:

```txt
fur-init -> fur-task -> fur-do -> fur-done
                 \-> fur-check (optional/embedded) ->/
                 \-> fur-debug ->/
```

UI-specific work stays separate in the UI skills.

## Architecture (v2)

fur-skills v2 is a **contract-first, provider-aware, eval-driven** skill platform. Every skill has:

- **Frontmatter contract** — `skill_class`, `skill_version`, `default_response_depth`, `quality_contract`, `handoff`
- **Dual-plane output** — `presentation_plane` (human-readable markdown) + `control_plane` (machine-parseable YAML)
- **Self-check requirement** — mandatory internal verification before final output
- **Provider overlays** — Claude (`src/skills/_shared/overlays/claude.md`), OpenAI reasoning (`openai-reasoning.md`), generic (`generic.md`)
- **Eval fixtures** — prompt sets, golden outputs, deterministic graders under `src/evals/`

### Skill Classes

| Class | Responsibility | Default Depth |
|---|---|---|
| **orchestrator** | Orient, summarize, archive | concise |
| **planner** | Decompose, clarify, design | standard |
| **executor** | Implement one scoped task | deep |
| **gate** | Verify, review, accept/reject | standard |
| **diagnostic** | Unknown root cause | deep |

### Quality Constitution

Every skill follows the shared contract in `AGENTS.md`:
- Scope is small; explanation is deep
- Evidence before claims
- Config over convention (`responseDepth`, `evidenceStyle`, `verificationStrictness`)
- Provider-aware, not provider-locked
- Eval-driven improvement

## Principles

- All custom skills start with `fur-`.
- Keep the core loop small; prefer config over extra skills.
- External resources (Jira, GitHub, MCP) are optional; local markdown is the fallback.
- Multi-repo tracker routing lives in `.fur.workspace/config.json`.
- Repo-local behavior lives in `.fur.planning/config.json`.
- Question asking is controlled by `questionLevel`; answer depth is controlled by `responseDepth`.
- Superpowers can be used as an optional methodology bridge for heavier work; Fur remains primary.
- Old context should stay in files, not in chat; use `progress/latest.md` and `fur compact`.
- Evidence before claims: every non-trivial assertion ties to a source.
- Config over convention: `responseDepth`, `evidenceStyle`, and `verificationStrictness` live in config.

## Prerequisites

- [Bun](https://bun.sh) 1.1+

## Installation

```bash
cd /path/to/fur-skills
bun install
fur install          # interaktif: host seçimi, ön/son kontroller (@clack/prompts)
# fur install --yes  # CI / non-interactive
```

Or without a global `fur` on PATH yet:

```bash
bun install
bun src/cli.ts install
```

The `fur` command requires `~/bin` in your PATH:

```bash
export PATH="$HOME/bin:$PATH"
```

Verify:

```bash
fur help
fur repo-doctor
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
fur init --gitignore --project-maturity new --question-level high --automation-mode guided
fur init --gitignore --project-maturity established --question-level normal --automation-mode guided
```

For a folder that contains multiple repos:

```bash
fur workspace init
fur workspace doctor
```

## Core Skills

| Skill | Class | Purpose |
|---|---|---|
| **fur-init** | orchestrator | Create `.fur.planning/`, local behavior config, question level, and workspace hints. |
| **fur-task** | planner | Create/select/split local tasks; import Jira/GitHub references; draft/write external tasks when config permits. |
| **fur-do** | executor | Implement one selected task or tiny clear fix. |
| **fur-check** | gate | Standalone or embedded review gate for acceptance criteria, tests, risk, and changed code. |
| **fur-done** | orchestrator | Runs the internal check gate, moves verified task to done, refreshes progress/state, and syncs tracker completion when config permits. |
| **fur-status** | orchestrator | Optional orientation view for task counts, latest snapshot, tracker sync state, and one next action. |
| **fur-debug** | diagnostic | Diagnose unknown root cause with a phase-based debugging loop. |

## UI Skills

| Skill | Class | Purpose |
|---|---|---|
| **fur-ui-design** | planner | Decide UI direction before implementation. |
| **fur-ui-clone** | executor | Pixel-perfect website clone pipeline based on browser extraction, specs, builders, assets, and visual QA. |
| **fur-ui-review** | gate | Review implemented UI/UX quality. |

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

## Response Depth

`responseDepth` controls how rich each skill's output is, independently of `questionLevel`.

| Level | Behavior |
|---|---|
| `concise` | Operational handoff only. 1-3 sentences + file list + next step. |
| `standard` | Default. Covers acceptance criteria, files changed, checks, and risks in structured markdown. |
| `deep` | Full audit trail. Includes task restatement, assumption labeling, trade-off analysis, edge-case discussion, and explicit self-check. |

## Evidence Style

| Style | Behavior |
|---|---|
| `paths-only` | List touched files only. |
| `inline` | Include short inline snippets (≤5 lines) where helpful. |
| `inline-plus-paths` | Full inline snippets + permanent file paths for audit. |

## Verification Strictness

| Level | Behavior |
|---|---|
| `loose` | Manual checks acceptable; skip if tooling is missing. |
| `normal` | Run available checks; note gaps honestly. |
| `strict` | All verification steps must run; missing tooling is a blocker to report. |

## Optional Superpowers Bridge

fur-skills can optionally delegate heavier methodology steps to Superpowers. Fur remains the primary workflow and owns task state, progress, tracker routing, and final handoffs.

Use Fur native flow for small, clear tasks. Use optional Superpowers delegation for ambiguous, risky, debugging-heavy, TDD-heavy, review-heavy, branch-finishing, or multi-step work. Superpowers is never installed automatically and is not required by default.

Default config:

```json
{
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-native"
    }
  }
}
```

Routing:

| Fur skill | Optional Superpowers delegation |
|---|---|
| `fur-task` | `brainstorming`, `writing-plans` |
| `fur-do` | `using-git-worktrees`, `test-driven-development`, `subagent-driven-development`, `executing-plans` |
| `fur-debug` | `systematic-debugging`, `verification-before-completion` |
| `fur-check` | `verification-before-completion`, `requesting-code-review`, `receiving-code-review` |
| `fur-done` | `finishing-a-development-branch` |
| `fur-status` | no delegation |

## Automation Mode

| Mode | Behavior |
|---|---|
| `guided` | Default. `fur-do` auto-closes only micro tasks; `fur-done` runs the internal check gate for standard/major tasks. |
| `streamlined` | Uses the same safety gates, but agents choose the fastest allowed path when config and risk permit. |

## CLI Commands

| Command | Purpose |
|---|---|
| `fur init` | Create `.fur.planning/`; TTY prompts, non-TTY uses safe defaults. |
| `fur init --gitignore --question-level high --project-maturity new --automation-mode guided` | Non-interactive init with explicit behavior. |
| `fur workspace init` | Create `.fur.workspace/config.json` in the current folder. |
| `fur workspace doctor` | Validate workspace repo/tracker config. |
| `fur refresh` | Helper used by `fur-done`; create a progress snapshot and `.fur.planning/state.json`. |
| `fur progress` | Helper used by `fur-status`; print counts, plan completion, and latest snapshot. |
| `fur compact` | Move old progress snapshots to `progress/archive/`. |
| `fur doctor` | Check skill symlinks and CLI installation status on your machine. |
| `fur install` | Symlink skills + CLI to `~/.claude/skills`, `~/.cursor/skills`, etc. |
| `fur uninstall` | Remove fur skill symlinks and `~/bin/fur`. |
| `fur repo-doctor` | Validate fur-skills repo quality (frontmatter, eval fixtures, CI). |
| `fur eval meta <skill>` | Check eval fixture metadata for a skill. |
| `fur eval grade <skill> <skill_md> <output_md>` | Run deterministic grader on an output file. |

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

- `src/references/planning-layout.md` — `.fur.planning` and `.fur.workspace` layout
- `src/references/task-template.md` — task file template
- `src/references/context-window.md` — context budget rules
- `src/references/skill-spec-v2.md` — mandatory shared skill contract (frontmatter, sections, output schema)
- `src/references/output-rubrics.md` — depth, quality, evidence, and risk rubrics
- `src/references/context-pack-rules.md` — rich / standard / lean context loading rules
- `src/references/eval-design.md` — golden data sets, trace grading, and grader rules

## Turkish Translations

See `src/docs/tr/` for Turkish translations of key documents.
