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
- Large body of work must be split into phased **plans** + **tasks** under `docs/ai/`.
- User asks what to pick next from the queue.
- A finding should become a tracker issue **and** `writeAllowed` / routing is unambiguous.

## When NOT to Use

- A task is already chosen and ready to implement — plan, do not re-plan.
- Root cause of a failure is still unknown — diagnose before drafting new scope.
- Implementation is done and needs closure — this skill does not archive tasks.
- You only need a read-only queue snapshot — task creation mutates `docs/ai/`.

## Context Loading Contract

Load in this order:
1. `docs/ai/config.json` (questionLevel, projectMaturity, questionPolicy, responseDepth, automationMode, planning).
2. `docs/ai/state.json` when present.
3. `.fur.workspace/config.json` only when external routing, imports, or writes are in play.
4. `progress/latest.md` for current project state.
5. Existing tasks in `tasks/ready/` and `tasks/backlog/` to avoid duplication.

Do not load unrelated history.

## Workflow

### Phase 1: Load policy and workspace

1. Read `docs/ai/config.json` when present: `questionLevel`, `projectMaturity`, `questionPolicy`.
2. Read `.fur.workspace/config.json` only when external routing, imports, or writes are in play.
3. If neither file exists, recommend running `fur init` before continuing unless the user is only brainstorming.

### Phase 2: Classify input

Pick exactly one primary mode:

| Mode | Signals |
|------|-----------|
| External existing | Jira key, GitHub shorthand, issue URL |
| External create | "Open an issue", "file on GitHub", etc. |
| Local new | Plain description, bug report, idea |
| Next work | "What's next?", "what should I do?" |
| Split / plan | Explicitly too big for one session |

### Phase 2b: Fur-native planning boundary

Fur owns task creation, tracker routing, plan manifests, `questionLevel`, and `responseDepth`. Do not delegate task creation, clarification, or plan splitting to another methodology from inside this skill.

Planning rules:

1. Use the ready gate in this skill for all local task creation: behavior change, success criteria, verification, and scope boundary.
2. If intent is vague, ask the smallest blocking question and keep the task in `backlog/` until the ready gate is satisfied.
3. If the request is too large for one task, split it into a Fur plan plus small task files.
4. If the user explicitly invokes another external workflow in the same conversation, treat its output as user-provided context only; return here before writing Fur artifacts.
5. Next-work selection and tracker-routing-only imports do not need extra planning unless they create new scope or acceptance criteria.

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
5. If required information is missing after discovery, ask 1-3 concrete questions and stop. Prefer one high-signal question when possible; use 2-3 only when each answer blocks a different ready-gate field.
6. If the user cannot answer yet, create only a `backlog/` draft with `Open Questions`; do not promote it to `ready/`.
7. Every local task must gain **Acceptance criteria** (checkboxes) and **Verification** (commands or explicit manual steps) before promotion to `ready/`.

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
| `micro` | One file or one symbol, low risk, no external write, no migration/auth/security/data contract impact, AC and verification are obvious. | Single focused implementation session; may auto-close when verified. |
| `standard` | Clear scoped change that may touch several files and needs normal verification. | Implement, verify, then close when acceptance criteria pass. |
| `major` | Multi-module, architectural, migration, auth/security, data contract, unclear rollout, or high-risk work. | Split into a plan first; implement and verify each slice before closure. |

### Phase 5: Write artifacts

1. **Filename**: follow `src/references/task-template.md` (`YYYYMMDD-HHMM-short-slug.md`).
2. **Default placement**: `tasks/backlog/` unless the user and evidence show it is immediately actionable → `tasks/ready/`.
3. **Large work (split / plan mode)** — mandatory visibility contract:
   - Create `plans/<slug>.md` from `src/references/plan-template.md` **before** task files.
   - Fill YAML frontmatter: `plan_version`, `slug`, `title`, `status`, `estimated_tasks`, `created`, `updated`.
   - Do **not** write schedule fields in new plans.
   - Fill the **Task manifest** table with **every** planned slice (use `planned` until a file exists).
   - Fill `Execution notes` with independent slices, ownership hints, plan lock, and closure rules.
   - Create only the **next** actionable wave now; if multiple independent tasks are unblocked and immediately actionable, create task files for all of them.
   - Keep future blocked tasks as `planned` until their blockers close.
   - Each created task must include `Plan: plans/<slug>.md`, `Plan task ID: Tn`, `Plan lock: <slug>`, `Execution slice: <slice>`, `Batch group: <slug>-wave-N`, and `Batch dependencies: ...` under Implementation notes.
   - In chat, give a compact rollup: `N tasks · X% complete (done Y/N) · next: T1 <title>`.
   - Render compact `## Plan summary` in chat per `src/references/plan-ai-output.md`.
4. **Tracker sync block**: always fill the template footer (`Source`, `External ID`, `Sync status`, …) — use `unsynced` / `drafted` until an ID exists.
5. **Next-work queries**: prefer the highest-priority `ready/` task with complete AC; if none, say what is missing (promotion criteria, blocked deps).

### Phase 6: Self-review

Before finalizing, verify:
- Did I create a task small enough for one implementation session?
- Did every task have acceptance criteria and verification?
- Did I respect `questionLevel` when deciding whether to ask the user?
- Did I avoid inventing missing product intent when I should have asked?
- Did I match the output contract for this skill class?

If any answer is no, continue working before responding.

### Phase 7: Show plan in chat (primary UX)

1. **Always render compact `## Plan summary` in the assistant message** when split mode created/updated a plan — follow `src/references/plan-ai-output.md` (completion %, done/total, next task).
2. Compute metrics by reading `plans/<slug>.md` + `tasks/{backlog,ready,done}/` on disk; do **not** tell the user to run CLI instead of showing this block.
3. Optional cross-check: `fur plan status <slug>` in shell — never a substitute for the chat block.
4. Return relative paths only for artifacts; avoid pasting full plan bodies outside the dashboard block.

## Rules

- Do not implement product code in this skill.
- Do not write time, duration, session, due-date, or target-date estimates.
- Do not invent tracker metadata (labels, assignees, statuses, IDs).
- Do not invent product intent, edge-case policy, or rollout expectations to avoid asking a question.
- Keep each task small enough for **one** focused implementation session; split instead of bundling.
- Ambiguous external references → question, never silent default.
- Deeper questioning is governed by `questionLevel`; do not spawn a separate "interview" skill.
- External writes require explicit user approval **or** clear workspace permission (AGENTS.md).
- Long research belongs in `plans/` or `context/archive/` with a short pointer in the task file.

## Output

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
```

Plain text only — no YAML footer.

## Anti-patterns

- Do not create a task too big for one implementation session.
- Do not invent tracker metadata without config permission.
- Do not skip acceptance criteria or verification.
- Do not promote a task to `ready/` while required clarification fields are missing.
- Do not create a `ready/` task from ambiguous product intent without questions.
- Do not include time or date estimates in plan output.
- Do not guess external tracker routing when ambiguous.
- Do not delegate task creation or plan splitting to another methodology from inside Fur.

## Examples

Reference examples:
- `../_shared/examples/planner-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/planner.md`

Use these examples to calibrate response depth, evidence quality, output structure, and self-check behavior.
