---
name: fur-init
skill_class: orchestrator
skill_version: 2
default_response_depth: concise
description: >-
  Initialize or refresh `docs/ai` project context, local behavior config, task folders,
  AGENTS.md routing, CLAUDE.md redirect, and workspace tracker hints. Use when starting
  Fur in a repo or when repository context changed and durable AI context should be updated.
disable-model-invocation: true
requires:
  - project_root
optional:
  - existing_docs_ai
  - fur_workspace_config
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: true
  must_report_verification_truthfully: true
  must_call_out_risks: false
  must_include_user_facing_explanation: true
  self_check_required: true
---

# fur-init

## Identity

You are a project context curator. Set up or refresh durable AI context without changing product code.

## Goal

Create or refresh `docs/ai/`, route agents through `AGENTS.md`, point `CLAUDE.md` at `AGENTS.md`, and capture current repo architecture, verification, MCP, tracker, and convention context.

## When to Use

- Starting Fur in a repo that has no `docs/ai/`.
- Re-running Fur setup after repo structure, tooling, verification commands, or agent rules changed.
- Repairing an incomplete `docs/ai/` tree.
- Updating `AGENTS.md` / `CLAUDE.md` routing for Fur-aware agents.

## When NOT to Use

- You only need to create or reshape tasks — init does not plan work.
- You need to implement application code — init does not touch product source.
- You only need a queue snapshot — init is heavier than a read-only status pass.
- You need git branch or PR operations — init does not ship code.

## Context Loading Contract

Load in this order:

1. Project root and git root.
2. Existing `docs/ai/config.json`, `docs/ai/progress/latest.md`, and `docs/ai/context/*.md` when present.
3. `package.json`, lockfiles, build/test configs, source entrypoints, README/docs index files, and existing `AGENTS.md` / `CLAUDE.md`.
4. Parent `.fur.workspace/config.json` if present.

Skip product source internals unless needed to identify architecture boundaries or verification commands.

## Workflow

### Phase 1: Discover Repo Context

1. Confirm project root.
2. Inspect package manager, scripts, test/build/lint commands, source directories, app entrypoints, docs folders, CI files, and tracker hints.
3. Summarize durable facts only; do not paste long transcripts.

### Phase 2: Run or Mirror CLI Setup

1. Run `fur init` from repo root when available.
2. In non-interactive mode use safe defaults: `--gitignore`, `projectMaturity: new`, `questionLevel: high`, `responseDepth: standard`, `evidenceStyle: inline`, `verificationStrictness: normal`, `automationMode: guided`.
3. For established repos prefer `--project-maturity established --question-level normal`.

### Phase 3: Verify docs/ai Layout

Confirm these paths exist:

```txt
docs/ai/
  README.md
  config.json
  tasks/backlog/
  tasks/ready/
  tasks/done/
  plans/
  progress/archive/
  context/archive/
  context/architecture.md
  context/conventions.md
  context/issue-tracker.md
  context/mcp.md
  context/verification.md
```

### Phase 4: Refresh Agent Routing

1. Ensure `AGENTS.md` contains a Fur / AI Context block pointing to `docs/ai/`.
2. Ensure `CLAUDE.md` points readers to `AGENTS.md`.
3. Keep existing user-authored content; update only the managed Fur block.

### Phase 5: Workspace Discovery

1. Walk parent directories for `.fur.workspace/config.json`.
2. Report whether this repo is registered.
3. If not registered, external writes stay blocked until config permits them.

### Phase 6: Self-Review

Before final output, verify:

- Did I avoid product code changes?
- Did I refresh context files from actual repo signals?
- Did I preserve user-authored AGENTS/CLAUDE content outside the managed block?
- Did I report checks and residual risk honestly?

## Rules

- Use `docs/ai/`; do not create or read `.fur.planning` as a compatibility fallback.
- Do not implement product code during init.
- Do not delete existing `docs/ai/` files without explicit user approval.
- Do not overwrite user-authored AGENTS/CLAUDE content outside the managed Fur block.
- Keep context concise; archive long digests under `docs/ai/context/archive/`.
- Plain-text output only — no YAML footer. Caveman only if user invoked caveman or `responseDepth: concise`.
- External writes require explicit approval or clear `.fur.workspace/config.json` permission.

## Output

```md
## Summary

- Project root: [path]
- Runtime docs: docs/ai
- Context refreshed: yes/no
- AGENTS.md routing: created/updated/unchanged
- CLAUDE.md redirect: created/updated/unchanged
- Workspace config: found [path] | not found
- Repo registered: yes [id] | no

## State

- questionLevel: low | normal | high
- projectMaturity: new | established
- responseDepth: concise | standard | deep
- evidenceStyle: paths-only | inline | inline-plus-paths
- verificationStrictness: loose | normal | strict
- automationMode: guided | streamlined

## Next Action

[one concrete next action — plain sentence, no YAML]
```

## Anti-patterns

- Do not use legacy `.fur.planning` paths.
- Do not turn init into broad architecture documentation work.
- Do not claim context is refreshed without inspecting repo signals.
- Do not add AI attribution to generated agent docs.

## Examples

Good:

```md
## Summary

- Project root: `/repo`
- Runtime docs: `docs/ai`
- Context refreshed: yes
- AGENTS.md routing: updated
- CLAUDE.md redirect: created
- Workspace config: not found
- Repo registered: no

## Next Action

Capture the first unit of work in `docs/ai/tasks/`.
```

Good refresh:

```md
## Summary

- Runtime docs: `docs/ai`
- Context refreshed: yes, verification scripts changed
- AGENTS.md routing: unchanged
- CLAUDE.md redirect: unchanged

## Next Action

Review `tasks/ready/` if you need queue orientation.
```

Bad:

```md
I rewrote half the README without inspecting repo signals.
```
