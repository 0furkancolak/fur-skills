import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  computePlanMetrics,
  findVagueTimeRanges,
  formatPlanDashboardMarkdown,
  formatProgressBar,
  hoursFromTaskEstimate,
  loadPlan,
  reconcilePlanFromDisk,
  slugFromPlanPath,
  sumManifestHours,
  type ManifestRow,
} from "../lib/plan-manifest.ts";
import { ensurePlanningDirs } from "../lib/planning.ts";

const SAMPLE_PLAN = `---
plan_version: 1
slug: demo-plan
title: Demo plan
estimated_tasks: 3
estimated_sessions: 3
session_hours: 3
estimated_hours: 10.5
target_start: 2026-05-19
target_end: 2026-05-21
---

# Demo

## Task manifest

| ID | Title | Phase | Est. | Status | Task file |
|----|-------|-------|------|--------|-----------|
| T1 | First | phase-1 | S | ready | tasks/ready/20260101-1000-first.md |
| T2 | Second | phase-1 | M | planned | |
| T3 | Third | phase-2 | L | planned | |
`;

describe("plan-manifest", () => {
  let root: string;

  beforeEach(async () => {
    root = join(tmpdir(), `fur-plan-test-${Date.now()}`);
    await ensurePlanningDirs(root);
    await writeFile(join(root, ".fur.planning", "plans", "demo-plan.md"), SAMPLE_PLAN);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("slugFromPlanPath", () => {
    expect(slugFromPlanPath("plans/auth-refactor.md")).toBe("auth-refactor");
  });

  test("hoursFromTaskEstimate uses fixed hours", () => {
    expect(hoursFromTaskEstimate("M")).toBe(3);
    expect(hoursFromTaskEstimate("S")).toBe(1.5);
  });

  test("findVagueTimeRanges flags range expressions", () => {
    const hits = findVagueTimeRanges("estimated_duration: 2-3 weeks\nphase: 3-4 days");
    expect(hits.length).toBeGreaterThan(0);
  });

  test("sumManifestHours totals manifest Est. column", async () => {
    const report = await loadPlan("plans/demo-plan.md", root);
    expect(sumManifestHours(report!.rows)).toBe(10.5);
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
    expect(md).toContain("2026-05-21");
  });

  test("loadPlan parses frontmatter and manifest", async () => {
    const report = await loadPlan("plans/demo-plan.md", root);
    expect(report).not.toBeNull();
    expect(report!.slug).toBe("demo-plan");
    expect(report!.frontmatter.estimated_tasks).toBe(3);
    expect(report!.frontmatter.estimated_sessions).toBe(3);
    expect(report!.frontmatter.target_end).toBe("2026-05-21");
    expect(report!.totalCount).toBe(3);
    expect(report!.rows[0]!.id).toBe("T1");
    expect(report!.rows[0]!.status).toBe("ready");
    expect(report!.rows[1]!.status).toBe("planned");
  });

  test("reconcilePlanFromDisk updates status from task folders", async () => {
    const readyDir = join(root, ".fur.planning", "tasks", "ready");
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
});
