# Completion Checklist

## Runtime

- [x] `fur init` writes `docs/ai/` layout and config
- [x] `fur init` sets `CLAUDE.md` → `AGENTS.md` only
- [x] Re-run refreshes discovered context signals

## Skills

- [x] Each `fur-*/SKILL.md` is self-contained (no cross-skill routing)
- [x] `fur-check` and `fur-debug` removed; listed in `OBSOLETE_SKILLS`

## Automation

- [x] `fur repo-doctor`
- [x] `fur eval meta`
- [x] GitHub Actions quality workflow

## Docs

- [x] `AGENTS.md` — context files and init
- [x] `CLAUDE.md` — AGENTS redirect only
- [x] `README.md` — install and layout

## Verify

```bash
bun install
fur repo-doctor
bun test src/tests
fur eval meta fur-init
fur eval meta fur-do
fur eval meta fur-task
```
