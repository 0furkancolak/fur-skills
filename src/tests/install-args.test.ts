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

  test("parses --lang tr", () => {
    const parsed = parseInstallArgs(["--lang", "tr", "--yes"]);
    expect(parsed.options.locale).toBe("tr");
    expect(parsed.langExplicit).toBe(true);
    expect(parsed.invalidLang).toBe(false);
  });

  test("flags invalid --lang", () => {
    const parsed = parseInstallArgs(["--lang=fr"]);
    expect(parsed.invalidLang).toBe(true);
  });
});
