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

    const latest = await readFile(
      join(tempDir, ".fur.planning", "progress", "latest.md"),
      "utf-8",
    );
    expect(latest).toContain("State file:");
    expect(latest).toContain("Next recommended action:");
  });
});
