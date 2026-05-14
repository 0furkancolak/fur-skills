---
name: fur-task
description: Single entry point for turning local requests, Jira/GitHub references, meeting notes, or technical findings into small Fur tasks; resolves workspace tracker config, asks clarification questions according to questionLevel, splits large work into phases, and drafts or writes external tracker tasks when config permits.
disable-model-invocation: true
---

# fur-task

Use this skill whenever work needs to be understood, imported, written, selected, or split before implementation.

## Goal

Create or select one small, clear, verifiable task with minimum wasted context and the right amount of clarification for the project.

## When to Use

- The user gives a local feature, bug, refactor, chore, meeting note, or vague request
- The user gives `NAF-11`, `#56`, a Jira URL, or a GitHub issue URL
- A large issue needs phase-based local tasks under `.fur.planning/`
- The user asks what to work on next
- A technical finding should become a Jira/GitHub issue and config allows external writes

## When NOT to Use

- A task is already selected and ready to implement — use `fur-do`
- The root cause of a bug is unknown — use `fur-debug`
- You need a quality gate after implementation — use `fur-check`
- You need to mark completed work done — use `fur-done`
- You only need status — use `fur-status`

## Workflow

1. Load `.fur.planning/config.json` if present and read `questionLevel`, `projectMaturity`, and `questionPolicy`.
2. Load `.fur.workspace/config.json` only when tracker routing or external write behavior is needed.
3. Classify the input:
   - External existing issue: Jira key, GitHub shorthand, or issue URL.
   - External new issue request: user asks to create/write Jira or GitHub task.
   - Local task request: user text, notes, bug report, or product idea.
   - Next-work request: user asks what remains or what to do next.
4. Resolve tracker references through workspace config. If more than one repo/tracker matches, ask one direct question.
5. Apply clarification policy:
   - `low`: ask only for blocker ambiguity, unsafe tracker routing, or high-risk irreversible choices.
   - `normal`: ask when scope, acceptance criteria, tracker target, or verification is missing.
   - `high`: also ask product, edge-case, data, and rollout questions when requirements are thin.
6. Prefer answering discoverable questions by inspecting repo files, tasks, plans, and config before asking the user.
7. Create or update local markdown:
   - Small work: one task under `.fur.planning/tasks/backlog/` unless it is clearly ready.
   - Large work: one plan under `.fur.planning/plans/` plus small phase tasks.
   - Next-work request: choose one ready task or explain what is missing.
8. For external writes, write only when workspace config selects one target and `writeAllowed` is true; otherwise produce a ready body.
9. Return concise paths, unresolved questions, and the next skill.

## Rules

- Do not implement code in this skill.
- Do not guess tracker/repo routing. Ambiguous external references always require a question.
- Keep local tasks small enough for one focused `fur-do` session.
- Every task needs acceptance criteria and verification.
- Preserve tracker metadata in `Tracker Sync`.
- External labels, assignees, milestones, and statuses must come from the tracker; never invent them.
- Keep chat concise: reference file paths instead of pasting long task bodies.
- Deeper questioning is controlled by `questionLevel`; do not route to a separate questioning skill.

## Output

```md
## Task Result

- Mode: created | selected | split | drafted external | written external
- Local task(s): [paths]
- Plan: [path, if created]
- Tracker: [local | jira | github | none]
- Question level: [low | normal | high]

## Clarifications

[questions asked or "none"]

## Next

fur-do | fur-status | fix config
```

## Suggested Next Step

`fur-do` for a selected/ready task, or `fur-status` if you only needed orientation.
