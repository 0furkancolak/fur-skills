# Generic Provider Overlay

Apply this overlay when the host model has no special features (no XML tags, no structured outputs, no reasoning effort API).

This overlay keeps the skill prompt maximally portable across hosts.

## Role Framing

Use a plain markdown blockquote or bold text for role:

> **Role**: Senior AI systems architect and implementation engineer.
> Your job is not only to implement one scoped task correctly, but also to
> explain the work with enough depth that another engineer can audit the
> decision-making, validation, and residual risk without rereading the whole chat.

Adapt the role text to match the skill class:
- **orchestrator**: "Project coordinator"
- **executor**: "Senior implementation engineer"
- **gate**: "Quality assurance lead"
- **diagnostic**: "Systems debugger and root-cause analyst"
- **planner**: "Technical product manager and task decomposer"

## Section Delimiters

Use markdown headers and horizontal rules only:

```markdown
## Context

Load in this order:
1. Active task file
2. Linked plan fragments
3. Verification defaults

---

## Objective

Implement exactly one ready task with the narrowest safe diff.

---

## Workflow

### Phase A: Scope lock
### Phase B: Change design
### Phase C: Implementation
### Phase D: Verification
### Phase E: Self-review

---

## Output Contract

### Executive summary
### Task understanding
### Acceptance criteria coverage
### Implementation details
### Files changed
### Verification
### Risks and follow-ups
### Control plane
```

## Few-shot Format

Use plain markdown code blocks:

```markdown
## Example: Good output

**Input**: Add dark mode toggle

**Output**:
```
## Implemented
Added `theme` state to `ThemeProvider`...
```

**Why it is good**: Maps AC to code, reports assumptions, includes verification.

## Example: Bad output

**Input**: Add dark mode toggle

**Output**:
```
Done.
```

**Why it is bad**: No AC mapping, no evidence, no verification, no next step.
```

## Self-Check

Use a simple checklist in the prompt body:

```markdown
Before finalizing, verify:
- [ ] Did I cover every acceptance criterion?
- [ ] Did I separate facts from assumptions?
- [ ] Did I report checks and residual risk honestly?
- [ ] Did I match the output contract?

If any answer is no, continue working before responding.
```

## Response Depth Control

When `responseDepth: deep`, add:

```markdown
**Depth**: deep
Produce a full audit trail.
Include assumptions, key trade-offs, edge cases, and explicit self-check.
Do not paste full transcripts, plan diffs, or repeated tables.
```

When `responseDepth: concise`, add:

```markdown
**Depth**: concise
Operational summary only. 1-3 sentences + file list + residual risk.
```

## Output format

Plain markdown only. Do **not** append YAML control-plane blocks (`status`, `next_skill`).

## Caveman

Use caveman tone only when the user invoked caveman or `responseDepth: concise` allows compression without ambiguity.

## Superpowers

If the user attached superpowers skills (`using-superpowers`, `systematic-debugging`, `verification-before-completion`, etc.), follow them for implementation/debug workflow.
