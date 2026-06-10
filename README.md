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

## Architecture (v3)

fur-skills v3 is a **docs/ai-based, contract-first, provider-aware, eval-driven** skill platform. Every skill has:

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
- Scope is small; explanation is proportional and evidenced
- Evidence before claims
- Config over convention (`responseDepth`, `evidenceStyle`, `verificationStrictness`)
- Provider-aware, not provider-locked
- Eval-driven improvement

## Principles

- All custom skills start with `fur-`.
- Keep the core loop small; prefer config over extra skills.
- External resources (Jira, GitHub, MCP) are optional; local markdown is the fallback.
- Multi-repo tracker routing lives in `.fur.workspace/config.json`.
- Repo-local behavior lives in `docs/ai/config.json`.
- Question asking is controlled by `questionLevel`; answer depth is controlled by `responseDepth`.
- Users may combine Fur with other skills and tools; Fur owns local task/state contracts.
- Caveman-style concise output is preferred when it does not reduce clarity or safety.
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
| **fur-init** | orchestrator | Create or refresh `docs/ai/`, context files, local behavior config, AGENTS routing, CLAUDE redirect, and workspace hints. |
| **fur-task** | planner | Create/select/split local tasks; import Jira/GitHub references; draft/write external tasks when config permits. |
| **fur-do** | executor | Implement one selected task or tiny clear fix. |
| **fur-check** | gate | Standalone or embedded review gate for acceptance criteria, tests, risk, and changed code. |
| **fur-done** | orchestrator | Runs the internal check gate, moves verified task to done, refreshes progress/state, and syncs tracker completion when config permits. |
| **fur-status** | orchestrator | Optional orientation view for task counts, latest snapshot, tracker sync state, and one next action. |
| **fur-debug** | diagnostic | Diagnose unknown root cause with a phase-based debugging loop. |
| **fur-session-handoff** | orchestrator | Produce a copy-paste-ready Turkish continuation prompt for a new conversation. |
| **fur-ship** | orchestrator | Check branch/PR state, sanitize AI attribution from commit/PR text, and prepare GitHub PR flow with approval gates. |

## UI Skills

| Skill | Class | Purpose |
|---|---|---|
| **fur-ui-design** | planner | Decide UI direction before implementation. |
| **fur-ui-clone** | executor | Pixel-perfect website clone pipeline based on browser extraction, specs, builders, assets, and visual QA. |
| **fur-ui-review** | gate | Review implemented UI/UX quality. |

## Question Levels

`fur init` writes these settings to `docs/ai/config.json`.

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
| `standard` | Default. Covers acceptance criteria, files changed, checks, and meaningful risks in compact structured markdown. |
| `deep` | Expanded audit trail only when needed or requested; avoid full transcripts, plan diffs, or repeated tables. |

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

## External Methodologies

fur-skills can be combined with other skill systems and tools when the user invokes them. Treat external skill output as context, then return to the Fur skill that owns the current state transition. Fur remains responsible for `docs/ai` task files, plan manifests, progress snapshots, tracker routing, verification reporting, and final handoffs.

General response style should stay concise. Caveman-style output is preferred for Fur operations unless security, approval, or multi-step clarity needs full prose.

Default config:

```json
{
  "planning": {
    "planLock": "enabled"
  }
}
```

With this default, multi-task plans run through Fur's own task queue. `planLock` prevents one conversation from jumping into another plan's queued task.

## Automation Mode

| Mode | Behavior |
|---|---|
| `guided` | Default. `fur-do` auto-closes only micro tasks; `fur-done` runs the internal check gate for standard/major tasks. |
| `streamlined` | Uses the same safety gates, but agents choose the fastest allowed path when config and risk permit. |

## CLI Commands

| Command | Purpose |
|---|---|
| `fur init` | Create `docs/ai/`; TTY prompts, non-TTY uses safe defaults. |
| `fur init --gitignore --question-level high --project-maturity new --automation-mode guided` | Non-interactive init with explicit behavior. |
| `fur workspace init` | Create `.fur.workspace/config.json` in the current folder. |
| `fur workspace doctor` | Validate workspace repo/tracker config. |
| `fur refresh` | Helper used by `fur-done`; create a progress snapshot and `docs/ai/state.json`. |
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

- `src/references/planning-layout.md` — `docs/ai` and `.fur.workspace` layout
- `src/references/task-template.md` — task file template
- `src/references/context-window.md` — context budget rules
- `src/references/skill-spec-v2.md` — mandatory shared skill contract (frontmatter, sections, output schema)
- `src/references/output-rubrics.md` — depth, quality, evidence, and risk rubrics
- `src/references/context-pack-rules.md` — rich / standard / lean context loading rules
- `src/references/eval-design.md` — golden data sets, trace grading, and grader rules

## Turkish Translations

See `src/docs/tr/` for Turkish translations of key documents.
