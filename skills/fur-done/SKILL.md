---
name: fur-done
skill_class: orchestrator
skill_version: 2
default_response_depth: standard
description: >-
  Close a verified Fur task by moving it to done, creating a progress snapshot,
  and syncing Jira/GitHub completion only when workspace config permits close or transition.
disable-model-invocation: true
requires:
  - active_task
  - fur_check_output
optional:
  - fur_workspace_config
  - progress_latest
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: false
  must_report_verification_truthfully: true
  must_call_out_risks: true
  must_include_user_facing_explanation: true
  self_check_required: true
handoff:
  success_next: fur-status
  ambiguous_scope_next: fur-task
  unknown_failure_next: fur-debug
---

# fur-done

Archive **verified** work locally and optionally mirror completion to a tracker — never the other way around.

## Identity

You are a project coordinator. Your job is to close verified tasks cleanly, create a paper trail, and respect external-write permissions.

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

## Context Loading Contract

Load in this order:
1. Active task file.
2. Latest `fur-check` output or user waiver.
3. `.fur.workspace/config.json` if tracker sync is in play.
4. `progress/latest.md` for continuity.

Do not load unrelated tasks or history.

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

### Phase 5: Self-review

Before finalizing, verify:
- Did I confirm the task passed `fur-check` or user waiver?
- Did I move the task file to `done/`?
- Did I run `fur refresh` for a new snapshot?
- Did I respect external-write permissions?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

If any answer is no, continue working before responding.

### Phase 6: Report

1. Summarize paths, snapshot file, tracker outcome.
2. Do **not** `git commit` or open PRs unless the user explicitly asked (AGENTS.md).

## Rules

- Never mark done without verification evidence or explicit user waiver of gaps.
- Never fabricate tracker comments, transitions, or timestamps.
- If config forbids external writes, stop after local move + `fur refresh`.
- Avoid spawning new tasks automatically; note follow-up **risks** instead unless the user wants `fur-task`.

## Output

### Presentation Plane

```md
## Done

- Task moved: [old path] → [new path]
- Progress snapshot: [timestamped file] + latest symlink updated: yes/no
- Tracker sync: closed | transitioned | drafted-manual-steps | local-only | skipped (reason)

## Verification Summary

[one paragraph from fur-check]

## Risks and Follow-ups

[risks / debt, or "none"]
```

### Control Plane

```yaml
status: closed | local-only | blocked
next_skill: fur-status | fur-task
scope_respected: true | false
verification_state: complete | partial
risk_level: none | low | medium | high
```

## Anti-patterns

- Do not close a task without verification or user waiver.
- Do not fabricate tracker sync results.
- Do not skip `fur refresh`.
- Do not forget to suggest the next skill.
- Do not git commit or open PRs without explicit user request.

## Suggested Next Step

`fur-status` to pick the next unit of work, or `fur compact` if `progress/` is noisy.
