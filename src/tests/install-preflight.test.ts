import { describe, expect, test } from "bun:test";
import { hostIdsFromArg, runPreflight } from "../install/preflight.ts";
import { DEFAULT_INSTALL_OPTIONS } from "../install/types.ts";
import { repoRoot } from "../lib/paths.ts";

describe("hostIdsFromArg", () => {
  test("parses valid host list", () => {
    expect(hostIdsFromArg("claude,cursor")).toEqual(["claude", "cursor"]);
  });

  test("rejects invalid host", () => {
    expect(hostIdsFromArg("claude,invalid")).toBeNull();
  });
});

describe("runPreflight", () => {
  test("passes for default options in repo", async () => {
    const report = await runPreflight(DEFAULT_INSTALL_OPTIONS, repoRoot());
    expect(report.skillNames.length).toBeGreaterThan(0);
    expect(report.checks.some((c) => c.id === "bun")).toBe(true);
    expect(report.checks.find((c) => c.id === "skills")?.ok).toBe(true);
  });
});
