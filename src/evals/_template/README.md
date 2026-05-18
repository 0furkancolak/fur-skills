# Eval Template

Copy this folder to `src/evals/<skill-name>/` when adding evals for a new skill.

## Files to create

1. `prompts.jsonl` — One JSON object per line:
   ```json
   {"input": "...", "expected_routing": "...", "min_scores": {"depth": 0, "quality": 0, "evidence": 0, "risk": 0}}
   ```
2. `golden-outputs/` — Reference outputs for human calibration (at least 5).
3. `graders/deterministic.ts` — Exact checks: frontmatter, headings, YAML validity.
4. `baselines/v2-baseline.json` — Baseline scores after first calibration.

## Prompt categories

Cover at least:
- 5 happy path
- 5 edge cases
- 3 failure modes
- 3 boundary triggers
- 4 depth variance (concise, standard, deep)

Total: at least 20 prompts.

## Calibration workflow

1. Run 5 prompts manually.
2. Grade using `src/references/output-rubrics.md`.
3. Adjust deterministic grader until agreement > 90%.
4. Record baseline scores.
5. Scale to full 20-prompt suite.
