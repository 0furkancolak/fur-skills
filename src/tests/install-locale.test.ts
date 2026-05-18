import { describe, expect, test } from "bun:test";
import {
  createInstallMessages,
  detectLocaleFromEnv,
  parseLangFromArgs,
  resolveInstallLocale,
} from "../install/i18n/index.ts";
import { runPreflight } from "../install/preflight.ts";
import { defaultInstallOptions } from "../install/types.ts";
import { repoRoot } from "../lib/paths.ts";

describe("resolveInstallLocale", () => {
  test("--lang tr wins", () => {
    expect(resolveInstallLocale(["--lang", "tr"], {})).toBe("tr");
    expect(resolveInstallLocale(["--lang=tr"], {})).toBe("tr");
  });

  test("FUR_LANG overrides LANG", () => {
    expect(
      resolveInstallLocale([], { FUR_LANG: "en", LANG: "tr_TR.UTF-8" }),
    ).toBe("en");
  });

  test("LANG tr_* maps to tr", () => {
    expect(detectLocaleFromEnv({ LANG: "tr_TR.UTF-8" })).toBe("tr");
    expect(detectLocaleFromEnv({ LC_ALL: "tr_TR" })).toBe("tr");
    expect(detectLocaleFromEnv({ LANG: "en_US.UTF-8" })).toBe("en");
  });

  test("fallback is en", () => {
    expect(resolveInstallLocale([], {})).toBe("en");
  });
});

describe("parseLangFromArgs", () => {
  test("parses --lang=en", () => {
    expect(parseLangFromArgs(["--lang=en"])).toBe("en");
  });

  test("returns undefined for invalid", () => {
    expect(parseLangFromArgs(["--lang=fr"])).toBeUndefined();
  });
});

describe("createInstallMessages", () => {
  test("en and tr differ for prompt.hosts", () => {
    const en = createInstallMessages("en").t("prompt.hosts");
    const tr = createInstallMessages("tr").t("prompt.hosts");
    expect(en).not.toBe(tr);
    expect(en).toContain("environments");
    expect(tr).toContain("ortam");
  });
});

describe("runPreflight locale", () => {
  test("tr messages when locale is tr", async () => {
    const m = createInstallMessages("tr");
    const report = await runPreflight(
      defaultInstallOptions("tr"),
      repoRoot(),
      m,
    );
    const bun = report.checks.find((c) => c.id === "bun");
    expect(bun?.message).toMatch(/Bun:|PATH/);
    if (bun?.ok) {
      expect(bun.message).toContain("Bun:");
    } else {
      expect(bun?.message).toContain("PATH");
    }
  });
});
