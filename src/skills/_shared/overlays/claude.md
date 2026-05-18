# Claude Provider Overlay

Apply this overlay when the host model is Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus, or later).

This overlay wraps the base skill instructions with Claude-specific formatting and behavioral hints.

## Role Framing

Use a clear role identity at the top of the skill prompt:

```xml
<role>
You are a senior AI systems architect and implementation engineer.
Your job is not only to implement one scoped task correctly, but also to
explain the work with enough depth that another engineer can audit the
decision-making, validation, and residual risk without rereading the whole chat.
</role>
```

Adapt the role text to match the skill class:
- **orchestrator**: "You are a project coordinator."
- **executor**: "You are a senior implementation engineer."
- **gate**: "You are a quality assurance lead."
- **diagnostic**: "You are a systems debugger and root-cause analyst."
- **planner**: "You are a technical product manager and task decomposer."

## XML Tag Structure

Use XML tags to delimit sections. Claude handles explicit delimiters better than plain markdown alone:

```xml
<context>
<!-- Load in this order -->
1. Active task file
2. Linked plan fragments
3. Verification defaults
</context>

<objective>
Implement exactly one ready task with the narrowest safe diff.
</objective>

<workflow>
<!-- Phases go here -->
</workflow>

<output>
<!-- Output contract -->
</output>

<self_check>
Before finalizing, verify:
- Did I cover every acceptance criterion individually?
- Did I explain why the chosen implementation is correct?
- Did I identify edge cases, not only the happy path?
- Did I separate facts from assumptions?
- Did I report checks and residual risk honestly?
If any answer is no, continue working before responding.
</self_check>
```

## Effort Hints

For coding, debugging, and math-heavy tasks, prepend:

```xml
<effort>
Set thinking effort to high for this task.
Use structured analysis before producing the final answer.
</effort>
```

For orchestrator and lightweight tasks, omit or use:

```xml
<effort>
Standard effort is sufficient.
</effort>
```

## Few-shot Format

When including examples, wrap each as:

```xml
<example type="positive">
<input>...</input>
<output>...</output>
<why>Why this output is good...</why>
</example>

<example type="anti-pattern">
<input>...</input>
<output>...</output>
<why>Why this output is bad...</why>
</example>
```

## Self-Check Wording

Use this exact self-check block at the end of the prompt before the output section:

```xml
<self_check>
Before finalizing, verify:
- [ ] Did I cover every acceptance criterion / success criterion?
- [ ] Did I separate facts from assumptions?
- [ ] Did I report checks and residual risk honestly?
- [ ] Did I match the output contract for this skill class?
- [ ] Did I suggest the correct next skill?
If any answer is no, continue working before responding.
</self_check>
```

## Response Depth Control

When `responseDepth: deep`, add:

```xml
<depth>
Produce a full audit trail.
Include task restatement, assumption labeling, trade-off analysis,
edge-case discussion, and explicit self-check.
</depth>
```

When `responseDepth: concise`, add:

```xml
<depth>
Operational handoff only. 1-3 sentences + file list + next step.
</depth>
```

## Output Plane Split

When structured output is available, request:

```xml
<output_planes>
<presentation>
Human-readable markdown with deterministic headings.
</presentation>
<control>
Machine-checkable YAML block at the end.
</control>
</output_planes>
```

When structured output is not available, still emit the YAML block inside the markdown.
