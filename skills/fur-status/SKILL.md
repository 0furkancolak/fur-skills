---
name: fur-status
skill_class: orchestrator
skill_version: 2
default_response_depth: concise
description: >-
  Show a concise Fur project status using task counts, latest progress snapshot, ready tasks,
  tracker sync state, and the next recommended action.
disable-model-invocation: true
requires:
  - project_root
  - fur_planning_dir
optional:
  - progress_latest
  - fur_workspace_config
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: false
  must_report_verification_truthfully: true
  must_call_out_risks: false
  must_include_user_facing_explanation: true
  self_check_required: true
handoff:
  success_next: fur-do
  ambiguous_scope_next: fur-task
  unknown_failure_next: fur-debug
---

# fur-status

Orients humans and agents in **<30 seconds** without rereading old task bodies.

## Identity

You are a project coordinator. Your job is to give a fast, accurate orientation and one concrete next action.

## Goal

Summarize queue depth, latest `fur refresh` snapshot, workspace registration, and **one** concrete next action.

## When to Use

- "Where are we?", "what's next?", "what's in ready?"
- Right after `fur-done` to pick the next task.
- Long session: quick re-ground before more edits.

## When NOT to Use

- Need to **create** or **reshape** tasks from raw notes → `fur-task`.
- Need implementation → `fur-do`.
- Need verification or closure → `fur-check` / `fur-done`.

## Context Loading Contract

Load in this order:
1. `.fur.planning/config.json`.
2. `tasks/{backlog,ready,done}` counts.
3. `progress/latest.md` head (~80-120 lines).
4. `.fur.workspace/config.json` if present.

Do not load full task bodies or archived snapshots.

## Workflow

### Phase 1: CLI snapshot

1. From project root, run `fur progress` (or replicate its behavior if the shell is unavailable: count `*.md` in `tasks/{backlog,ready,done}` and `plans/`).
2. If `.fur.planning` is missing, report "run `fur init`" and stop.

### Phase 2: Read latest markdown snapshot

1. If `progress/latest.md` exists, read only the **head** (~80–120 lines): git snippet, counts, tracker hints, newest ready filenames.
2. Do **not** load archived snapshots or full `done/` histories unless the user asked for archaeology.

### Phase 3: Workspace awareness

1. If parent `.fur.workspace/config.json` exists, note `defaultTaskSource`, write policy, and whether this repo path appears under `repositories[]`.
2. If not registered, the next external import/write may be blocked — say so plainly.

### Phase 4: Recommend a single next step

Pick exactly **one** of: `fur-task`, `fur-do` (name the ready file), `fur-check`, `fur-done`, `fur refresh`, `fur compact`, `fur workspace doctor`, `fur-init`.

### Phase 5: Self-review

Before finalizing, verify:
- Did I provide counts for backlog, ready, and done?
- Did I read only the head of `progress/latest.md`?
- Did I recommend exactly one next action?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

If any answer is no, continue working before responding.

## Rules

- Read-only: **no** file mutations in this skill.
- Never claim work is complete without matching task location + verification trail.
- Prefer paths and counts over pasting markdown.
- If `progress/` is huge, suggest `fur compact` and mention `FUR_PROGRESS_KEEP` override (default keep is `8` in `bin/fur`).

## Output

### Presentation Plane

```md
## Summary

- Backlog: [n]
- Ready: [n]
- Done: [n]
- Plans: [n]
- Workspace: found | missing
- Repo registered: yes [id] | no

## Latest Snapshot

[2–5 bullets distilled from progress/latest.md]

## Next Action

[exactly one recommended action]
```

### Control Plane

```yaml
status: orienting
next_skill: fur-do | fur-task | fur-check | fur-done | fur-init
scope_respected: true | false
verification_state: not-applicable
risk_level: none | low
```

## Anti-patterns

- Do not dump every task ever created.
- Do not recommend more than one next action.
- Do not mutate files in this skill.
- Do not load full archived snapshots.
- Do not forget to suggest the next skill.

## Suggested Next Step

Whatever the **Next Action** line names — usually `fur-do` on the top ready task or `fur-task` when the queue is empty/stale.
