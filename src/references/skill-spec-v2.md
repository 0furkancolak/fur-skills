# Skill Specification v2

Every skill in the fur-skills family must satisfy this contract before it is considered valid. This spec applies to all `fur-*` skills, including UI skills.

## Mandatory Frontmatter

The top of every `SKILL.md` must include YAML frontmatter with at least these fields:

```yaml
---
name: fur-<name>
description: >-
  One-line active description of what this skill does and when to use it.
skill_class: orchestrator | executor | gate | diagnostic | planner
skill_version: 2
default_response_depth: concise | standard | deep
control_plane_schema: <schema-name>   # optional; name of structured-output schema when supported
requires:
  - <required context file or condition>
optional:
  - <optional context file or condition>
quality_contract:
  must_map_every_ac: true | false
  must_report_assumptions: true | false
  must_report_verification_truthfully: true | false
  must_call_out_risks: true | false
  must_include_user_facing_explanation: true | false
  self_check_required: true | false
---
```

Notes:
- `skill_version` without this field implies v1 and triggers a migration prompt.
- `default_response_depth` is the fallback when config does not specify one.
- `quality_contract` booleans declare what the skill promises to verify before finishing.
- Skills are independent; do not route to other skills in output.

## Mandatory Sections

After frontmatter, the body must include these sections in order:

1. **Identity** (optional but recommended) — role framing for the model.
2. **Goal** — what success looks like in one sentence.
3. **When to Use** — bullet list of trigger conditions.
4. **When NOT to Use** — bullet list of scope boundaries (no cross-skill routing).
5. **Workflow** — labeled phases (e.g., `### Phase 1: ...`).
6. **Rules** — hard constraints that must never be violated.
7. **Output** — exact output sections, headings, or schema.
8. **Anti-patterns** — at least one negative example of what not to do.

Optional but recommended:
- **Context Loading Contract** — ordered list of what to load and what to skip.
- **Examples** — at least two positive examples and one anti-pattern example.

## Output Contract

Plain markdown only — deterministic headings, no trailing YAML (`status`, `next_skill`).

| Class | Required headings |
|---|---|
| orchestrator | Summary, Next Action (plain prose) |
| executor | Task Understanding, Acceptance Criteria Coverage, Implementation Details, Files Changed, Verification, Risks and Follow-ups |
| gate | Review Result, Findings, Acceptance Criteria, Verification, Gaps |
| planner | Task Result, Clarifications, Next |

Caveman tone only when user invoked caveman or `responseDepth: concise`. Superpowers apply when the user attached them.

## Few-shot Requirement

Every v2 skill must include or reference:
- At least **two** positive examples of good output.
- At least **one** anti-pattern example showing what to avoid.
- Edge-case examples when the skill has common failure modes.

Examples may live inline, in a sibling `examples.md`, or in `src/skills/_shared/examples/<skill-name>/`.

## Self-Check Requirement

Before final output, the skill must run an internal checklist (not shown to the user unless `responseDepth: deep`). The checklist must answer:

- Did I cover every acceptance criterion / success criterion?
- Did I separate facts from assumptions?
- Did I report checks and residual risk honestly?
- Did I match the output contract for this skill class?
- Did I suggest the correct next skill?

## Provider Overlay Rule

The base `SKILL.md` is provider-agnostic. Provider-specific prompts live in `src/skills/_shared/overlays/`:

- `claude.md` — XML tags, role framing, effort hints, self-check wording.
- `openai-reasoning.md` — developer message style, reasoning.effort, structured output schema, direct instructions.
- `generic.md` — portable markdown contract for hosts without special features.

When a skill is loaded, the host may prepend or append the relevant overlay. Skills must not hard-code provider-specific formatting in the main body.

## Eval Readiness Gate

A skill may not be marked v2 until:
- At least 20 representative prompts are documented.
- A rubric with pass/fail/graded criteria exists.
- Known failure modes are listed.
- A regression compare against the v1 version shows no trigger or format degradation.

See `src/references/eval-design.md` for the eval template.
