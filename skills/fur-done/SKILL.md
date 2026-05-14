---
name: fur-done
description: Close a verified Fur task by moving it to done, creating a progress snapshot, and syncing Jira/GitHub completion only when workspace config permits close or transition.
disable-model-invocation: true
---

# fur-done

Use this skill when implemented work has passed `fur-check`.

## Goal

Close the local task and capture progress without losing tracker sync or verification context.

## When to Use

- Acceptance criteria are met
- Verification passed or remaining gaps are explicitly accepted
- `fur-check` says the task is ready
- The task may need Jira/GitHub close or transition through config

## When NOT to Use

- Implementation is incomplete — use `fur-do`
- Review or verification has not happened — use `fur-check`
- Acceptance criteria are unmet — use `fur-task` or `fur-do`
- You only need a status summary — use `fur-status`

## Workflow

1. Read the task, `fur-check` result, and verification notes.
2. Confirm all acceptance criteria are satisfied.
3. Move the task from `tasks/backlog/` or `tasks/ready/` to `tasks/done/`.
4. Run `fur refresh` to create a progress snapshot.
5. If `Tracker Sync` exists, resolve `.fur.workspace/config.json`.
6. Close/transition external tracker only when the target is unambiguous and:
   - GitHub has `closeAllowed: true`.
   - Jira has `transitionAllowed: true`.
7. Report local move, snapshot, and tracker sync result.

## Rules

- Do not mark done when acceptance or verification is missing.
- Never fake tracker comments, close actions, or transitions.
- If config is ambiguous or completion is not allowed, close local only.
- Keep the completion summary short and useful for future context.
- Do not create unrelated follow-up tasks unless the user asks; note follow-up risks instead.

## Output

```md
## Done

- Local task: [old path] -> [done path]
- Snapshot: [progress path]
- Tracker sync: closed | transitioned | local-only | skipped

## Verification

[summary]

## Follow-up

[remaining risk or "none"]
```

## Suggested Next Step

`fur-status` to choose the next task, or `fur compact` if progress snapshots are accumulating.
