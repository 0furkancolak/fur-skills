# Diagnostic Skill Example: fur-debug

This example demonstrates a high-quality `fur-debug` output at `responseDepth: deep` with `evidenceStyle: inline-plus-paths`.

## Input

User reports: "Tests pass locally but fail in CI with `TimeoutError: Navigation timeout of 30000 ms exceeded`."

## Good Output (Deep)

```markdown
## Root Cause

The Playwright E2E test `settings.spec.ts` opens `/settings/appearance` before the dev server is fully ready in CI. The `webServer` config in `playwright.config.ts` uses `reusableExistingServer: true`, which skips waiting when a server is already running locally but is not applicable in CI.

## Feedback Loop

Built a 2-second deterministic loop:
1. `npx playwright test settings.spec.ts --reporter=line`
2. Reproduces consistently in CI (GitHub Actions, ubuntu-latest).
3. Does not reproduce locally because the dev server is already running.

```bash
# CI log excerpt
Running 1 test using 1 worker
  ✘  1 settings.spec.ts:12:3 › settings page › toggles dark mode (30000ms)
    TimeoutError: Navigation timeout of 30000 ms exceeded
```

## Hypotheses Tested

1. **Network flake in CI** → Ruled out: re-ran 5 times, same error, same test.
2. **Dev server not started before tests** → Confirmed: CI log shows `webServer` command starts but does not wait for port 3000.
3. **Test-specific timeout too low** → Ruled out: increasing timeout to 60s still fails.
4. **Headless vs headed difference** → Ruled out: fails in both modes in CI container.

Winner: Hypothesis 2 — dev server readiness.

## Fix

Changed `playwright.config.ts`:

```ts
// playwright.config.ts:14-18
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  timeout: 120 * 1000,
  reuseExistingServer: !process.env.CI,
},
```

- `reuseExistingServer: !process.env.CI` ensures CI always waits for the server.
- `timeout: 120s` gives enough headroom for cold starts.

## Verification

- Re-ran CI 3 times: all pass.
- Local run still passes (server already running).
- No impact on other tests.

## Remaining Risk

- Cold start time may increase as the app grows. Suggested: monitor CI duration.
- `reuseExistingServer` behavior may change in future Playwright versions.

## Prevention

- Add a CI-specific smoke test that asserts `curl http://localhost:3000` before E2E tests.
- Document `webServer` config in `CONTRIBUTING.md`.

## Control Plane

```yaml
status: implemented
next_skill: fur-check
scope_respected: true
verification_state: complete
risk_level: low
```

## Suggested Next Step

Route to `fur-check` for regression verification, then `fur-done`.
```

## Why This Output Is Good

- Root cause is falsifiable and tied to a specific config line.
- Feedback loop is deterministic and fast.
- Hypotheses are ranked and each has a verdict.
- Fix is minimal and targeted.
- Verification includes CI re-runs.
- Prevention includes follow-up tasks.
