# Plan AI Output (Primary UX)

Users mostly work through chat, not CLI. When a plan is relevant, show a compact deterministic summary instead of dumping the full plan or historical diff.

CLI (`fur plan status`) is optional verification only; telling the user to run a command does not replace showing the dashboard in chat.

## When to show

| Skill | Required `## Plan summary` |
|-------|----------------------------|
| `fur-task` (split) | Yes — compact summary after creating the plan |
| `fur-task` (other) | One-line summary if active `plans/*.md` exist |
| `fur-status` | One line per active plan |
| `fur-done` | One-line updated summary when closing a plan-linked task |
| `fur-do` | One-line summary if task links a plan |

## How to compute (from disk)

1. Read `plans/<slug>.md`: frontmatter + `## Task manifest` table.
2. Scan `tasks/{backlog,ready,done}/`: match `Plan:` and `Plan task ID:`; refresh statuses.
3. Metrics: `Completion = done / total`.
4. Ignore legacy schedule fields if old plans contain them.

## Required chat format

Default compact form:

```md
## Plan summary

`auth-refactor`: 25% (2/8 done) · next: T3 Unit tests (`planned`)
```

Use the expanded table only when the user asks for plan details or the task is specifically about plan reconciliation:

````md
## Plan summary

**Auth refactor** · `auth-refactor`

| Field | Value |
|-------|-------|
| Completion | **25%** (2/8 done) |
| Next up | **T3** — Unit tests for auth (`planned`) |

| ID | Status | Est | Phase | Task |
|----|--------|-----|-------|------|
| T1 | done | M | phase-1 | `20260518-1200-extract-auth.md` |
| T2 | ready | S | phase-1 | `20260518-1210-session-middleware.md` |
| T3 | planned | M | phase-1 | — |
| ... | ... | ... | ... | ... |

_Source: `docs/ai/plans/auth-refactor.md`_
````

## Anti-patterns

- Saying only `run fur plan status` without pasting the dashboard.
- Showing hours, sessions, due dates, target dates, phase tables, or duration guesses.
- Pasting old and new plan rows as a diff in normal `fur-do` / `fur-done` output.
- Omitting completion percentage.
- Giving a plan file path without at least the compact summary.

## One-line rollup (after split)

`8 tasks · 25% complete (2/8) · next: T3 Unit tests`

## References

- Plan file template: `src/references/plan-template.md`
- TS formatter: `formatPlanDashboardMarkdown()` in `src/lib/plan-manifest.ts`
