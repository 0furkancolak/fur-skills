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
  _shared/
    overlays/
      claude.md           -> XML tags, role framing, effort hints for Anthropic Claude
      openai-reasoning.md -> Developer message style, structured outputs for OpenAI reasoning models
      generic.md          -> Portable markdown contract for generic hosts
    examples/
      executor-example.md    -> High-quality fur-do output sample
      gate-example.md        -> High-quality fur-check output sample
      diagnostic-example.md  -> High-quality fur-debug output sample
      planner-example.md     -> High-quality fur-task output sample
      orchestrator-example.md-> High-quality fur-status output sample
    anti-patterns/
      global.md         -> Anti-patterns that apply to every skill
      executor.md       -> Anti-patterns specific to executor skills
      gate.md           -> Anti-patterns specific to gate skills
      diagnostic.md     -> Anti-patterns specific to diagnostic skills
      planner.md        -> Anti-patterns specific to planner skills
      orchestrator.md   -> Anti-patterns specific to orchestrator skills
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
  skill-spec-v2.md
  output-rubrics.md
  context-pack-rules.md
  eval-design.md
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
- `responseDepth`: `concise`, `standard`, or `deep`
- `evidenceStyle`: `paths-only`, `inline`, or `inline-plus-paths`
- `verificationStrictness`: `loose`, `normal`, or `strict`

Default preference:

- New projects use `questionLevel: high`.
- Established projects usually use `questionLevel: normal`.
- `responseDepth` defaults to `standard` and is independent of `questionLevel`.

## Learned User Preferences

- Bu repoda asistan cevaplarında Türkçe kullanılması tercih edilir.
- Geniş planlar yerine küçük kapsam ve adım adım ilerleme tercih edilir.
- README içinde skill ve komutların hangi sırayla kullanılacağı ve parçaların nasıl birleştiği net anlatılmalıdır.
- Uzun oturumlarda bağlam penceresi için sıkıştırma veya özetleme kullanılmalı.

---

# fur-skills v2 Quality Constitution

## Purpose

This constitution defines the shared quality contract for every skill in the fur-skills family. It separates "small workflow" from "shallow output." The core loop stays small; the output stays deep, auditable, and evidence-backed.

## Principles

1. **Scope is small; explanation is deep.** A skill may touch only one file, but its output must explain why, with evidence, trade-offs, and residual risk.
2. **Evidence before claims.** Every non-trivial assertion must tie to a source: file path, command output, diff line, or external reference.
3. **Config over convention.** Prefer `responseDepth`, `evidenceStyle`, and `verificationStrictness` in `.fur.planning/config.json` instead of hard-coding depth in each skill.
4. **Provider-aware, not provider-locked.** The base skill language is host-agnostic. Provider-specific optimizations (XML tags for Claude, developer messages for OpenAI reasoning, structured outputs where supported) live in `skills/_shared/overlays/` and are applied as overlays, not forks.
5. **Eval-driven improvement.** Before a skill is changed, the expected behavior must be observable: at least 20 representative prompts, a rubric, and known failure modes.

## Skill Classes

| Class | Skills | Responsibility |
|---|---|---|
| **orchestrator** | `fur-init`, `fur-status`, `fur-done` | Orient, summarize, and archive. Output is short operational handoff + optional rich summary when `responseDepth: deep`. |
| **executor** | `fur-do`, `fur-ui-clone` | Implement one scoped task. Output must map every acceptance criterion, report assumptions, and include user-facing explanation. |
| **gate** | `fur-check`, `fur-ui-review` | Verify and review. Output must be evidence-backed, severity-graded, and include a verdict with next-skill routing. |
| **diagnostic** | `fur-debug` | Unknown root cause. Output must include falsifiable hypotheses, loop description, and regression guard. |
| **planner** | `fur-task`, `fur-ui-design` | Decompose and clarify. Output must produce a concrete next step with acceptance criteria and verification. |

## Response Depth Axis

`responseDepth` controls how rich the presentation plane is, independently of `questionLevel`.

| Level | Behavior |
|---|---|
| `concise` | Operational handoff only. 1-3 sentences + file list + next step. Use for trivial changes or when the user explicitly asks for speed. |
| `standard` | Default. Covers acceptance criteria, files changed, checks, and risks in structured markdown. |
| `deep` | Full audit trail. Includes task restatement, assumption labeling, trade-off analysis, edge-case discussion, and explicit self-check. |

Every skill must respect `responseDepth` from config when present. If missing, default to `standard`.

## Evidence Standard

| Style | When to use |
|---|---|
| `paths-only` | List touched files only. Suitable for `concise` depth or trivial chores. |
| `inline` | Include short inline snippets (≤5 lines) where helpful. Default for `standard`. |
| `inline-plus-paths` | Full inline snippets + permanent file paths for audit. Default for `deep`. |

## Self-Check Requirement

Every skill must include an internal completion checklist before final output. This is not visible chain-of-thought; it is a mandatory verification step:

- Did I cover every acceptance criterion / success criterion?
- Did I separate facts from assumptions?
- Did I report checks and residual risk honestly?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

## Handoff Contract

Every skill output must end with a `Suggested Next Step` that routes to the correct neighbor skill based on outcome:

- Success path → next skill in the core loop.
- Ambiguous scope → `fur-task`.
- Unknown failure → `fur-debug`.
- Insufficient verification → `fur-check`.

## Anti-Patterns (Global)

- Do not say "done" without mapping each acceptance criterion.
- Do not hide uncertainty behind vague language ("should be fine").
- Do not dump a file list without explaining intent.
- Do not report checks without explaining coverage.
- Do not optimize for shortness if it removes auditability.
- Do not add visible "think step by step" prompts on reasoning-capable models; use structured self-check instead.

## Version

This constitution applies to fur-skills v2 and later. Skills without an explicit `skillVersion` frontmatter field are assumed to be v1 and should be migrated.
