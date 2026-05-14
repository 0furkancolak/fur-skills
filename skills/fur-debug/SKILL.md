---
name: fur-debug
description: Diagnose a failing test, runtime error, stack trace, broken behavior, regression, or production bug when the root cause is unknown. Follow a disciplined phase-based approach: build loop → reproduce → hypothesize → instrument → fix → regression-test.
---

# fur-debug

Treat debugging as **experiment design**, not guess-and-edit.

## Goal

Produce a **falsifiable** root-cause story, a minimal fix, and a regression guard (or an explicit statement why guard is impossible) — without scope creep.

## When to Use

- Tests fail for non-obvious reasons; stack traces or logs point nowhere stable.
- Runtime errors, flaky behavior, perf cliffs, “works on my machine” gaps.
- Regressions after refactors or dependency bumps.

## When NOT to Use

- Cause already known → `fur-do` with a normal task.
- Style / maintainability only → `fur-check`.
- Greenfield feature design → `fur-task` then `fur-do`.
- Requirements unclear → `fur-task` (use `questionLevel` there, not infinite debug).

## Workflow

### Phase 1: Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a fast, deterministic, agent-runnable pass/fail signal, you will find the cause. If you don't, no amount of staring at code will save you.

Spend disproportionate effort here. Be aggressive. Be creative. Refuse to give up.

#### Ways to build a loop (try in roughly this order)

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with fixture input, diff stdout against a known-good snapshot.
4. **Headless browser** (Playwright / Puppeteer) driving UI + asserting DOM/console/network.
5. **Replay** a captured trace (HAR, payload, event log) in isolation.
6. **Throwaway harness** with mocked deps.
7. **Property / fuzz** when output is sometimes wrong.
8. **Bisection harness** paired with `git bisect run` when boundaries are known.
9. **Differential loop** old vs new binary outputs.
10. **Manual script** for human-only repro — still structure steps + capture outputs.

#### Iterate on the loop itself

- Faster? (cache setup, skip unrelated init, narrow scope.)
- Sharper signal? (assert exact symptom, not “no crash”.)
- More deterministic? (pin time, seed RNG, isolate FS/network.)

A 30-second flaky loop is barely better than no loop. A 2-second deterministic loop is a debugging superpower.

#### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) environment access, (b) artifacts (HAR, core dump, recording), or (c) permission for temporary production instrumentation.

**Do not proceed to Phase 2 until you have a loop you believe in.**

### Phase 2: Reproduce

Run the loop. Confirm:

- [ ] Failure mode matches what the user described.
- [ ] Repro rate is high enough (or statistically sampled for flakes).
- [ ] Exact symptom captured (message, diff, timing) for later verification.

### Phase 3: Hypothesize

Generate **3–5 ranked hypotheses** before testing. Each must be falsifiable:

> If `<X>` is the cause, then `<change Y>` makes the symptom disappear / `<change Z>` worsens it.

If you cannot state the prediction, sharpen or discard. **Show the ranked list** to the user when practical; proceed if async.

### Phase 4: Instrument

Map each probe to one hypothesis. **One variable at a time.**

Tool preference: debugger / REPL > targeted logs > “log everything”. Tag logs with a unique prefix (e.g. `[DEBUG-a4f2]`) and remove them in cleanup.

**Performance:** measure first, bisect second — logs alone often lie.

### Phase 5: Fix + regression test

When a seam exists that exercises the real failure pattern:

1. Turn minimized repro into failing test.
2. Watch it fail → smallest fix → watch it pass.
3. Re-run the Phase 1 loop on the original scenario.

If no seam exists, **document that architectural gap** as part of the outcome — do not fake coverage with shallow tests.

### Phase 6: Cleanup + post-mortem

- [ ] Original repro no longer reproduces.
- [ ] Regression test passes or absence documented.
- [ ] Debug instrumentation removed / prototypes deleted or clearly marked.
- [ ] Winning hypothesis reflected in commit message when user commits later.

Ask: **what would have prevented this class of bug?** If architecture, note a future `fur-task`.

## Rules

- No fix before a trusted loop + repro signal.
- No unrelated refactors mixed with diagnosis.
- Do not silence errors without explaining why.
- Prefer root-cause fixes over permanent hacks; temporary hacks need a follow-up task pointer.
- If verification cannot run here, say exactly what was manually proven instead.
- **Evidence before claims** — same bar as `fur-check`: cite command output, stack lines, or counters.
- Context hygiene: long transcripts belong in task notes or `context/archive/` per `references/context-window.md`; keep chat to deltas + paths.

## Output

```md
## Root cause

[concise]

## Feedback loop

[how you reproduced]

## Hypotheses tested

1. … → ruled out / confirmed
2. …
(winner called out)

## Fix

[what changed + why]

## Verification

[tests / loop reruns]

## Remaining risk

[flakes, missing coverage, architectural debt]

## Prevention

[what would have caught this earlier]
```

## Suggested Next Step

Green path: fold fix into normal flow → `fur-check` → `fur-done`. If new scope opened → `fur-task` for the debt, then `fur-do`.
