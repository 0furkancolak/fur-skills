# Plan Template

Use for large work split across multiple `fur-do` sessions. Save as `.fur.planning/plans/<slug>.md`.

Every split **must** include the manifest table below so agents and `fur plan status` can answer: how many tasks, how long (net hours + date), what's done.

## Time rules (required)

- **No ranges:** do not use `2-3 weeks`, `8–12 sessions`, `3-4 days`.
- **Single numbers:** hours, session count, and dates must be exact.
- **Target end:** `target_end: YYYY-MM-DD` (one day).
- **Task Est.:** only `S` / `M` / `L` — fixed hours (see below).

## Filename

```
plans/<short-slug>.md
```

Example: `plans/auth-refactor.md`

## Template

```md
---
plan_version: 1
slug: auth-refactor
title: Auth refactor
status: active
estimated_tasks: 8
estimated_sessions: 10
session_hours: 3
estimated_hours: 30
target_start: 2026-05-19
target_end: 2026-06-02
created: 2026-05-18
---

# Auth refactor

## Overview

| Field | Value |
|-------|-------|
| Total tasks (planned) | 8 |
| Completion | 0% (0/8 done) — updated via agent / `fur plan status` |
| Progress (weighted) | 0% — ready=50%, backlog=25%, done=100% |
| Total time | 30 hours |
| Session plan | 10 sessions × 3 hours = 30 hours |
| Start | 2026-05-19 |
| Target end | 2026-06-02 |
| Current phase | phase-1 |

One paragraph: what we're building, why now, definition of done for the **whole** plan.

## Phases

| Phase | Goal | Tasks | Hours | Target end | Status |
|-------|------|-------|-------|------------|--------|
| phase-1 | Foundation | 3 | 12 | 2026-05-23 | in_progress |
| phase-2 | API migration | 3 | 12 | 2026-05-30 | planned |
| phase-3 | Cleanup + docs | 2 | 6 | 2026-06-02 | planned |

## Task manifest

Status values: `planned` (not filed yet) · `backlog` · `ready` · `done` · `deferred` · `cancelled`

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

### Estimate key (fixed hours — no ranges)

| Est. | Hours |
|------|-------|
| S | 1.5 |
| M | 3 |
| L | 6 |

`estimated_hours` must equal the sum of manifest Est. hours (adjust tasks or frontmatter until they match).

## Dependencies

- T2 blocks on T1
- T4, T5 block on T2
- T8 blocks on T4, T5, T6

## Risks and open questions

- …

## Changelog

| Date | Change |
|------|--------|
| 2026-05-18 | Initial plan + manifest (8 tasks, 30 hours, due 2026-06-02) |
```

## Rules for fur-task (split mode)

1. **Always** create or update `plans/<slug>.md` with a full task manifest before creating task files.
2. Put **every** planned slice in the manifest — including tasks not yet filed (`planned`).
3. Frontmatter: `estimated_tasks`, `estimated_sessions` (integer), `session_hours`, `estimated_hours`, `target_start`, `target_end` — **no ranges**.
4. `estimated_hours` = sum of manifest Est. hours (S/M/L table).
5. `estimated_sessions` × `session_hours` should equal `estimated_hours` (or explain mismatch in Risks).
6. Phases: **Hours** as one number; **Target end** as ISO date per phase.
7. Each created task file must include under Implementation notes:
   - `Plan: plans/<slug>.md`
   - `Plan task ID: T1`
8. Chat rollup: `8 tasks · 30h · 10 sessions · due 2026-06-02 · 0% complete (0/8)`.
9. **AI must show `## Plan summary` in chat** — see `src/references/plan-ai-output.md` (CLI optional).

## Linking in task files

```md
## Implementation notes

Plan: plans/auth-refactor.md
Plan task ID: T1
```
