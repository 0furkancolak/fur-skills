# Agent Instructions

Context-first agent setup for local projects. Skills in this repo are independent; load only the one that matches the current job.

## Context layout (`docs/ai/`)

| Path | Purpose |
|------|---------|
| `config.json` | Repo behavior: `questionLevel`, `responseDepth`, `evidenceStyle`, `verificationStrictness`, `automationMode` |
| `progress/latest.md` | Short session snapshot; prefer this over pasting chat history |
| `context/architecture.md` | Durable structure and entrypoints |
| `context/verification.md` | Test, lint, typecheck commands |
| `context/mcp.md` | Available MCP / external tools |
| `context/issue-tracker.md` | Tracker mode and write rules |
| `context/conventions.md` | Team or repo conventions |
| `tasks/{backlog,ready,done}/` | Optional local task markdown |
| `plans/` | Optional larger plans |

Hygiene: `src/references/context-window.md`, `src/references/context-pack-rules.md`. Compact long sessions with `fur compact` → `progress/archive/`.

## Init and refresh

Run `fur init` at project root to create or refresh `docs/ai/`, wire `AGENTS.md`, and set `CLAUDE.md` to point at `AGENTS.md` only.

Re-run after build/test commands, directory layout, agent rules, or tracker setup change. Init updates discovered signals (e.g. `architecture.md`, `verification.md`).

## Workspace config

- Multi-repo tracker routing: `.fur.workspace/config.json`
- Repo-local behavior: `docs/ai/config.json`
- External writes need explicit user approval or clear workspace `writeAllowed`
- Commit and PR creation always need explicit user approval

## This package

```txt
src/cli.ts          CLI entry (package.json bin)
src/skills/         Agent skills (`fur-*/SKILL.md`)
src/references/     Context, planning, task templates
src/evals/          Prompt fixtures and graders
src/tests/          bun test src/tests
```

Install skills: `fur install` or `make install`. Obsolete installed skill symlinks are removed on install (`src/lib/paths.ts` → `OBSOLETE_SKILLS`).

## Skill files

Each `src/skills/fur-*/SKILL.md` is self-contained: Goal, When to Use, When NOT to Use, Workflow, Rules, Output. No skill should route to another skill.

`SKILL.md` agent text is English; user-facing repo docs may be Turkish.

## Defaults (`docs/ai/config.json`)

- New projects: `questionLevel: high`, `projectMaturity: new`
- Established: `questionLevel: normal`
- `responseDepth: standard` unless overridden
- Prefer concise replies; expand only when safety or audit needs it

## Response style

- **Plain text output** — markdown headings and short bullets; no trailing YAML blocks (`status`, `next_skill`, control plane).
- **Caveman** — only when the user invokes caveman (`/caveman`, caveman skill attached) or `responseDepth: concise` and compression does not harm clarity. Otherwise use normal concise prose.
- **Superpowers** — user may attach `using-superpowers`, `systematic-debugging`, `verification-before-completion`, `test-driven-development`, etc. for implementation or debug. Fur skills do not auto-invoke them; follow the attached skill when present.
