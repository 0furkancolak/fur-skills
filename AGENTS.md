# Agent Instructions

This repo contains a personal AI agent skill set for a small, fast project workflow.

## General Rules

- Every skill folder must start with `fur-`.
- Every skill must contain `SKILL.md`.
- Keep the core loop small and single-purpose.
- External services are optional; local markdown is the fallback.
- External writes require either explicit user approval or clear `.fur.workspace/config.json` permission for the target repo/tracker.
- Commit and PR creation always require explicit user approval.
- Every skill output must end with a suggested next step.
- Context hygiene: follow `references/context-window.md` and use `fur compact` / `progress/latest.md`.

## Skill Quality Standards

- Each `SKILL.md` must include frontmatter, Goal, When to Use, When NOT to Use, Workflow, Rules, Output, and Suggested Next Step.
- Multi-phase workflows must label each phase clearly.
- Keep instructions concrete and concise.
- Prefer config-controlled behavior over adding new skills.

## Core Workflow

```txt
fur-init -> fur-task -> fur-do -> fur-check -> fur-done -> fur-status
                 \-> fur-debug ->/
```

## Repo Structure

```txt
skills/
  fur-init/       -> Initialize .fur.planning and local behavior config
  fur-task/       -> Create/select/split/import/draft tasks
  fur-do/         -> Implement one selected task
  fur-check/      -> Review and verify implemented work
  fur-done/       -> Close local task, snapshot, optional tracker sync
  fur-status/     -> Show progress and next action
  fur-debug/      -> Diagnose unknown root cause
  fur-ui-design/  -> UI design direction before coding
  fur-ui-clone/   -> Pixel-perfect website clone pipeline from browser extraction/specs
  fur-ui-review/  -> UI/UX review for implemented interfaces
  .opencode/commands/clone-website.md -> OpenCode slash command for website cloning
bin/
  fur             -> CLI helper
references/
  planning-layout.md
  task-template.md
  context-window.md
```

## Obsolete Skills

These are intentionally removed and should be cleaned from installed skill directories:

```txt
fur-task-write
fur-task-import
fur-task-external-write
fur-task-pick
fur-implement
fur-review
fur-task-done
fur-refresh
fur-progress
fur-grill
fur-simplify
fur-parallel
fur-quick
```

## Config

- Workspace tracker routing: `.fur.workspace/config.json`
- Repo-local behavior: `.fur.planning/config.json`
- `questionLevel`: `low`, `normal`, or `high`
- `projectMaturity`: `new` or `established`

Default preference:

- New projects use `questionLevel: high`.
- Established projects usually use `questionLevel: normal`.

## Learned User Preferences

- Bu repoda asistan cevaplarında Türkçe kullanılması tercih edilir.
- Geniş planlar yerine küçük kapsam ve adım adım ilerleme tercih edilir.
- README içinde skill ve komutların hangi sırayla kullanılacağı ve parçaların nasıl birleştiği net anlatılmalıdır.
- Uzun oturumlarda bağlam penceresi için sıkıştırma veya özetleme kullanılmalı.
