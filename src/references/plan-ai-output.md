# Plan AI Output (Primary UX)

Users mostly work through **chat, not CLI**. Plan summary, completion %, and schedule must **always appear in the AI reply**.

CLI (`fur plan status`) is optional verification only; telling the user to run a command does **not** replace showing the dashboard in chat.

## When to show

| Skill | Required `## Plan summary` |
|-------|----------------------------|
| `fur-task` (split) | Yes — immediately after creating the plan |
| `fur-task` (other) | Short summary if active `plans/*.md` exist |
| `fur-status` | Yes — for each plan in `plans/` |
| `fur-done` | Yes — updated summary when closing a plan-linked task |
| `fur-do` | Compact summary at end if task links a plan |

## How to compute (from disk)

1. Read `plans/<slug>.md`: frontmatter + `## Task manifest` table.
2. Scan `tasks/{backlog,ready,done}/`: match `Plan:` and `Plan task ID:`; refresh statuses.
3. Metrics:
   - **Completion** = `done / total` (%)
   - **Progress** = weighted (done=100%, ready=50%, backlog=25%, planned=0%)
   - **Hours** = Est. column (S=1.5, M=3, L=6) or `estimated_hours`
   - **Due** = `target_end` (single date, no ranges)

Optional shell cross-check: `fur plan status <slug>` — still show the same block in chat.

## Required chat format

Use this structure **exactly** (headings and tables):

```md
## Plan summary

**Auth refactor** · `auth-refactor`

| Field | Value |
|-------|-------|
| Completion | **25%** (2/8 done) |
| Progress | **38%** (ready=50%, backlog=25%) |
| Total time | 30 hours |
| Sessions | 10 × 3 hours = 30 hours |
| Target end | **2026-06-02** |
| Next up | **T3** — Unit tests for auth (`planned`) |

```
[██████░░░░░░░░░░░░░░░░░░] 25%
```

| ID | Status | Est | Phase | Task |
|----|--------|-----|-------|------|
| T1 | done | M | phase-1 | `20260518-1200-extract-auth.md` |
| T2 | ready | S | phase-1 | `20260518-1210-session-middleware.md` |
| T3 | planned | M | phase-1 | — |
| … | … | … | … | … |

_Source: `.fur.planning/plans/auth-refactor.md`_
```

## Anti-patterns

- Saying only “run `fur plan status`” without pasting the dashboard.
- Vague durations like “2-3 weeks”; use net hours + `target_end`.
- Omitting completion %.
- Giving a plan file path without the summary block.

## One-line rollup (after split)

Before or after the manifest table:

`8 tasks · 30h · 10 sessions · due 2026-06-02 · 25% complete (2/8)`

## References

- Plan file template: `src/references/plan-template.md`
- TS formatter (same logic as tests/CLI): `formatPlanDashboardMarkdown()` in `src/lib/plan-manifest.ts`
