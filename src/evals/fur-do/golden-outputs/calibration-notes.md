# fur-do Eval Calibration Notes

Date: 2026-05-17
Calibrator: Manual (reference rubric)
Prompts: 5 (from `src/evals/fur-do/prompts.jsonl`)

## Calibration Summary

| Prompt ID | Description | Depth | Quality | Evidence | Risk | Status |
|---|---|---|---|---|---|---|
| 01 | Dark mode toggle (happy path, deep) | 16/16 | 10/10 | 3/3 | low | implemented |
| 02 | TypeScript any fix (tiny, concise) | 6/16 | 8/10 | 2/3 | none | implemented |
| 03 | Add users API (medium, standard) | 9/16 | 9/10 | 2/3 | medium | implemented |
| 04 | Missing AC (boundary) | 6/16 | 8/10 | 1/3 | high | blocked → fur-task |
| 05 | Unknown test failure (boundary) | 8/16 | 9/10 | 2/3 | medium | blocked |

## Depth Analysis

| Criterion | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|
| Task restatement | 3 | 2 | 2 | 2 | 2 |
| Assumption labeling | 3 | 2 | 2 | 2 | 2 |
| Trade-off discussion | 3 | 1 | 1 | 1 | 1 |
| Edge-case coverage | 3 | 1 | 2 | 1 | 2 |
| Self-check visibility | 3 | 0 | 0 | 0 | 0 |
| File list | 3 | 2 | 2 | 1 | 2 |
| Verification reporting | 3 | 2 | 2 | 0 | 2 |
| Risk / follow-up | 3 | 1 | 2 | 2 | 2 |
| **Total** | **16** | **6** | **9** | **6** | **8** |

Scoring: 1-4 = concise range; 5-10 = standard range; 11-16 = deep range.

## Quality Analysis

| Criterion | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|
| AC coverage | 2 | 2 | 2 | 2 | 2 |
| Evidence standard | 2 | 2 | 2 | 1 | 2 |
| Next-step routing | 2 | 2 | 2 | 2 | 2 |
| Format compliance | 2 | 2 | 2 | 2 | 2 |
| Honesty | 2 | 2 | 2 | 2 | 2 |
| **Total** | **10** | **8** | **9** | **8** | **9** |

## Evidence Analysis

| Criterion | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|
| Code snippets | inline-plus | inline | inline | paths-only | inline |
| Command output | inline-plus | inline | inline | N/A | inline |
| Diff references | inline-plus | paths-only | inline | N/A | paths-only |
| External references | paths-only | paths-only | paths-only | paths-only | paths-only |

## Risk Analysis

| Prompt | Risk Level | Reason |
|---|---|---|
| 01 | low | Well-understood SSR FOUC mitigation |
| 02 | none | Single-line type change, no behavior change |
| 03 | medium | No API route tests exist; untested error path |
| 04 | high | Cannot implement without AC; scope undefined |
| 05 | medium | Unknown test failure; may hide real bug |

## Calibration Findings

### What works well
- AC coverage matrix is the strongest quality signal.
- "What it proves / does not prove" in verification is a clear differentiator.
- Control plane YAML makes routing deterministic.

### What needs attention
- **Self-check visibility**: None of the golden outputs include an explicit self-check list in the presentation plane. The rubric gives 0 points for self-check visibility in all 5 examples. This suggests either: (a) self-check should remain internal (not shown), or (b) `responseDepth: deep` should require explicit self-check. The spec says "not shown to the user unless `responseDepth: deep`" — so deep outputs should include it. Golden output 01 should be updated to include an explicit self-check list.
- **Evidence granularity**: Tiny fixes (prompt 02) legitimately need less evidence than large features (prompt 01). The rubric should account for scope when scoring evidence.

### Deterministic grader alignment

Running `src/evals/fur-do/graders/deterministic.ts` against these golden outputs:

| Prompt | Score | Pass |
|---|---|---|
| 01 | 5/5 | pass |
| 02 | 5/5 | pass |
| 03 | 5/5 | pass |
| 04 | 5/5 | pass (blocked status accepted as AC alternative) |
| 05 | 5/5 | pass (explicit fail prevents fabricated-check false positive) |

Grader alignment: 5/5 golden outputs pass deterministic checks. The grader correctly:
- Accepts `status: blocked` as an alternative to AC coverage table
- Avoids false positives on fabricated checks when `fail` is explicitly reported
- Validates all required headings and YAML control plane keys

## Baseline Record

```json
{
  "skill": "fur-do",
  "version": "v2",
  "calibrated_at": "2026-05-17",
  "prompts": 5,
  "deterministic_pass_rate": "5/5",
  "rubric_averages": {
    "depth": 9.0,
    "quality": 8.8,
    "evidence": 2.0,
    "risk": "low/medium"
  }
}
```

2. Record any failures as known failure modes.
3. Scale to LLM grader calibration when subjective dimensions are needed.
4. Record final baseline scores in `baselines/v2-baseline.json`.
