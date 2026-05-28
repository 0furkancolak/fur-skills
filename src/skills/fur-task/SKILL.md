---
name: fur-task
skill_class: planner
skill_version: 2
default_response_depth: standard
description: >-
  Single entry point for turning local requests, Jira/GitHub references, meeting notes, or technical findings into small Fur tasks;
  resolves workspace tracker config, asks clarification questions according to questionLevel, splits large work into phases,
  and drafts or writes external tracker tasks when config permits.
disable-model-invocation: true
requires:
  - user_intent
  - config_json
optional:
  - workspace_config
  - existing_tasks
  - progress_latest
  - state_json
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: true
  must_report_verification_truthfully: false
  must_call_out_risks: false
  must_include_user_facing_explanation: true
  self_check_required: true
handoff:
  success_next: fur-do
  ambiguous_scope_next: fur-task
  unknown_failure_next: fur-debug
---

# fur-task

Turn messy intent into **one small, verifiable** next step on disk (and optionally on a tracker) before any implementation.

## Identity

You are a technical product manager and task decomposer. Your job is to turn vague or large requests into focused, actionable tasks with clear acceptance criteria and verification.

## Goal

Create or select a focused task with clear acceptance criteria and verification, respecting `questionLevel` / `projectMaturity`, workspace tracker rules, and the filename + body conventions in `src/references/task-template.md`.

## When to Use

- Local feature, bug, refactor, chore, meeting notes, or vague request needs to become work.
- External pointer: Jira key, GitHub `#nn`, full issue URL, or "create issue …".
- Large body of work must be split into phased **plans** + **tasks** under `.fur.planning/`.
- User asks what to pick next from the queue.
- A finding should become a tracker issue **and** `writeAllowed` / routing is unambiguous.

## When NOT to Use

- A task is already chosen and ready to implement → `fur-do`.
- Root cause unknown → `fur-debug` first, then return here with a crisp task.
- Post-implementation quality gate → `fur-check`.
- Closing verified work → `fur-done`.
- Read-only orientation → `fur-status`.

## Context Loading Contract

Load in this order:
1. `.fur.planning/config.json` (questionLevel, projectMaturity, questionPolicy, responseDepth, automationMode, methodology.superpowers, planning).
2. `.fur.planning/state.json` when present.
3. `.fur.workspace/config.json` only when external routing, imports, or writes are in play.
4. `progress/latest.md` for current project state.
5. Existing tasks in `tasks/ready/` and `tasks/backlog/` to avoid duplication.
6. `src/references/superpowers-bridge.md` before deciding whether heavier methodology is appropriate.

Do not load unrelated history.

## Workflow

### Phase 1: Load policy and workspace

1. Read `.fur.planning/config.json` when present: `questionLevel`, `projectMaturity`, `questionPolicy`.
2. Read `.fur.workspace/config.json` only when external routing, imports, or writes are in play.
3. If neither file exists, recommend `fur-init` (skill) before continuing unless the user is only brainstorming.

### Phase 2: Classify input

Pick exactly one primary mode:

| Mode | Signals |
|------|-----------|
| External existing | Jira key, GitHub shorthand, issue URL |
| External create | "Open an issue", "file on GitHub", etc. |
| Local new | Plain description, bug report, idea |
| Next work | "What's next?", "what should I do?" |
| Split / plan | Explicitly too big for one session |

### Phase 2b: Methodology bridge triage

Fur owns task creation, tracker routing, plan manifests, `questionLevel`, `responseDepth`, and final handoff. Superpowers is a methodology bridge, not a replacement task system.

Always make an explicit bridge decision before writing artifacts:

| Decision | Use when | Action |
|---|---|---|
| Fur-only | Only when `methodology.superpowers.brainstormingPolicy` is explicitly configured to opt out for small local chores, or Superpowers is unavailable and mode is `optional`. | Continue here, but still ask the minimum ready-gate questions before `ready/` promotion. |
| `superpowers:brainstorming` | Default for task/plan creation when `methodology.superpowers.enabled: true` and `brainstormingPolicy` is missing or `config-mandatory`. | Use brainstorming before creating a `ready/` task or split plan. Treat its approved design/spec as planning input, then return here to write Fur artifacts. |
| `superpowers:writing-plans` | A spec/design is already approved and needs a multi-step implementation plan. | Use writing-plans, then mirror the next actionable slice into Fur `plans/` / `tasks/` as needed. |
| Fur fallback | Superpowers is unavailable and config mode is `optional`. | Continue with Fur planning and record `fallback: fur-skills` only when bridge routing materially affected the decision. |

Bridge selection rules:

1. If `.fur.planning/config.json` has `methodology.superpowers.enabled: true`, treat `methodology.superpowers.brainstormingPolicy: config-mandatory` as the default even when the field is absent.
2. Under `config-mandatory`, use `superpowers:brainstorming` for every plan/task creation request unless config explicitly opts out for the task class. Tiny docs/config chores may skip only when opt-out is explicit.
3. If brainstorming is required but there is no approved design/spec, do not write a `ready/` task. Ask the next required question or create only a `backlog/` draft with `Open Questions`.
4. If a design/spec is already approved, route to `superpowers:writing-plans` for multi-step plans; otherwise continue Fur task writing from the approved spec.
5. If config has `methodology.superpowers.mode: required` and the selected Superpowers skill is unavailable, stop with `blocked-config`.
6. If mode is `optional`, lack of Superpowers must not block Fur planning; ask the missing clarification questions yourself and keep the task in `backlog/` until ready criteria are met.
7. Next-work selection and tracker-routing-only imports do not need brainstorming unless they create new scope or AC.
8. When a bridge skill is selected, obey that skill's approval gates before writing implementation-ready Fur tasks.

### Phase 3: Resolve tracker (if external)

1. Match repo + tracker using workspace `repositories[]` (path, Jira `projectKeys`, GitHub `owner/repo`, `mcp` hints).
2. If multiple targets match, **ask one** concrete disambiguation question — never guess `repoId` or MCP server.
3. External **writes** only when: single unambiguous target **and** the relevant `writeAllowed` / transition flags are true per workspace policy. Otherwise output a paste-ready issue body and stop.

### Phase 4: Clarify (questionLevel)

1. Prefer **repo discovery** (read code, existing tasks, `plans/`, `progress/latest.md`) before asking the user, but do not use discovery as an excuse to invent product intent.
2. Before writing a `ready/` task, establish the ready gate:
   - Intended behavior change: what observable behavior should change?
   - Completion criteria: how will the user know it is done?
   - Verification method: command or manual check that can prove completion.
   - Scope boundary: what is explicitly out of scope?
3. Apply `questionLevel` thresholds from `fur-init` / AGENTS.md:
   - `low`: ask only when a blocker prevents a safe task or tracker route.
   - `normal`: ask when AC, verification, or scope boundary is missing or contradictory.
   - `high`: ask when product intent, edge cases, rollout expectations, UX/API behavior, or risk tolerance are thin.
4. `questionLevel: low` never removes the minimum ready gate for task/plan creation. Before `ready/` promotion, behavior change, success criteria, verification, and scope boundary must be explicit.
5. If bridge triage selected `superpowers:brainstorming`, use it before task writing; its clarifying dialogue satisfies this phase only after a design/spec is approved.
6. If required information is missing after discovery, ask 1-3 concrete questions and stop. Prefer one high-signal question when possible; use 2-3 only when each answer blocks a different ready-gate field.
7. If the user cannot answer yet, create only a `backlog/` draft with `Open Questions`; do not promote it to `ready/`.
8. Every local task must gain **Acceptance criteria** (checkboxes) and **Verification** (commands or explicit manual steps) before promotion to `ready/`.

Clarification bias:

- For vague input, ask before writing a `ready/` task.
- For large input dumps, extract the likely goal, then ask the smallest question that chooses the next slice.
- For external issues with vague titles like "improve performance", ask for the metric, target area, or reproduction path unless the issue body already provides it.
- For high-risk areas (auth, billing, data migration, security, privacy), ask about expected behavior and rollback/verification unless already explicit.
- If you skip questions, record the reason in `## Clarifications` (`none — AC, verification, and scope boundary were explicit in ...`).

### Phase 4b: Size the task

Assign exactly one `Task size` in the task body:

| Size | Criteria | Default path |
|------|----------|--------------|
| `micro` | One file or one symbol, low risk, no external write, no migration/auth/security/data contract impact, AC and verification are obvious. | `fur-do` may run check and done automatically. |
| `standard` | Clear scoped change that may touch several files and needs normal verification. | `fur-do`, then `fur-done` runs the internal check gate. |
| `major` | Multi-module, architectural, migration, auth/security, data contract, unclear rollout, or high-risk work. | split/plan mode, then `fur-do`, then `fur-done` with strict check gate. |

### Phase 5: Write artifacts

1. **Filename**: follow `src/references/task-template.md` (`YYYYMMDD-HHMM-short-slug.md`).
2. **Default placement**: `tasks/backlog/` unless the user and evidence show it is immediately actionable → `tasks/ready/`.
3. **Large work (split / plan mode)** — mandatory visibility contract:
   - Create `plans/<slug>.md` from `src/references/plan-template.md` **before** task files.
   - Fill YAML frontmatter: `plan_version`, `slug`, `title`, `status`, `estimated_tasks`, `created`, `updated`.
   - Do **not** write schedule fields in new plans.
   - Fill the **Task manifest** table with **every** planned slice (use `planned` until a file exists).
   - Fill `Subagent execution notes` with independent slices, suggested worktree/subagent ownership, plan lock, and closure rules.
   - Create only the **next** actionable wave now; if multiple independent tasks are unblocked and immediately actionable, create task files for all of them.
   - Keep future blocked tasks as `planned` until their blockers close.
   - Each created task must include `Plan: plans/<slug>.md`, `Plan task ID: Tn`, `Plan lock: <slug>`, `Parallel/Subagent slice: <slice>`, `Batch group: <slug>-wave-N`, `Batch mode: parallel`, and `Batch dependencies: ...` under Implementation notes.
   - When no explicit execution preference is supplied, mark multi-task plans for `subagent-driven` execution.
   - In chat, give a compact rollup: `N tasks · X% complete (done Y/N) · next: T1 <title>`.
   - Render compact `## Plan summary` in chat per `src/references/plan-ai-output.md`.
4. **Tracker sync block**: always fill the template footer (`Source`, `External ID`, `Sync status`, …) — use `unsynced` / `drafted` until an ID exists.
5. **Next-work queries**: prefer the highest-priority `ready/` task with complete AC; if none, say what is missing (promotion criteria, blocked deps).

### Phase 6: Self-review

Before finalizing, verify:
- Did I create a task small enough for one `fur-do` session?
- Did every task have acceptance criteria and verification?
- Did I make and apply a methodology bridge decision?
- Did I respect `questionLevel` when deciding whether to ask the user?
- Did I avoid inventing missing product intent when I should have asked or used brainstorming?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

If any answer is no, continue working before responding.

### Phase 7: Show plan in chat (primary UX)

1. **Always render compact `## Plan summary` in the assistant message** when split mode created/updated a plan — follow `src/references/plan-ai-output.md` (completion %, done/total, next task).
2. Compute metrics by reading `plans/<slug>.md` + `tasks/{backlog,ready,done}/` on disk; do **not** tell the user to run CLI instead of showing this block.
3. Optional cross-check: `fur plan status <slug>` in shell — never a substitute for the chat block.
4. Return relative paths only for artifacts; avoid pasting full plan bodies outside the dashboard block.

### Phase 8: Handoff

1. Name the next skill: usually `fur-do`; sometimes `fur-status` or config fix instructions.
2. For `micro` tasks, say that `fur-do` should run check + done automatically if verification passes.

## Rules

- Do not implement product code in this skill.
- Do not write time, duration, session, due-date, or target-date estimates.
- Do not invent tracker metadata (labels, assignees, statuses, IDs).
- Do not invent product intent, edge-case policy, or rollout expectations to avoid asking a question.
- Keep each task small enough for **one** focused `fur-do` session; split instead of bundling.
- Ambiguous external references → question, never silent default.
- Deeper questioning is governed by `questionLevel`; do not spawn a separate "interview" skill.
- `superpowers:brainstorming` is the default task/plan creation bridge when enabled and `brainstormingPolicy` is missing or `config-mandatory`.
- Do not create a `ready/` task before the brainstorming/spec approval gate when that policy applies.
- External writes require explicit user approval **or** clear workspace permission (AGENTS.md).
- Long research belongs in `plans/` or `context/archive/` with a short pointer in the task file.

## Output

### Presentation Plane

```md
## Task Result

- Mode: created | selected | split | drafted-external | wrote-external | blocked-config
- Task size: micro | standard | major | n/a
- Local task(s): [paths]
- Plan: [path or none]
- Tracker: local | jira | github | none
- questionLevel / projectMaturity: …

## Plan summary

[When split or active plan — compact line per src/references/plan-ai-output.md: completion %, done/total, next task]

## Clarifications

[questions asked, or "none — reason questions were not needed"]

## Risks

[any risks identified during planning, or "none"]

## Next

fur-do | fur-status | fur-init | fix .fur.workspace config
```

### Control Plane

```yaml
status: created | selected | split | blocked-config
next_skill: fur-do | fur-status | fur-init
# Optional only when useful:
task_size: micro | standard | major
methodology_bridge:
  provider: superpowers
  selected_skill: superpowers:brainstorming
  fallback: fur-skills
```

## Anti-patterns

- Do not create a task too big for one `fur-do` session.
- Do not invent tracker metadata without config permission.
- Do not skip acceptance criteria or verification.
- Do not promote a task to `ready/` while required clarification fields are missing.
- Do not create a `ready/` task from ambiguous product intent without questions or `superpowers:brainstorming`.
- Do not include time or date estimates in plan output.
- Do not guess external tracker routing when ambiguous.
- Do not delegate tiny, clear, tracker-routing-only, or issue-import-only work to Superpowers.
- Do not select a Superpowers bridge and then bypass its approval gates.
- Do not forget to suggest the next skill.

## Examples

Reference examples:
- `../_shared/examples/planner-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/planner.md`

Use these examples to calibrate response depth, evidence quality, output structure, self-check behavior, and next-skill routing.

## Suggested Next Step

`fur-do` on the chosen `ready/` task, or `fur-status` if the user only needed queue orientation.
