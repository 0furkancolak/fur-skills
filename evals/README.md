# fur-skills Eval System

This directory contains evaluation fixtures for the fur-skills v2 skill family. Eval-driven development means: define success, measure, then improve.

## Structure

```txt
evals/
  README.md              # This file
  _template/             # Template for new skill evals
  fur-do/                # Eval fixtures for fur-do
    prompts.jsonl        # One JSON object per line: {input, expected_routing, min_scores}
    golden-outputs/      # Reference outputs for human calibration
    graders/
      deterministic.py   # Checks frontmatter, headings, YAML validity
  fur-check/             # Eval fixtures for fur-check
  ...
```

## Adding Evals for a New Skill

1. Copy `_template/` to `<skill-name>/`.
2. Write at least 20 representative prompts in `prompts.jsonl`.
3. Generate golden outputs by running the skill against each prompt.
4. Calibrate graders manually on 5-10 samples before automation.
5. Record baseline scores in `baselines/v2-baseline.json`.

## Running Evals

### Manual (recommended for calibration)

1. Pick a prompt from `prompts.jsonl`.
2. Run the skill with that input.
3. Grade the output using `references/output-rubrics.md`.
4. Record scores and notes.

### Automated (deterministic checks only)

```bash
python evals/fur-do/graders/deterministic.py skills/fur-do/SKILL.md <output.md>
```

This checks:
- Frontmatter fields present
- Required headings exist
- YAML control plane is valid
- No fabricated check results (heuristic)

### Full Suite (future)

When LLM graders are calibrated, run:

```bash
./scripts/run-eval.sh fur-do
```

## Grader Types

| Type | Purpose | Location |
|---|---|---|
| Deterministic | Exact checks: frontmatter, headings, YAML | `graders/deterministic.py` |
| Rubric | Score depth, quality, evidence, risk | Manual using `references/output-rubrics.md` |
| LLM | Subjective dimensions: clarity, tone | `graders/llm_grader.md` (future) |

## Golden Data Set

A golden data set is a curated collection of prompts + expected outputs representing the skill at its best.

Rules:
- At least 20 examples per skill.
- Cover happy path, edge cases, failure modes, boundary triggers, depth variance.
- Update when new failure modes are discovered.
- Version with the skill (e.g., `golden-v2.jsonl`).

## Regression Testing

Before any skill change:
1. Run the full eval suite for that skill.
2. Record baseline scores.
3. Apply the change.
4. Re-run the suite.
5. Flag any dimension that drops by more than 5% or falls below acceptable.

## Suggested Next Step

Pick one skill (e.g., `fur-do`) and run a manual calibration pass on 3-5 prompts. Then refine the rubric before scaling to the full 20-prompt suite.
