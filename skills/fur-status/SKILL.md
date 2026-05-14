---
name: fur-status
description: Show a concise Fur project status using task counts, latest progress snapshot, ready tasks, tracker sync state, and the next recommended action.
disable-model-invocation: true
---

# fur-status

Use this skill to orient quickly without loading old context.

## Goal

Answer where the project stands and what should happen next.

## When to Use

- The user asks "where are we?", "what remains?", or "what next?"
- A task was completed and the next step is needed
- A long session needs context compaction
- The agent needs a quick project orientation

## When NOT to Use

- You need to create or select a task from messy input — use `fur-task`
- You need to implement — use `fur-do`
- You need to verify/review — use `fur-check`
- You need to close completed work — use `fur-done`

## Workflow

1. Run or emulate `fur progress`.
2. Read `.fur.planning/progress/latest.md` if available.
3. Summarize counts, latest snapshot, ready tasks, and workspace tracker sync state.
4. Do not load old done task bodies unless directly relevant.
5. Recommend exactly one next action.

## Rules

- Do not change files.
- Do not claim work is done without task and verification evidence.
- Prefer links/paths over pasted content.
- Keep the status short enough to preserve context.
- If snapshots are bloated, suggest `fur compact`.

## Output

```md
## Status

- Backlog:
- Ready:
- Done:
- Plans:
- Tracker sync:

## Latest

[brief latest snapshot summary]

## Next

[one recommended next action]
```

## Suggested Next Step

`fur-task`, `fur-do`, `fur-done`, or `fur compact`, depending on the status.
