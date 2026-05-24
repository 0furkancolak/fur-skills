# Plan Template

Use for large work split across multiple `fur-do` sessions. Save as `.fur.planning/plans/<slug>.md`.

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

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Extract auth service | phase-1 | M | ready | tasks/ready/20260518-1200-extract-auth.md |
| T2 | Add session middleware | phase-1 | S | backlog | tasks/backlog/20260518-1210-session-middleware.md |
| T3 | Unit tests for auth | phase-1 | M | planned | |
| T4 | Migrate login API | phase-2 | L | planned | |
| T5 | Migrate signup API | phase-2 | L | planned | |
| T6 | Deprecate legacy routes | phase-2 | M | planned | |
| T7 | Update README + runbook | phase-3 | S | planned | |
| T8 | Remove dead code | phase-3 | S | planned | |

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
4. Create only the next actionable task file(s) now; do not silently drop future slices from the manifest.
5. Each created task must include `Plan: plans/<slug>.md` and `Plan task ID: Tn` under Implementation notes.
6. Chat rollup: `8 tasks · 0% complete (0/8) · next: T1 Extract auth service`.
7. AI must show `## Plan summary` in chat — see `src/references/plan-ai-output.md`.

## Linking in task files

```md
## Implementation notes

Plan: plans/auth-refactor.md
Plan task ID: T1
```
