---
name: fur-done
description: Close a verified Fur task by moving it to done, creating a progress snapshot, and syncing Jira/GitHub completion only when workspace config permits close or transition.
disable-model-invocation: true
---

# fur-done

Archive **verified** work locally and optionally mirror completion to a tracker — never the other way around.

## Goal

Move the task markdown to `tasks/done/`, refresh `progress/latest.md` via `fur refresh`, and perform allowed tracker transitions only when workspace config is explicit.

## When to Use

- `fur-check` outcome is **Ready** (or user explicitly accepts stated gaps).
- All acceptance criteria are satisfied or waived in writing by the user.
- You need a dated paper trail in `progress/` for long sessions.

## When NOT to Use

- Implementation incomplete → `fur-do`.
- Verification missing / failed → `fur-check` or `fur-debug`.
- User has not approved external close when policy requires approval → stay local-only and say why.

## Workflow

### Phase 1: Confirm closure bar

1. Re-read the task + latest `fur-check` notes; ensure no open Blockers remain unless user waived them.
2. If the task lacks Tracker sync metadata, that is fine — mark `local` only.

### Phase 2: Move local task file

1. Move from `tasks/backlog/` or `tasks/ready/` → `tasks/done/` (same filename unless a naming collision forces rename — avoid collisions by planning filenames in `fur-task`).
2. Update any in-file `Sync status` field to reflect local completion (`closed` locally even if external pending).

### Phase 3: Progress snapshot

1. From repo root run `fur refresh` so `progress/latest.md` points at a new timestamped snapshot (git status + counts + ready list).
2. If snapshots pile up, mention `fur compact` (honors `FUR_PROGRESS_KEEP`, default 8).

### Phase 4: External tracker (optional)

1. Load `.fur.workspace/config.json`; resolve repo id for `PROJECT_ROOT`.
2. **GitHub close / comment**: only if routing is unambiguous **and** `closeAllowed` (or equivalent) is true — mirroring AGENTS.md external-write rules.
3. **Jira transition**: only if `transitionAllowed` true and transition name/ID is configured; never guess transitions.
4. If anything is ambiguous, complete **local** steps only and document the manual tracker action for the user.

### Phase 5: Report

1. Summarize paths, snapshot file, tracker outcome.
2. Do **not** `git commit` or open PRs unless the user explicitly asked (AGENTS.md).

## Rules

- Never mark done without verification evidence or explicit user waiver of gaps.
- Never fabricate tracker comments, transitions, or timestamps.
- If config forbids external writes, stop after local move + `fur refresh`.
- Avoid spawning new tasks automatically; note follow-up **risks** instead unless the user wants `fur-task`.

## Output

```md
## Done

- Task moved: [old path] → [new path]
- Progress snapshot: [timestamped file] + latest symlink updated: yes/no
- Tracker sync: closed | transitioned | drafted-manual-steps | local-only | skipped (reason)

## Verification summary

[one paragraph from fur-check]

## Follow-ups

[risks / debt, or "none"]
```

## Suggested Next Step

`fur-status` to pick the next unit of work, or `fur compact` if `progress/` is noisy.
