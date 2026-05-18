# Output Rubrics

These rubrics define what "good" looks like for every skill output dimension. They are used for self-check, peer review, and eval grading.

## Depth Rubric

Applies to `responseDepth` settings.

| Criterion | Concise (1 point) | Standard (2 points) | Deep (3 points) |
|---|---|---|---|
| Task restatement | Not required | Brief restatement | Full restatement + scope boundaries + non-goals |
| Assumption labeling | Not required | Major assumptions noted | Every non-trivial assumption labeled + impact explained |
| Trade-off discussion | Not required | One-liner if relevant | Explicit alternatives considered + why chosen |
| Edge-case coverage | Not required | Happy path + one edge | Happy path + multiple edges + failure paths |
| Self-check visibility | Hidden | Hidden | Explicit checklist in output |
| File list | Paths only | Paths + one-line intent | Paths + intent + rationale |
| Verification reporting | Not required | Command + pass/fail | Command + result + what it proves + what it does not prove |
| Risk / follow-up | Not required | Known gaps listed | Residual risk + severity + suggested mitigation |

Scoring: sum points. 1-4 = concise range; 5-10 = standard range; 11-16 = deep range.

## Quality Rubric

Applies to all skills regardless of depth.

| Criterion | Fail (0) | Partial (1) | Pass (2) |
|---|---|---|---|
| Acceptance criteria coverage | Missing or vague | Listed but not mapped | Every AC mapped to evidence or explicit gap |
| Evidence standard | Claims without source | Some sources, some missing | Every non-trivial claim has a source |
| Correctness of next-step routing | Wrong skill suggested | Ambiguous routing | Deterministic, context-aware routing |
| Format compliance | Wrong headings / schema | Mostly correct | Exact match to skill-spec-v2 |
| Honesty | Invented results | Omits uncomfortable facts | Reports truthfully, including failures |

Scoring: sum points. 0-3 = unacceptable; 4-6 = acceptable; 7-10 = excellent.

## Evidence Rubric

Applies to `evidenceStyle` settings.

| Criterion | Paths-only | Inline | Inline-plus-paths |
|---|---|---|---|
| Code snippets | None | ≤5 lines, only when helpful | Full relevant snippets + paths |
| Command output | None | Exit code or one-line summary | Key log lines + what they prove |
| Diff references | File path only | File + line range | File + line range + inline diff |
| External references | URL only | URL + one-line context | URL + context + why relevant |

## Risk Rubric

Every skill output that touches implementation or review must include risk assessment.

| Severity | Definition | Example |
|---|---|---|
| **none** | No meaningful residual risk. | Typo fix with no behavior change. |
| **low** | Risk exists but is well-understood and bounded. | Refactor with full test coverage; small UI copy change. |
| **medium** | Risk exists and may affect adjacent code or user experience. | API contract change without full integration tests; auth flow tweak. |
| **high** | Risk of data loss, security breach, or production outage. | Database migration without rollback; secrets handling change. |

Rules:
- A risk marked `high` must include a mitigation or an explicit decision to accept it.
- Do not downgrade severity to avoid follow-up work.
- If verification was skipped, the minimum risk level is `low`.

## Grading Workflow

1. Run the skill against a representative prompt.
2. Score depth, quality, evidence, and risk independently.
3. Compute a weighted total if needed: depth 30%, quality 40%, evidence 20%, risk 10%.
4. Flag any dimension that scores below acceptable.
5. Record the prompt, output, scores, and notes in the eval log.
