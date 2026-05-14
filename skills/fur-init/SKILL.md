---
name: fur-init
description: Initialize a simple `.fur.planning` workspace in the current project for tasks, plans, progress, and agent handoff. Use when starting Fur workflow in a repo.
disable-model-invocation: true
---

# fur-init

Use this skill when starting Fur workflow inside a project.

## Goal

Create a simple `.fur.planning` workspace for AI-assisted development.

## Folder structure

Create:

```txt
.fur.planning/
  tasks/
    backlog/
    ready/
    done/
  plans/
  progress/
  context/
```

## Gitignore decision

Ask the user one question:

```txt
Should `.fur.planning/` be added to `.gitignore`?
```

If yes, add:

```txt
.fur.planning/
```

to `.gitignore`.

If no, keep it trackable.

## Rules

* Do not create complex config files yet.
* Do not connect Jira/GitHub yet.
* Do not start implementation yet.
* Only initialize the planning workspace.

## Output

After initialization, summarize:

* created folders
* whether `.gitignore` was updated
* next suggested command: `fur-task-write`
