import { describe, expect, test } from "bun:test";
import { CommandRegistry } from "../cli/registry.ts";

describe("CommandRegistry", () => {
  test("resolves primary command names", () => {
    const registry = new CommandRegistry();
    expect(registry.resolve("init")?.name).toBe("init");
    expect(registry.resolve("repo-doctor")?.name).toBe("repo-doctor");
  });

  test("resolves help aliases", () => {
    const registry = new CommandRegistry();
    expect(registry.resolve("--help")?.name).toBe("help");
    expect(registry.resolve("-h")?.name).toBe("help");
  });

  test("returns undefined for unknown commands", () => {
    const registry = new CommandRegistry();
    expect(registry.resolve("not-a-command")).toBeUndefined();
  });
});
