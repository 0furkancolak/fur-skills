import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { installCliWrapper } from "../install/cli-wrapper.ts";

let tempHome = "";
const originalHome = process.env.HOME;
const originalFurRoot = process.env.FUR_SKILLS_ROOT;

beforeEach(async () => {
  tempHome = await mkdtemp(join(tmpdir(), "fur-cli-wrapper-"));
  process.env.HOME = tempHome;
});

afterEach(async () => {
  process.env.HOME = originalHome;
  if (originalFurRoot === undefined) {
    delete process.env.FUR_SKILLS_ROOT;
  } else {
    process.env.FUR_SKILLS_ROOT = originalFurRoot;
  }
  await rm(tempHome, { recursive: true, force: true });
});

describe("installCliWrapper", () => {
  test("writes executable fur launcher", async () => {
    const root = join(tempHome, "fur-skills");
    const srcCli = join(root, "src", "cli.ts");
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(srcCli, "#!/usr/bin/env bun\n", "utf-8");

    process.env.FUR_SKILLS_ROOT = root;
    await installCliWrapper(root, "/usr/bin/bun");

    const furBin = join(tempHome, "bin", "fur");
    expect(existsSync(furBin)).toBe(true);
    const content = await readFile(furBin, "utf-8");
    expect(content).toContain('exec "/usr/bin/bun"');
    expect(content).toContain(`"${srcCli}"`);

    const { access } = await import("node:fs/promises");
    const { constants } = await import("node:fs");
    await access(furBin, constants.X_OK);
  });
});
