import { describe, expect, test } from "bun:test";
import { parseInstallArgs } from "../install/prompts-install.ts";

describe("parseInstallArgs", () => {
  test("parses --yes and host flags", () => {
    const parsed = parseInstallArgs([
      "--yes",
      "--hosts",
      "claude,cursor",
      "--no-opencode",
    ]);
    expect(parsed.nonInteractive).toBe(true);
    expect(parsed.options.hosts).toEqual(["claude", "cursor"]);
    expect(parsed.options.installOpencode).toBe(false);
  });
});
