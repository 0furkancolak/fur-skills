import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  computePlanMetrics,
  computeReadyBatch,
  formatPlanDashboardMarkdown,
  formatProgressBar,
  loadPlan,
  reconcilePlanFromDisk,
  slugFromPlanPath,
  type ManifestRow,
} from "../lib/plan-manifest.ts";
import { ensurePlanningDirs } from "../lib/planning.ts";

const SAMPLE_PLAN = `---
plan_version: 1
slug: demo-plan
title: Demo plan
estimated_tasks: 3
---

# Demo

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | First | phase-1 | S | ready | tasks/ready/20260101-1000-first.md |
| T2 | Second | phase-1 | M | planned | |
| T3 | Third | phase-2 | L | planned | |

## Dependencies

- T2 blocks on T1
- T3 blocks on T2
`;

describe("plan-manifest", () => {
  let root: string;

  beforeEach(async () => {
    root = join(tmpdir(), `fur-plan-test-${Date.now()}`);
    await ensurePlanningDirs(root);
    await writeFile(join(root, "docs/ai", "plans", "demo-plan.md"), SAMPLE_PLAN);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("slugFromPlanPath", () => {
    expect(slugFromPlanPath("plans/auth-refactor.md")).toBe("auth-refactor");
  });

  test("computePlanMetrics calculates percentDone and percentProgress", () => {
    const rows: ManifestRow[] = [
      {
        id: "T1",
        title: "a",
        phase: "p",
        estimate: "S",
        status: "done",
        taskFile: "",
      },
      {
        id: "T2",
        title: "b",
        phase: "p",
        estimate: "S",
        status: "ready",
        taskFile: "",
      },
      {
        id: "T3",
        title: "c",
        phase: "p",
        estimate: "S",
        status: "planned",
        taskFile: "",
      },
    ];
    const m = computePlanMetrics(rows);
    expect(m.percentDone).toBe(33);
    expect(m.percentProgress).toBe(50);
    expect(formatProgressBar(50)).toBe("[██████████░░░░░░░░░░] 50%");
  });

  test("formatPlanDashboardMarkdown includes completion percent and table", async () => {
    const report = await loadPlan("plans/demo-plan.md", root);
    const md = formatPlanDashboardMarkdown(report!);
    expect(md).toContain("## Plan summary");
    expect(md).toContain("Completion");
    expect(md).toContain("%");
    expect(md).toContain("| T1 |");
    expect(md).toContain("[");
    expect(md).not.toContain("Target end");
    expect(md).not.toContain("Sessions");
    expect(md).not.toContain("Total time");
  });

  test("loadPlan parses frontmatter and manifest", async () => {
    const report = await loadPlan("plans/demo-plan.md", root);
    expect(report).not.toBeNull();
    expect(report!.slug).toBe("demo-plan");
    expect(report!.frontmatter.estimated_tasks).toBe(3);
    expect(report!.totalCount).toBe(3);
    expect(report!.rows[0]!.id).toBe("T1");
    expect(report!.rows[0]!.status).toBe("ready");
    expect(report!.rows[1]!.status).toBe("planned");
    expect(report!.dependencies).toEqual({
      T2: ["T1"],
      T3: ["T2"],
    });
  });

  test("reconcilePlanFromDisk updates status from task folders", async () => {
    const readyDir = join(root, "docs/ai", "tasks", "ready");
    await mkdir(readyDir, { recursive: true });
    await writeFile(
      join(readyDir, "20260101-1000-first.md"),
      "# First\n\nPlan: plans/demo-plan.md\nPlan task ID: T1\n",
    );

    const report = await loadPlan("plans/demo-plan.md", root);
    const reconciled = await reconcilePlanFromDisk(report!, root);
    expect(reconciled.rows[0]!.status).toBe("ready");
    expect(reconciled.rows[0]!.taskFile).toContain("tasks/ready/");
  });

  test("computeReadyBatch returns unblocked independent ready tasks", async () => {
    await writeFile(
      join(root, "docs/ai", "plans", "wave.md"),
      `---
plan_version: 2
slug: wave
title: Wave
estimated_tasks: 4
---

# Parallel

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

    const report = await loadPlan("plans/wave.md", root);
    const batch = computeReadyBatch(report!);
    expect(batch).toEqual({
      plan: "wave",
      group: "wave-wave-2",
      taskIds: ["T2", "T3", "T4"],
      taskFiles: [
        "tasks/ready/20260101-1000-a.md",
        "tasks/ready/20260101-1000-b.md",
        "tasks/ready/20260101-1000-c.md",
      ],
    });
  });

  test("computeReadyBatch excludes ready tasks blocked by another ready task", async () => {
    await writeFile(
      join(root, "docs/ai", "plans", "blocked-wave.md"),
      `---
plan_version: 2
slug: blocked-wave
title: Blocked wave
estimated_tasks: 3
---

# Blocked wave

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

    const report = await loadPlan("plans/blocked-wave.md", root);
    const batch = computeReadyBatch(report!);
    expect(batch?.taskIds).toEqual(["T2"]);
  });
});
