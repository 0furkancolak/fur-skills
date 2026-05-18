import { existsSync } from "node:fs";
import { join } from "node:path";
import { evalPath, repoRoot, skillPath } from "../lib/paths.ts";

export async function checkEvalMeta(skill: string): Promise<number> {
  const root = repoRoot();
  const evalDir = evalPath(skill, root);
  const skillFile = skillPath(skill, root);

  if (!existsSync(evalDir)) {
    console.error(`Eval directory not found: ${evalDir}`);
    return 1;
  }

  if (!existsSync(skillFile)) {
    console.error(`Skill file not found: ${skillFile}`);
    return 1;
  }

  const promptsPath = join(evalDir, "prompts.jsonl");
  if (!existsSync(promptsPath)) {
    console.error("Missing prompts.jsonl");
    return 1;
  }

  const promptsText = await Bun.file(promptsPath).text();
  const promptCount = promptsText
    .trim()
    .split("\n")
    .filter((l) => l.trim()).length;

  console.log(`Running eval metadata checks for ${skill}`);
  console.log(`Prompts: ${promptCount}`);

  if (promptCount < 20) {
    console.error("Expected at least 20 prompts");
    return 1;
  }

  const goldenDir = join(evalDir, "golden-outputs");
  if (!existsSync(goldenDir)) {
    console.error("Missing golden-outputs/");
    return 1;
  }

  const glob = new Bun.Glob("**/*.md");
  let goldenCount = 0;
  for await (const _ of glob.scan({ cwd: goldenDir, onlyFiles: true })) {
    goldenCount++;
  }

  if (goldenCount < 5) {
    console.error(`Expected at least 5 golden outputs (found ${goldenCount})`);
    return 1;
  }

  const baselinePath = join(evalDir, "baselines", "v2-baseline.json");
  if (!existsSync(baselinePath)) {
    console.error("Missing baselines/v2-baseline.json");
    return 1;
  }

  const failureModesPath = join(evalDir, "failure-modes.md");
  if (!existsSync(failureModesPath)) {
    console.error("Missing failure-modes.md");
    return 1;
  }

  const graderTs = join(evalDir, "graders", "deterministic.ts");
  if (existsSync(graderTs)) {
    console.log("Deterministic grader found");
  } else {
    console.error("Missing graders/deterministic.ts");
    return 1;
  }

  console.log(`Eval metadata ok for ${skill}`);
  return 0;
}
