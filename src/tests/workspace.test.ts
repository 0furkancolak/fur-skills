import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  loadWorkspaceConfig,
  validateWorkspaceConfig,
} from "../lib/workspace.ts";

let tempDir = "";

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "fur-workspace-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validateWorkspaceConfig", () => {
  test("detects duplicate repository ids", async () => {
    const configPath = join(tempDir, ".fur.workspace", "config.json");
    await mkdir(join(tempDir, ".fur.workspace"), { recursive: true });
    await mkdir(join(tempDir, "repo-a"), { recursive: true });

    await writeFile(
      configPath,
      JSON.stringify({
        version: 1,
        repositories: [
          { id: "dup", path: "repo-a" },
          { id: "dup", path: "repo-a" },
        ],
      }),
    );

    const data = await loadWorkspaceConfig(configPath);
    const result = validateWorkspaceConfig(configPath, data);
    expect(result.errors.some((e) => e.includes("duplicate repository id"))).toBe(
      true,
    );
  });

  test("passes valid minimal config", async () => {
    const configPath = join(tempDir, ".fur.workspace", "config.json");
    await mkdir(join(tempDir, ".fur.workspace"), { recursive: true });
    await mkdir(join(tempDir, "my-repo"), { recursive: true });

    await writeFile(
      configPath,
      JSON.stringify({
        version: 1,
        repositories: [{ id: "my-repo", path: "my-repo" }],
      }),
    );

    const data = await loadWorkspaceConfig(configPath);
    const result = validateWorkspaceConfig(configPath, data);
    expect(result.errors).toHaveLength(0);
  });
});
