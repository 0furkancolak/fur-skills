---
name: fur-init
skill_class: orchestrator
skill_version: 2
default_response_depth: concise
description: >-
  Initialize `.fur.planning` in the current project with task folders, local behavior config,
  questionLevel, projectMaturity, and workspace tracker hints. Use when starting the simplified Fur loop in a repo.
disable-model-invocation: true
requires:
  - project_root
optional:
  - existing_fur_planning
  - fur_workspace_config
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: true
  must_report_verification_truthfully: true
  must_call_out_risks: false
  must_include_user_facing_explanation: true
  self_check_required: true
handoff:
  success_next: fur-task
  ambiguous_scope_next: fur-task
  unknown_failure_next: fur-debug
---

# fur-init

Bootstrap the Fur planning workspace so later skills (`fur-task`, `fur-do`, …) have a consistent on-disk contract.

## Identity

You are a project coordinator. Your job is to set up the planning workspace correctly and hand off to the next skill without implementing product code.

## Goal

Create a clean `.fur.planning/` tree, ask setup questions in TTY mode, write `config.json` with behavior settings, seed `context/` stubs, and surface workspace (`/.fur.workspace/`) registration status — without implementing product code.

## When to Use

- Starting the Fur loop in a **new** project repository.
- Cloning a repo that has no `.fur.planning/` yet.
- Re-orienting after deleting a broken planning folder (only if the user explicitly wants a fresh init).

## When NOT to Use

- `.fur.planning/` already exists and is valid — report status; do not blindly overwrite `config.json` without user consent.
- You need tasks or implementation — use `fur-task` / `fur-do` after init.
- You only need a progress summary — use `fur-status` or `fur progress`.

## Context Loading Contract

Load in this order:
1. Project root directory.
2. Existing `.fur.planning/` if present (to avoid overwriting).
3. Parent directories for `.fur.workspace/config.json`.
4. `src/references/superpowers-bridge.md` when explaining methodology bridge defaults.

Do not load unrelated project code or history.

## Workflow

### Phase 1: Preconditions

1. Operate from the **project git root** (or the root the user treats as the repo).
2. If `.fur.planning/` exists, list `config.json`, `tasks/*`, and `progress/latest.md`; stop unless the user asked to re-init or repair.
3. Read `src/references/planning-layout.md` if you need the full layout rationale.

### Phase 2: Run the CLI

1. Choose `questionLevel` and `projectMaturity` using AGENTS.md defaults: **new → `high`**, **established → `normal`** unless the user overrides.
2. Run `fur init` from the project root. In TTY it asks for gitignore, project maturity, question level, response depth, evidence style, verification strictness, and automation mode. In non-TTY/CI it defaults to `--gitignore`, `--project-maturity new`, `--question-level high`, `--response-depth standard`, `--evidence-style inline`, `--verification-strictness normal`, `--automation-mode guided`.

Non-interactive examples:

```bash
fur init --gitignore --project-maturity new --question-level high --automation-mode guided
```

```bash
fur init --gitignore --project-maturity established --question-level normal --automation-mode guided
```

3. If the user must not ignore planning in git, use `--no-gitignore` and explain the tradeoff (commits may include `.fur.planning/`).

### Phase 3: Verify layout and config

1. Confirm the **Created structure** below exists (folders + `README.md` + `context/*.md` stubs).
2. Open `.fur.planning/config.json` and confirm keys: `questionLevel`, `projectMaturity`, `responseDepth`, `evidenceStyle`, `verificationStrictness`, `automationMode`, `methodology.superpowers`, `planning`, `questionPolicy`, `localTaskMode`, `gitignore` (boolean reflects CLI).
3. Confirm the default methodology bridge config: `methodology.superpowers.enabled = true`, `methodology.superpowers.mode = optional`, `methodology.superpowers.fallback = fur-skills`, and `methodology.superpowers.brainstormingPolicy = config-mandatory`.
4. Confirm the default planning config: `planning.planLock = enabled`, `planning.defaultExecution = subagent-driven`, and `planning.batchExecution = enabled`.
4. Do not attempt to install Superpowers. Do not block initialization if Superpowers is missing.
5. Optionally run `fur progress` — it may say no snapshot yet; that is OK until the first `fur refresh`.

### Phase 4: Workspace discovery

1. Walk parent directories for `.fur.workspace/config.json` (same behavior as `fur` CLI).
2. If missing: suggest `fur workspace init` from the **workspace root** when multi-repo tracker routing is desired.
3. If present: if this repo path is **not** in `repositories[]`, report that external imports/writes stay blocked until registered.

### Phase 5: Self-review

Before finalizing, verify:
- Did I create the full `.fur.planning/` tree without errors?
- Did I set `questionLevel` and `projectMaturity` correctly?
- Did I check for existing config before overwriting?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

If any answer is no, continue working before responding.

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
    archive/     # optional long digests — see src/references/context-window.md
    issue-tracker.md
    mcp.md
    verification.md
```

## Question levels

- `low`: ask only for blocker ambiguity, unsafe tracker routing, or high-risk irreversible choices.
- `normal`: ask when scope, acceptance criteria, tracker target, or verification is missing.
- `high`: also ask product, edge-case, data, and rollout questions when requirements are thin.

## Automation modes

- `guided`: default; `fur-do` auto-closes only micro tasks, and `fur-done` runs the internal check gate for standard/major tasks.
- `streamlined`: same safety gates, but agents should choose the fastest allowed path when config and risk permit.

## Rules

- Do not implement application code or create tracker issues during init.
- Do not over-design folders beyond what `fur init` creates unless the user asks.
- Never delete an existing `.fur.planning/` tree without explicit user approval.
- Repo-local `config.json` is for planning behavior only; tracker routing lives in `.fur.workspace/config.json`.
- Include `methodology.superpowers` and `planning` when creating or updating `.fur.planning/config.json`.
- Superpowers is optional by default; do not install it, require it, or fail init when it is missing.
- Point long explanations to `plans/` or `context/archive/` per `src/references/context-window.md` instead of bloating chat.

## Output

### Presentation Plane

```md
## Initialization Complete

- Project root: [path]
- Created or verified folders: [list]
- .gitignore updated (fur planning): yes / no / skipped
- questionLevel: low | normal | high
- projectMaturity: new | established
- responseDepth: concise | standard | deep
- evidenceStyle: paths-only | inline | inline-plus-paths
- verificationStrictness: loose | normal | strict
- automationMode: guided | streamlined
- Methodology bridge: Superpowers enabled optional, fallback fur-skills
- Workspace config: found [path] | not found
- Repo registered in workspace: yes [id] | no (action: add repositories[] entry)
- Next CLI hints: fur refresh | fur task (skill)
```

### Control Plane

```yaml
status: initialized | already-exists | blocked
next_skill: fur-task | fur-status
```

## Anti-patterns

- Do not overwrite an existing `.fur.planning/` without user consent.
- Do not implement product code during init.
- Do not skip workspace registration check.
- Do not forget to suggest the next skill.

## Examples

Reference examples:
- `../_shared/examples/orchestrator-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/orchestrator.md`

Use these examples to calibrate response depth, evidence quality, output structure, self-check behavior, and next-skill routing.

## Suggested Next Step

`fur-task` to capture the first unit of work, or `fur workspace init` + `fur workspace doctor` if tracker-aware multi-repo setup is needed.
