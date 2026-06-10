import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cmdInit } from "../cli/init.ts";

let tempDir = "";
const originalCwd = process.cwd();

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "fur-init-"));
  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(tempDir, { recursive: true, force: true });
});

describe("cmdInit", () => {
  test("non-interactive init writes config with defaults", async () => {
    const code = await cmdInit(["--gitignore"]);
    expect(code).toBe(0);

    const configPath = join(tempDir, "docs", "ai", "config.json");
    expect(existsSync(configPath)).toBe(true);
    expect(existsSync(join(tempDir, "docs", "ai", "context", "architecture.md"))).toBe(true);
    expect(existsSync(join(tempDir, "docs", "ai", "context", "conventions.md"))).toBe(true);
    expect(existsSync(join(tempDir, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(tempDir, "CLAUDE.md"))).toBe(true);
    expect(await readFile(join(tempDir, "AGENTS.md"), "utf-8")).toContain("Durable docs: `docs/ai/`");
    expect((await readFile(join(tempDir, "CLAUDE.md"), "utf-8")).trim()).toBe(
      "# Claude Instructions\n\nRead `AGENTS.md`.",
    );

    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw) as Record<string, unknown>;
    expect(config.planningDir).toBe("docs/ai");
    expect(config.questionLevel).toBe("high");
    expect(config.projectMaturity).toBe("new");
    expect(config.responseDepth).toBe("standard");
    expect(config.automationMode).toBe("guided");
    expect(config.gitignore).toBe(true);
    expect(config.methodology).toBeUndefined();
    expect(config.planning).toEqual({
      planLock: "enabled",
    });
  });
});
