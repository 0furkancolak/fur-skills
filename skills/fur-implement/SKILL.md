---
name: fur-implement
description: Implement one small task or vertical slice from `.fur.planning/tasks/ready` or a user-provided task. NOT for large multi-phase projects.
---

# fur-implement

Use this skill to implement one small task.

## Goal

Implement a focused task with minimal scope.

## Workflow

1. Read the task.
2. Identify relevant files.
3. Search existing project patterns.
4. Make a short plan.
5. Implement the smallest complete change.
6. Run relevant checks if available.
7. Summarize changed files and risks.

## Rules

- Do not refactor unrelated code.
- Do not introduce unnecessary abstractions.
- Do not change public APIs unless required.
- Follow existing project style.
- Prefer type-safe code.
- If tests/checks fail, say so clearly.

## Output

```md
## Implemented

## Files changed

## Checks run

## Risks / follow-ups
```
