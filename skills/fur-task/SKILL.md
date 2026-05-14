---
name: fur-task
description: Single entry point for turning local requests, Jira/GitHub references, meeting notes, or technical findings into small Fur tasks; resolves workspace tracker config, asks clarification questions according to questionLevel, splits large work into phases, and drafts or writes external tracker tasks when config permits.
disable-model-invocation: true
---

# fur-task

Turn messy intent into **one small, verifiable** next step on disk (and optionally on a tracker) before any implementation.

## Goal

Create or select a focused task with clear acceptance criteria and verification, respecting `questionLevel` / `projectMaturity`, workspace tracker rules, and the filename + body conventions in `references/task-template.md`.

## When to Use

- Local feature, bug, refactor, chore, meeting notes, or vague request needs to become work.
- External pointer: Jira key, GitHub `#nn`, full issue URL, or “create issue …”.
- Large body of work must be split into phased **plans** + **tasks** under `.fur.planning/`.
- User asks what to pick next from the queue.
- A finding should become a tracker issue **and** `writeAllowed` / routing is unambiguous.

## When NOT to Use

- A task is already chosen and ready to implement → `fur-do`.
- Root cause unknown → `fur-debug` first, then return here with a crisp task.
- Post-implementation quality gate → `fur-check`.
- Closing verified work → `fur-done`.
- Read-only orientation → `fur-status`.

## Workflow

### Phase 1: Load policy and workspace

1. Read `.fur.planning/config.json` when present: `questionLevel`, `projectMaturity`, `questionPolicy`.
2. Read `.fur.workspace/config.json` only when external routing, imports, or writes are in play.
3. If neither file exists, recommend `fur-init` (skill) before continuing unless the user is only brainstorming.

### Phase 2: Classify input

Pick exactly one primary mode:

| Mode | Signals |
|------|-----------|
| External existing | Jira key, GitHub shorthand, issue URL |
| External create | “Open an issue”, “file on GitHub”, etc. |
| Local new | Plain description, bug report, idea |
| Next work | “What’s next?”, “what should I do?” |
| Split / plan | Explicitly too big for one session |

### Phase 3: Resolve tracker (if external)

1. Match repo + tracker using workspace `repositories[]` (path, Jira `projectKeys`, GitHub `owner/repo`, `mcp` hints).
2. If multiple targets match, **ask one** concrete disambiguation question — never guess `repoId` or MCP server.
3. External **writes** only when: single unambiguous target **and** the relevant `writeAllowed` / transition flags are true per workspace policy. Otherwise output a paste-ready issue body and stop.

### Phase 4: Clarify (questionLevel)

1. Prefer **repo discovery** (read code, existing tasks, `plans/`, `progress/latest.md`) over asking the user.
2. Apply `questionLevel` thresholds from `fur-init` / AGENTS.md: low = blockers only; normal = missing AC or verification; high = product/edge/rollout when thin.
3. Every local task must gain **Acceptance criteria** (checkboxes) and **Verification** (commands or explicit manual steps) before promotion to `ready/`.

### Phase 5: Write artifacts

1. **Filename**: follow `references/task-template.md` (`YYYYMMDD-HHMM-short-slug.md`).
2. **Default placement**: `tasks/backlog/` unless the user and evidence show it is immediately actionable → `tasks/ready/`.
3. **Large work**: add `plans/<slug>.md` with phases; create **one** backlog task per next slice; link plan path inside each task under Implementation notes.
4. **Tracker sync block**: always fill the template footer (`Source`, `External ID`, `Sync status`, …) — use `unsynced` / `drafted` until an ID exists.
5. **Next-work queries**: prefer the highest-priority `ready/` task with complete AC; if none, say what is missing (promotion criteria, blocked deps).

### Phase 6: Handoff

1. Return relative paths only; avoid pasting entire markdown bodies into chat.
2. Name the next skill: usually `fur-do`; sometimes `fur-status` or config fix instructions.

## Rules

- Do not implement product code in this skill.
- Do not invent tracker metadata (labels, assignees, statuses, IDs).
- Keep each task small enough for **one** focused `fur-do` session; split instead of bundling.
- Ambiguous external references → question, never silent default.
- Deeper questioning is governed by `questionLevel`; do not spawn a separate “interview” skill.
- External writes require explicit user approval **or** clear workspace permission (AGENTS.md).
- Long research belongs in `plans/` or `context/archive/` with a short pointer in the task file.

## Output

```md
## Task result

- Mode: created | selected | split | drafted-external | wrote-external | blocked-config
- Local task(s): [paths]
- Plan: [path or none]
- Tracker: local | jira | github | none
- questionLevel / projectMaturity: …

## Clarifications

[questions asked, or "none"]

## Next

fur-do | fur-status | fur-init | fix .fur.workspace config
```

## Suggested Next Step

`fur-do` on the chosen `ready/` task, or `fur-status` if the user only needed queue orientation.
