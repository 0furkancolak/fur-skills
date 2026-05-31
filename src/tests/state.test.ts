import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdRefresh } from "../cli/progress.ts";
import { ensurePlanningDirs } from "../lib/planning.ts";

let tempDir = "";
const originalCwd = process.cwd();

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "fur-state-"));
  process.chdir(tempDir);
  await ensurePlanningDirs(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(tempDir, { recursive: true, force: true });
});

describe("fur refresh state", () => {
  test("cmdRefresh writes progress latest and state.json", async () => {
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-demo.md"),
      "# Demo\n\n## Acceptance Criteria\n\n- [ ] Works\n",
    );

    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as Record<string, unknown>;
    expect(state.activeTask).toBe(
      ".fur.planning/tasks/ready/20260101-1000-demo.md",
    );
    expect(state.nextRecommendedAction).toBe("fur-do 20260101-1000-demo.md");
    expect(state.planLock).toEqual({
      enabled: true,
      activePlan: null,
      source: "none",
    });
    expect(state.readyBatch).toBeNull();

    const latest = await readFile(
      join(tempDir, ".fur.planning", "progress", "latest.md"),
      "utf-8",
    );
    expect(latest).toContain("State file:");
    expect(latest).toContain("Plan lock");
    expect(latest).toContain("Next recommended action:");
  });

  test("multiple active plans require a plan lock before selecting work", async () => {
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "alpha.md"),
      `---
plan_version: 2
slug: alpha
title: Alpha
estimated_tasks: 1
---

# Alpha

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Alpha task | phase-1 | S | ready | tasks/ready/20260101-1000-alpha.md |
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "beta.md"),
      `---
plan_version: 2
slug: beta
title: Beta
estimated_tasks: 1
---

# Beta

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Beta task | phase-1 | S | ready | tasks/ready/20260101-1000-beta.md |
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-alpha.md"),
      "# Alpha\n\nPlan: plans/alpha.md\nPlan task ID: T1\n",
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-beta.md"),
      "# Beta\n\nPlan: plans/beta.md\nPlan task ID: T1\n",
    );

    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as Record<string, unknown>;
    expect(state.activeTask).toBeNull();
    expect(state.activePlan).toBeNull();
    expect(state.nextRecommendedAction).toBe(
      "select or set a plan lock before running fur-do; multiple active plans exist",
    );
  });

  test("configured plan lock selects only that plan's next task", async () => {
    await writeFile(
      join(tempDir, ".fur.planning", "config.json"),
      JSON.stringify(
        {
          planning: {
            planLock: "enabled",
            activePlan: "beta",
          },
        },
        null,
        2,
      ),
    );
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "alpha.md"),
      `---
plan_version: 2
slug: alpha
title: Alpha
estimated_tasks: 1
---

# Alpha

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Alpha task | phase-1 | S | ready | tasks/ready/20260101-1000-alpha.md |
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "beta.md"),
      `---
plan_version: 2
slug: beta
title: Beta
estimated_tasks: 1
---

# Beta

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Beta task | phase-1 | S | ready | tasks/ready/20260101-1000-beta.md |
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-alpha.md"),
      "# Alpha\n\nPlan: plans/alpha.md\nPlan task ID: T1\n",
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-beta.md"),
      "# Beta\n\nPlan: plans/beta.md\nPlan task ID: T1\n",
    );

    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as Record<string, unknown>;
    expect(state.activeTask).toBe(
      ".fur.planning/tasks/ready/20260101-1000-beta.md",
    );
    expect(state.activePlan).toBe("beta");
    expect(state.nextRecommendedAction).toBe("fur-do 20260101-1000-beta.md");
  });

  test("empty queue reports completion without creating new-work pressure", async () => {
    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as Record<string, unknown>;
    expect(state.activeTask).toBeNull();
    expect(state.nextRecommendedAction).toBe(
      "work complete; new work can be started when desired",
    );
  });

  test("plan lock exposes ready batch for independent unblocked tasks", async () => {
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "batch.md"),
      `---
plan_version: 2
slug: batch
title: Batch
estimated_tasks: 4
---

# Batch

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Foundation | phase-1 | S | done | tasks/done/20260101-0900-foundation.md |
| T2 | A | phase-2 | S | ready | tasks/ready/20260101-1000-a.md |
| T3 | B | phase-2 | S | ready | tasks/ready/20260101-1000-b.md |
| T4 | C | phase-2 | S | ready | tasks/ready/20260101-1000-c.md |

## Dependencies

- T2, T3, T4 blocks on T1
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-a.md"),
      "# A\n\nPlan: plans/batch.md\nPlan task ID: T2\n",
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-b.md"),
      "# B\n\nPlan: plans/batch.md\nPlan task ID: T3\n",
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-c.md"),
      "# C\n\nPlan: plans/batch.md\nPlan task ID: T4\n",
    );

    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as {
      readyBatch: { taskIds: string[]; group: string } | null;
      nextRecommendedAction: string;
    };
    expect(state.readyBatch?.group).toBe("batch-wave-2");
    expect(state.readyBatch?.taskIds).toEqual(["T2", "T3", "T4"]);
    expect(state.nextRecommendedAction).toBe("fur-do batch-wave-2");
  });

  test("ready batch excludes a ready task blocked by another ready task", async () => {
    await writeFile(
      join(tempDir, ".fur.planning", "plans", "chain.md"),
      `---
plan_version: 2
slug: chain
title: Chain
estimated_tasks: 3
---

# Chain

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | Foundation | phase-1 | S | done | tasks/done/20260101-0900-foundation.md |
| T2 | A | phase-2 | S | ready | tasks/ready/20260101-1000-a.md |
| T3 | B | phase-2 | S | ready | tasks/ready/20260101-1000-b.md |

## Dependencies

- T2 blocks on T1
- T3 blocks on T2
`,
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-a.md"),
      "# A\n\nPlan: plans/chain.md\nPlan task ID: T2\n",
    );
    await writeFile(
      join(tempDir, ".fur.planning", "tasks", "ready", "20260101-1000-b.md"),
      "# B\n\nPlan: plans/chain.md\nPlan task ID: T3\n",
    );

    const code = await cmdRefresh();
    expect(code).toBe(0);

    const stateRaw = await readFile(
      join(tempDir, ".fur.planning", "state.json"),
      "utf-8",
    );
    const state = JSON.parse(stateRaw) as {
      readyBatch: { taskIds: string[]; group: string } | null;
      nextRecommendedAction: string;
    };
    expect(state.readyBatch?.taskIds).toEqual(["T2"]);
    expect(state.nextRecommendedAction).toBe("fur-do 20260101-1000-a.md");
  });
});
