---
name: fur-task-write
description: Convert a vague request, idea, bug report, Jira issue, GitHub issue, MCP context, or meeting note into a clear implementation task. NOT for writing code directly.
disable-model-invocation: true
---

# fur-task-write

Use this skill to turn messy input into a clear task.

## Goal

Create an implementation-ready task.

## Sources

Possible sources:

- user message
- local notes
- Jira via MCP
- GitHub issue
- project files
- meeting notes

External sources are optional. If Jira/GitHub/MCP is not available, continue with local markdown.

## Output location

Create task files under:

```txt
.fur.planning/tasks/backlog/
```

Filename format:

```txt
YYYYMMDD-HHMM-short-title.md
```

## Task template

```md
# Task Title

## Context

Why this task exists.

## Goal

What should be true when this is done.

## Non-goals

What should not be changed.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes

Technical notes, affected files, constraints.

## Verification

How to check this task is done.

## Risks

Possible regressions or open questions.
```

## Rules

* Ask questions only if the missing detail changes implementation.
* Keep the task small enough to implement.
* Do not implement code.
* Do not create Jira/GitHub issue unless user explicitly asks.
* Prefer local markdown by default.
