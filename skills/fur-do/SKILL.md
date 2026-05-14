---
name: fur-do
description: Implement one selected Fur task or clearly scoped mini fix with minimal, complete code changes; includes small behavior-preserving cleanup but does not perform broad review or task planning.
---

# fur-do

Execute **exactly** the scoped work described in the active task — no parallel product design or tracker housekeeping.

## Goal

Deliver the smallest **complete** change set that satisfies every acceptance criterion the task defines, with evidence from cheap checks when available.

## When to Use

- A markdown task exists in `.fur.planning/tasks/ready/` (preferred) or the user explicitly points at one `backlog/` task to implement now.
- A **tiny** unambiguous fix (one file / one symbol) with implicit AC given inline by the user.
- Follow-up code tweaks right after partial implementation **within the same task scope**.

## When NOT to Use

- Requirements or AC are missing or contradictory → `fur-task`.
- Failure mode unknown → `fur-debug` until the cause is known.
- Implementation done; need review → `fur-check`.
- Verified and ready to archive → `fur-done`.

## Workflow

### Phase 1: Load scope

1. Read the selected task file end-to-end: Context, Goal, Non-goals, Acceptance criteria, Implementation notes, Verification.
2. Pull only **linked** plan snippets or files referenced in the task — avoid loading entire repo history.
3. Read `.fur.planning/context/verification.md` for project-default commands when the task does not override them.

### Phase 2: Align with codebase

1. Locate touched modules; match existing patterns (naming, error handling, tests, formatting).
2. If the task references a tracker issue, sync intent mentally — do not expand scope beyond the local task text.

### Phase 3: Implement

1. Apply the **narrowest** diff that meets AC; co-locate small refactors only when they touch the same lines for clarity.
2. Preserve behavior outside the stated scope; no drive-by renames across the tree.
3. For TypeScript, avoid `any`; if unavoidable, document why in the task or PR notes (not inside unrelated files).

### Phase 4: Verify (cheap → broad)

1. Run commands from the task’s **Verification** section, or from `context/verification.md`, narrowest first (`typecheck` / `lint` on touched package, then tests targeting changed modules).
2. If a command does not exist, say so and list what you ran manually instead — never fabricate green results.

### Phase 5: Report (do not close)

1. Summarize files, risks, and commands with real output snippets where helpful.
2. Do **not** move the task to `done/` or update trackers — that is `fur-done`.

## Rules

- No scope creep, no product redesign, no speculative features.
- No tracker comments, transitions, or GitHub/Jira writes — `fur-task` / `fur-done` own that boundary.
- Do **not** mark the task complete in markdown; `fur-check` + `fur-done` do.
- **Commits and PRs** always need explicit user approval (AGENTS.md); do not `git commit` or open PRs unless asked.
- If halfway through the work you discover missing requirements, **stop** and hand back to `fur-task`.
- Context hygiene: if the session is huge, suggest summarizing via `fur compact` / `progress/latest.md` per `references/context-window.md`.

## Output

```md
## Implemented

[1–3 sentences tied to AC IDs or bullets]

## Files changed

- `path` — [intent of change]

## Checks

[commands + exit codes / key log lines, or honest "not run" + reason]

## Risks / follow-ups

[known gaps, or "none"; call out missing tests explicitly]
```

## Suggested Next Step

`fur-check` before any celebration; if checks fail with unknown cause, `fur-debug`.
