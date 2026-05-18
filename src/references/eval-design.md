# Eval Design

This document defines how to evaluate fur-skills for quality, regression, and improvement. Eval-driven development means: define success, measure, then improve.

## Philosophy

- **Define success before writing the skill.** A skill without eval criteria cannot be improved objectively.
- **Use representative prompts.** Test inputs must mirror real production distribution, not cherry-picked easy cases.
- **Grade traces, not vibes.** Human calibration is required, but grading must be repeatable and auditable.
- **Catch regressions early.** Every skill change must pass the previous eval suite before merging.

## Eval Dimensions

For each skill, evaluate on these axes:

| Dimension | Weight | Measures |
|---|---|---|
| Trigger accuracy | 15% | Did the right skill fire for the prompt? |
| Format compliance | 20% | Does output match `skill-spec-v2` headings/schema? |
| AC coverage | 25% | Are all acceptance criteria mapped to evidence or gaps? |
| Evidence sufficiency | 20% | Are claims backed by sources? |
| User-visible depth | 10% | Does output match the configured `responseDepth`? |
| Residual risk quality | 5% | Are risks stated with severity and mitigation? |
| Efficiency | 5% | Was the task solved without unnecessary thrash? |

## Prompt Design

Each skill needs at least **20 representative prompts** covering:

1. **Happy path** — typical, well-scoped request.
2. **Edge cases** — missing AC, contradictory requirements, large scope.
3. **Failure modes** — known ways the skill can fail (e.g., `fur-debug` with no repro loop).
4. **Boundary triggers** — cases near the edge of this skill vs. another skill.
5. **Depth variance** — same prompt at `concise`, `standard`, and `deep` depths.

Prompts must include:
- Input text (user message or task file content).
- Expected skill class and next-skill routing.
- Minimum acceptable score per dimension.

## Grader Types

### Deterministic Graders

Use exact checks when possible:
- Frontmatter fields present.
- Required headings exist.
- YAML control plane is valid.
- File paths reference real files.
- No fabricated check results.

### Rubric Graders

Use `src/references/output-rubrics.md` for scored dimensions:
- Depth score (1-16).
- Quality score (0-10).
- Evidence score (paths-only vs inline vs inline-plus-paths).
- Risk severity (none / low / medium / high).

### LLM Graders

For subjective dimensions (clarity, tone, usefulness), use a second-pass LLM grader with:
- A fixed rubric.
- Few-shot examples of good and bad scores.
- Temperature 0 for consistency.
- Human calibration on at least 10 samples before automation.

### Human Calibration

Before trusting automated graders:
1. Run 10 prompts.
2. Grade manually using the rubric.
3. Compare with deterministic + LLM grader scores.
4. Adjust grader prompts until agreement rate > 90%.

## Regression Testing

Before any skill change:
1. Run the full eval suite for that skill.
2. Record baseline scores.
3. Apply the change.
4. Re-run the suite.
5. Flag any dimension that drops by more than 5% or falls below acceptable.

## Eval Fixtures

Store eval data under `src/evals/`:

```txt
src/evals/
  fur-do/
    prompts.jsonl          # one JSON object per line: {input, expected_routing, min_scores}
    golden-outputs/          # reference outputs for human calibration
    graders/
      deterministic.ts
      rubric.py
      llm_grader.md
    baselines/
      v1-baseline.json
      v2-baseline.json
  fur-check/
    ...
```

## Failure Mode Registry

Every skill must document its known failure modes:

| Failure mode | Symptom | Detection | Mitigation |
|---|---|---|---|
| Example: `fur-do` scope creep | Changes files outside task AC | File list grader | Reinforce "non-goals" in task template |
| Example: `fur-check` false optimism | Risk marked "none" when tests skipped | Verification grader | Require `low` minimum when checks skipped |

## Golden Data Set

A golden data set is a curated collection of prompts + expected outputs that represent the skill at its best. It is used for:
- Human calibration.
- Regression baselines.
- Few-shot examples for LLM graders.

Rules:
- At least 20 examples per skill.
- Cover all prompt categories (happy, edge, failure, boundary, depth).
- Update when new failure modes are discovered.
- Version with the skill (e.g., `fur-do/golden-v2.jsonl`).

## CI Integration (Future)

When CI is added, the eval pipeline should:
1. Validate frontmatter for all skills (`fur repo-doctor`).
2. Run deterministic graders on a fast subset (5 prompts per skill).
3. Run full eval suite on PRs that touch a skill.
4. Block merge if any dimension drops below baseline or acceptable threshold.
5. Publish a scorecard markdown comment on the PR.

## Suggested Next Step

After defining eval criteria for a skill, run a manual calibration pass on 3-5 prompts. Then refine the rubric before scaling to the full 20-prompt suite.
