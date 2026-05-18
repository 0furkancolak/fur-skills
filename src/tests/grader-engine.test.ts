import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { evalPath, skillPath } from "../lib/paths.ts";
import { gradeFiles } from "../quality/grader-engine.ts";
import { GRADER_PROFILES } from "../quality/grader-profiles.ts";

describe("grader-engine", () => {
  test("fur-do golden 01 passes deterministic grader", async () => {
    const skill = skillPath("fur-do");
    const outputPath = join(
      evalPath("fur-do"),
      "golden-outputs/01-dark-mode-toggle.md",
    );
    const result = await gradeFiles(
      skill,
      outputPath,
      GRADER_PROFILES["fur-do"],
    );
    expect(result.score).toBe(result.max_score);
  });

  test("fur-do golden 04 blocked passes with blocked status", async () => {
    const skill = skillPath("fur-do");
    const outputPath = join(
      evalPath("fur-do"),
      "golden-outputs/04-missing-ac-blocked.md",
    );
    const result = await gradeFiles(
      skill,
      outputPath,
      GRADER_PROFILES["fur-do"],
    );
    expect(result.score).toBe(result.max_score);
  });
});
