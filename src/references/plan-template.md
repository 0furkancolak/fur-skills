# Plan Template

Use for large work split across multiple `fur-do` sessions. Save as `docs/ai/plans/<slug>.md`.

Plans track deterministic completion only. Do not estimate dates, sessions, or hours.

## Time and Schedule Rules

- Do not write schedule fields in new plans.
- Do not describe plan length with weeks, months, days, hours, due dates, or session counts.
- User-facing progress is only `done / total` plus the ASCII percentage bar.
- `Size` is a complexity label (`S`, `M`, `L`, `XL`), not a time estimate.

## Filename

```txt
plans/<short-slug>.md
```

Example: `plans/auth-refactor.md`

## Template

```md
---
plan_version: 2
slug: auth-refactor
title: Auth refactor
status: active
estimated_tasks: 8
created: 2026-05-18
updated: 2026-05-18
---

# Auth refactor

## Overview

| Field | Value |
|-------|-------|
| Total tasks | 8 |
| Completion | 0% (0/8 done) |
| Current phase | phase-1 |
| Next task | T1 |

One paragraph: what we're building, why now, and the definition of done for the whole plan.

## Phases

| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| phase-1 | Foundation | 3 | in_progress |
| phase-2 | API migration | 3 | planned |
| phase-3 | Cleanup + docs | 2 | planned |

## Task manifest

Status values: `planned` (not filed yet) · `backlog` · `ready` · `done` · `deferred` · `cancelled`

Size values: `S` · `M` · `L` · `XL`

| ID | Title | Phase | Est. | Status | Task file | Slice | Closure |
|----|-------|-------|------|--------|-----------|-------|---------|
| T1 | Extract auth service | phase-1 | M | ready | tasks/ready/20260518-1200-extract-auth.md | A | close with fur-done before T2 |
| T2 | Add session middleware | phase-1 | S | backlog | tasks/backlog/20260518-1210-session-middleware.md | A | close with fur-done before T4 |
| T3 | Unit tests for auth | phase-1 | M | planned | | B | close independently when tests pass |
| T4 | Migrate login API | phase-2 | L | planned | | C | close after T2 |
| T5 | Migrate signup API | phase-2 | L | planned | | D | close after T2 |
| T6 | Deprecate legacy routes | phase-2 | M | planned | | E | close after T4/T5 |
| T7 | Update README + runbook | phase-3 | S | planned | | F | close after API behavior settles |
| T8 | Remove dead code | phase-3 | S | planned | | E | close after T4/T5/T6 |

## Execution notes

- Plan lock: `auth-refactor`; every created task must include `Plan lock: auth-refactor`.
- Independent slices may be grouped into ready waves when dependencies allow; each slice must report verification evidence before `fur-done`.
- Ready wave batch groups use `<slug>-wave-N`. Tasks in the same wave share a `Batch group` and may be executed by one `fur-do` batch.
- `fur-done` closes tasks for this plan only. When the manifest reaches 100%, report that the plan is complete and do not suggest unrelated queued work.

## Dependencies

- T2 blocks on T1
- T4, T5 block on T2
- T8 blocks on T4, T5, T6

## Risks and open questions

- ...

## Changelog

| Date | Change |
|------|--------|
| 2026-05-18 | Initial plan + manifest (8 tasks, 0% complete) |
```

## Rules for fur-task (split mode)

1. Create or update `plans/<slug>.md` with a full task manifest before creating task files.
2. Put every planned slice in the manifest, including tasks not yet filed (`planned`).
3. Frontmatter must not contain schedule fields.
4. Add `Execution notes` with plan lock, independent slices, and closure behavior.
5. Create only the next actionable task file(s) now; do not silently drop future slices from the manifest.
6. When the next executable wave has multiple independent ready tasks, create task files for the whole wave and give each task the same `Batch group`.
7. Each created task must include `Plan: plans/<slug>.md`, `Plan task ID: Tn`, `Plan lock: <slug>`, `Execution slice: <slice>`, `Batch group: <slug>-wave-N`, and `Batch dependencies: ...` under Implementation notes.
8. Chat rollup: `8 tasks · 0% complete (0/8) · next: T1 Extract auth service`.
9. AI must show `## Plan summary` in chat — see `src/references/plan-ai-output.md`.

## Linking in task files

```md
## Implementation notes

Plan: plans/auth-refactor.md
Plan task ID: T1
Plan lock: auth-refactor
Execution slice: A
Batch group: auth-refactor-wave-1
Batch dependencies: none
```
