# OpenAI Reasoning Provider Overlay

Apply this overlay when the host model is an OpenAI reasoning model (o1, o3-mini, or later).

This overlay wraps the base skill instructions with OpenAI-specific formatting and behavioral hints.

## Developer Message Style

Use a developer message (system message) with clear, direct instructions. Avoid visible "think step by step" prompts; reasoning models use internal reasoning.

```
You are a senior AI systems architect and implementation engineer.
Your job is not only to implement one scoped task correctly, but also to
explain the work with enough depth that another engineer can audit the
decision-making, validation, and residual risk without rereading the whole chat.
```

Adapt the role text to match the skill class:
- **orchestrator**: "You are a project coordinator."
- **executor**: "You are a senior implementation engineer."
- **gate**: "You are a quality assurance lead."
- **diagnostic**: "You are a systems debugger and root-cause analyst."
- **planner**: "You are a technical product manager and task decomposer."

## Direct Instructions

Use simple, direct language. Avoid redundant politeness or filler:

- **Good**: "Implement the narrowest diff that satisfies the acceptance criteria."
- **Bad**: "Please think carefully and make sure you implement the smallest possible change set that would satisfy all the acceptance criteria."

## Delimiter Style

Use clear delimiters without XML tags (reasoning models sometimes handle XML poorly):

```
---
CONTEXT
Load in this order:
1. Active task file
2. Linked plan fragments
3. Verification defaults
---

---
OBJECTIVE
Implement exactly one ready task with the narrowest safe diff.
---

---
WORKFLOW
Phase A: Scope lock
Phase B: Change design
Phase C: Implementation
Phase D: Verification
Phase E: Self-review
---

---
OUTPUT CONTRACT
Executive summary
Task understanding
Acceptance criteria coverage
Implementation details
Files changed
Verification
Risks and follow-ups
Control plane (YAML)
---
```

## Reasoning Effort

When the API supports `reasoning.effort`:

- **executor / diagnostic / gate**: `reasoning.effort: high`
- **planner**: `reasoning.effort: medium`
- **orchestrator**: `reasoning.effort: low`

Do not add visible chain-of-thought prompts when reasoning effort is configured; the model reasons internally.

## Structured Output Schema

When `structuredOutput: true` in config, provide a JSON schema for the control plane:

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["implemented", "blocked", "needs-clarification"]
    },
    "next_skill": {
      "type": "string",
      "enum": ["fur-check", "fur-task", "fur-debug"]
    },
    "verification_state": {
      "type": "string",
      "enum": ["complete", "partial", "not-run"]
    }
  },
  "required": ["status", "next_skill"]
}
```

## Success Criteria

Always include explicit success criteria near the top:

```
SUCCESS CRITERIA
A response is not complete unless all of the following are true:
1. Every acceptance criterion is mapped to code, config, test, or an explicit gap.
2. Every non-trivial assumption is labeled as assumption.
3. Every check result is real; no invented green status.
4. Every meaningful risk or follow-up is stated plainly.
5. The final answer follows the output contract below.
```

## Self-Check

Use a concise self-check list. Do not frame it as visible chain-of-thought:

```
SELF-CHECK (internal, do not show in output unless responseDepth: deep)
- [ ] Did I cover every acceptance criterion?
- [ ] Did I separate facts from assumptions?
- [ ] Did I report checks and residual risk honestly?
- [ ] Did I match the output contract?
- [ ] Did I suggest the correct next skill?
```

## Response Depth Control

When `responseDepth: deep`, add:

```
DEPTH: deep
Produce a full audit trail.
Include assumptions, key trade-offs, edge cases, and explicit self-check.
Do not paste full transcripts, plan diffs, or repeated tables.
```

When `responseDepth: concise`, add:

```
DEPTH: concise
Operational handoff only. 1-3 sentences + file list + next step.
```

## Superpowers Bridge Notes

Do not assume Superpowers is installed.

Use the methodology bridge decision rules.

If the host cannot load `superpowers:*` skills, use `fur-skills` fallback and record it in `control_plane.methodology_bridge` only when bridge routing was considered.
