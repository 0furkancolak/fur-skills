---
name: fur-debug
description: Diagnose a failing test, runtime error, stack trace, broken behavior, regression, or production bug when the root cause is unknown. Follow a disciplined phase-based approach: build loop → reproduce → hypothesize → instrument → fix → regression-test.
---

# fur-debug

Use this skill when something is broken and the root cause is unknown.

## Goal

Find the root cause using a disciplined, phase-based approach. Do not jump to fixes without investigation.

## When to Use

- A test is failing and the reason is unclear
- A runtime error or stack trace needs diagnosis
- A regression appeared after a recent change
- Production behavior is broken and the cause is unknown
- An error message is cryptic or misleading
- Performance is degraded and you need to find the bottleneck

## When NOT to Use

- The root cause is already known — use `fur-do` directly
- You need to review code quality — use `fur-check`
- You need to implement a new feature — use `fur-task` then `fur-do`
- Requirements are unclear — use `fur-task` and its `questionLevel` policy

## Workflow

### Phase 1: Build a Feedback Loop

**This is the skill.** Everything else is mechanical. If you have a fast, deterministic, agent-runnable pass/fail signal, you will find the cause. If you don't, no amount of staring at code will save you.

Spend disproportionate effort here. Be aggressive. Be creative. Refuse to give up.

### Ways to Build a Loop (try in roughly this order)

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — drives the UI, asserts on DOM/console/network.
5. **Replay a captured trace** — save a real network request / payload / event log to disk; replay it in isolation.
6. **Throwaway harness** — spin up a minimal subset of the system with mocked deps.
7. **Property / fuzz loop** — if the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness** — if the bug appeared between two known states, automate "boot at state X, check, repeat" so you can `git bisect run`.
9. **Differential loop** — run the same input through old-version vs new-version and diff outputs.
10. **Manual reproduction script** — if a human must click, drive them with a structured script. Captured output feeds back to you.

### Iterate on the Loop Itself

- Can you make it faster? (Cache setup, skip unrelated init, narrow scope.)
- Can you make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can you make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop. A 2-second deterministic loop is a debugging superpower.

### When You Genuinely Cannot Build a Loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a captured artifact (HAR file, log dump, core dump, screen recording), or (c) permission to add temporary production instrumentation.

**Do not proceed to Phase 2 until you have a loop you believe in.**

### Phase 2: Reproduce

Run the loop. Watch the bug appear. Confirm:

- [ ] The loop produces the **failure mode the user described** — not a different failure nearby.
- [ ] The failure is reproducible across multiple runs (or at a high enough rate for non-deterministic bugs).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing) for later verification.

### Phase 3: Hypothesize

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis debugging anchors on the first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or sharpen it.

**Show the ranked list to the user before testing.** They often have domain knowledge that re-ranks instantly, or know hypotheses they've already ruled out. Don't block — proceed with your ranking if the user is unavailable.

### Phase 4: Instrument

Each probe must map to a specific hypothesis from Phase 3. **Change one variable at a time.**

Tool preference:
1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with a unique prefix, e.g., `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep.

**For performance regressions:** Logs are usually wrong. Instead: establish a baseline measurement, then bisect. Measure first, fix second.

### Phase 5: Fix + Regression Test

Write the regression test **before the fix** — but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow, a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it — the codebase architecture is preventing the bug from being locked down.

If a correct seam exists:
1. Turn the minimized repro into a failing test at that seam.
2. Watch it fail.
3. Apply the smallest root-cause fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original scenario.

### Phase 6: Cleanup + Post-Mortem

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed
- [ ] Throwaway prototypes deleted or clearly marked
- [ ] The winning hypothesis is stated in the commit message

**Then ask: what would have prevented this bug?** If the answer involves architectural change, note it for a future task.

## Rules

- No fix before investigation. Always diagnose first.
- Do not rewrite unrelated code.
- Do not silence errors without explaining why.
- Prefer root-cause fix over workaround.
- If verification cannot be run, explain why and state what was manually checked.
- Keep a narrow scope — fix only the diagnosed issue.
- If the issue is too complex to fix in one pass, write a task with `fur-task` and implement separately.

## Output

```md
## Root Cause

[concise description of the diagnosed cause]

## Feedback Loop

[what reproduction method was used]

## Hypotheses Tested

1. [hypothesis 1 — result]
2. [hypothesis 2 — result]
3. [hypothesis 3 — result — winner]

## Fix

[what was changed and why]

## Verification

[how the fix was confirmed, including regression test]

## Remaining Risk

[unresolved concerns or architectural issues that enabled this bug]

## Prevention

[what would have prevented this class of bug]
```

## Suggested Next Step

If fix is verified: `fur-do` for remaining implementation, then `fur-check` → `fur-done`.
