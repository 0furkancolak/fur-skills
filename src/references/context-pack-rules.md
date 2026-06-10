# Context Pack Rules

These rules decide what context to load, in what order, and what to skip. They apply to every skill unless the skill overrides with a specific "Context Loading Contract" section.

## Default Reading Order

Always read in this order, stopping early if the task is trivial:

1. `docs/ai/config.json` — `responseDepth`, `evidenceStyle`, `verificationStrictness`, `questionLevel`, `projectMaturity`.
2. `docs/ai/progress/latest.md` — current project state.
3. **Active task** — the target file in `tasks/ready/` or the user-provided task.
4. Only the relevant files under `docs/ai/context/` (e.g., `verification.md`, `mcp.md`).

## Context Depth Modes

### Lean Mode (default for orchestrator skills, concise depth)

- Load config + latest progress + active task only.
- Do not load plan history, archived context, or unrelated tasks.
- Cap inline content at ~50 lines; link to files for the rest.

### Standard Mode (default for planner and gate skills, standard depth)

- Load lean mode items.
- Add linked plan snippets referenced in the task.
- Add `context/verification.md` if the task does not override verification.
- Add one previous check note or prior task in the same area for continuity.

### Rich Mode (default for executor and diagnostic skills, deep depth)

- Load standard mode items.
- Add source files directly touched by the task.
- Add related tests or fixtures.
- Add architectural docs or ADRs referenced in the task.
- For `fur-debug`, add logs, traces, or reproduction artifacts.

## Context Hygiene Rules

- Do not paste full text of completed tasks; provide file paths.
- Move stale backlog items to `context/archive/`; leave a 5–10 line summary + link.
- For sliced work, load only the current slice; link to the plan file.
- Never carry the full text of more than 2–3 active tasks in chat context at once.
- Link to files instead of pasting when content is longer than ~50 lines.
- For long sessions, suggest `fur compact` to archive old progress.

## What to Skip

| Do not load | Why |
|---|---|
| Entire plan history | Load only the current phase or slice. |
| All done tasks | Use `latest.md` summary instead. |
| Unrelated modules | Stay within the blast radius defined by the task. |
| Full dependency source | Link to docs or type definitions instead. |
| Binary assets | Use descriptions or hashes, not raw bytes. |

## Context Budget

A rough token budget per skill class:

| Class | Lean | Standard | Rich |
|---|---|---|---|
| orchestrator | 2k | 4k | 8k |
| planner | 4k | 8k | 12k |
| gate | 4k | 8k | 12k |
| executor | 4k | 8k | 16k |
| diagnostic | 8k | 12k | 20k |

These are guidelines, not hard limits. Prefer linking over inlining when near the budget.
