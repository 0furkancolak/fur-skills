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
optional:
  - fur_do_output
  - fur_workspace_config
  - progress_latest
  - state_json
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: false
  must_report_verification_truthfully: true
  must_call_out_risks: true
  must_include_user_facing_explanation: true
  self_check_required: true
---

# fur-done

Archive **verified** work locally and optionally mirror completion to a tracker — never the other way around.

## Identity

You are a project coordinator. Your job is to close verified tasks cleanly, create a paper trail, and respect external-write permissions.

## Goal

Run the internal check gate, move verified task markdown to `tasks/done/`, refresh `progress/latest.md` and `state.json` via `fur refresh`, and perform allowed tracker transitions only when workspace config is explicit.

## When to Use

- Implementation is complete and the user asks to close the task.
- A verified batch wave where every task shares the same active plan lock and `Batch group`.
- All acceptance criteria are satisfied or waived in writing by the user.
- You need a dated paper trail in `progress/` for long sessions.

## When NOT to Use

- Implementation is incomplete — finish the work before closing.
- Verification is missing or failed — run the internal check gate first; if still failing, report blockers instead of moving files.
- User has not approved external close when policy requires approval — stay local-only and say why.

## Context Loading Contract

Load in this order:
1. Active task file.
2. Latest implementation output or user waiver.
3. `docs/ai/state.json` when present, including plan lock state.
4. `.fur.workspace/config.json` if tracker sync is in play.
5. `progress/latest.md` for continuity.

Do not load unrelated tasks or history.

## Workflow

### Phase 1: Confirm closure bar

1. Re-read the task and latest implementation notes.
2. Run the internal check gate before any file move: map acceptance criteria, inspect touched diff, run verification commands from the task or context defaults, and record pass/fail/skipped with reasons.
3. If blockers, failed verification, or unmet acceptance criteria remain, do not move the task; report what must be fixed.
4. If the task lacks Tracker sync metadata, that is fine — mark `local` only.

### Phase 2: Move local task file

1. Move from `tasks/backlog/` or `tasks/ready/` → `tasks/done/` (same filename unless a naming collision forces rename — avoid collisions by planning filenames in `fur-task`).
2. Update any in-file `Sync status` field to reflect local completion (`closed` locally even if external pending).

Batch closure:

1. Accept multi-task closure only when every task shares the same `Plan lock` and `Batch group`.
2. Run or confirm the internal check gate per task before moving files.
3. Move verified task files to `tasks/done/`, update each matching manifest row to `done`, and leave any failed task in `tasks/ready/`.
4. If one task fails but others are safely verified, close only the verified subset and leave the failed task in `tasks/ready/`.

### Phase 3: Progress snapshot

1. From repo root run `fur refresh` so `progress/latest.md` points at a new timestamped snapshot and `docs/ai/state.json` is updated.
2. If snapshots pile up, mention `fur compact` (honors `FUR_PROGRESS_KEEP`, default 8).

### Phase 4: External tracker (optional)

1. Load `.fur.workspace/config.json`; resolve repo id for `PROJECT_ROOT`.
2. **GitHub close / comment**: only if routing is unambiguous **and** `closeAllowed` (or equivalent) is true — mirroring AGENTS.md external-write rules.
3. **Jira transition**: only if `transitionAllowed` true and transition name/ID is configured; never guess transitions.
4. If anything is ambiguous, complete **local** steps only and document the manual tracker action for the user.

### Phase 4b: Branch cleanup boundary

Keep branch, PR, merge, or worktree cleanup as an explicit user decision. Fur owns moving the task to `done/`, writing the progress snapshot, and syncing tracker completion when config permits.

### Phase 5: Self-review

Before finalizing, verify:
- Did I run the internal check gate or confirm a user waiver?
- Did I move the task file to `done/`?
- Did I run `fur refresh` for a new snapshot?
- Did I respect external-write permissions?
- Did I match the output contract for this skill class?

If any answer is no, continue working before responding.

### Phase 6: Update plan visibility in chat

1. If the closed task references `Plan:` / `Plan task ID:`, update that row to `done` in `plans/<slug>.md` manifest (Status + Task file path).
2. Re-read manifest + task folders; render only the compact one-line `## Plan summary` from `src/references/plan-ai-output.md` unless the user asks for the full dashboard.
3. If the plan still has ready work, name only that same plan's next task. Do not suggest unrelated ready tasks.
4. If the plan is complete, say the work is complete and new work can be started when desired.
5. If there is no plan lock and multiple active plans or ready tasks exist, do not auto-select another task; ask for an explicit plan/task.
6. Do not paste plan table diffs, schedule fields, target dates, phase tables, or old/new duplicate rows in normal closure output.

### Phase 7: Report

1. Summarize paths, snapshot file, tracker outcome.
2. Do **not** `git commit` or open PRs unless the user explicitly asked (AGENTS.md).

## Rules

- Never mark done without the internal check gate, a fresh Ready check result, or explicit user waiver of gaps.
- Never fabricate tracker comments, transitions, or timestamps.
- If config forbids external writes, stop after local move + `fur refresh`.
- Avoid spawning new tasks automatically; note follow-up **risks** instead unless the user asks for new tasks.
- Branch finishing does not replace Fur local closure, progress snapshots, or permitted tracker sync.
- Completion does not imply permission to jump to another conversation's task. Stay within the closed task's plan lock or stop at status.
- Batch closure is limited to one active plan lock and one `Batch group`; never batch-close arbitrary ready tasks.

## Output

```md
## Done

- Task moved: [old path] → [new path]
- Progress snapshot: [timestamped file] + latest symlink updated: yes/no
- State: `docs/ai/state.json` updated: yes/no
- Tracker sync: closed | transitioned | drafted-manual-steps | local-only | skipped (reason)

## Verification Summary

[one paragraph from the internal check gate]

## Plan summary

[If closed task linked a plan, one compact line: `slug`: percent (done/total) · next: task or complete.]

## Risks and Follow-ups

[risks / debt, or "none"]
```

Plain text only — no YAML footer.

## Anti-patterns

- Do not close a task without internal check evidence or user waiver.
- Do not fabricate tracker sync results.
- Do not skip `fur refresh`.
- Do not git commit or open PRs without explicit user request.

## Examples

Reference examples:
- `../_shared/examples/orchestrator-example.md`
- `../_shared/anti-patterns/global.md`
- `../_shared/anti-patterns/orchestrator.md`

Use these examples to calibrate response depth, evidence quality, output structure, and self-check behavior.
