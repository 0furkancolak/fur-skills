---
name: fur-status
description: Show a concise Fur project status using task counts, latest progress snapshot, ready tasks, tracker sync state, and the next recommended action.
disable-model-invocation: true
---

# fur-status

Orients humans and agents in **<30 seconds** without rereading old task bodies.

## Goal

Summarize queue depth, latest `fur refresh` snapshot, workspace registration, and **one** concrete next action.

## When to Use

- “Where are we?”, “what’s next?”, “what’s in ready?”
- Right after `fur-done` to pick the next task.
- Long session: quick re-ground before more edits.

## When NOT to Use

- Need to **create** or **reshape** tasks from raw notes → `fur-task`.
- Need implementation → `fur-do`.
- Need verification or closure → `fur-check` / `fur-done`.

## Workflow

### Phase 1: CLI snapshot

1. From project root, run `fur progress` (or replicate its behavior if the shell is unavailable: count `*.md` in `tasks/{backlog,ready,done}` and `plans/`).
2. If `.fur.planning` is missing, report “run `fur init`” and stop.

### Phase 2: Read latest markdown snapshot

1. If `progress/latest.md` exists, read only the **head** (~80–120 lines): git snippet, counts, tracker hints, newest ready filenames.
2. Do **not** load archived snapshots or full `done/` histories unless the user asked for archaeology.

### Phase 3: Workspace awareness

1. If parent `.fur.workspace/config.json` exists, note `defaultTaskSource`, write policy, and whether this repo path appears under `repositories[]`.
2. If not registered, the next external import/write may be blocked — say so plainly.

### Phase 4: Recommend a single next step

Pick exactly **one** of: `fur-task`, `fur-do` (name the ready file), `fur-check`, `fur-done`, `fur refresh`, `fur compact`, `fur workspace doctor`, `fur-init`.

## Rules

- Read-only: **no** file mutations in this skill.
- Never claim work is complete without matching task location + verification trail.
- Prefer paths and counts over pasting markdown.
- If `progress/` is huge, suggest `fur compact` and mention `FUR_PROGRESS_KEEP` override (default keep is `8` in `bin/fur`).

## Output

```md
## Status

- Backlog: [n]
- Ready: [n]
- Done: [n]
- Plans: [n]
- Workspace: found | missing
- Repo registered: yes [id] | no

## Latest snapshot

[2–5 bullets distilled from progress/latest.md]

## Next

[exactly one recommended action]
```

## Suggested Next Step

Whatever the **Next** line names — usually `fur-do` on the top ready task or `fur-task` when the queue is empty/stale.
