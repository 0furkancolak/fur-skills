import { gradeFiles } from "./grader-engine.ts";
import {
  GRADER_PROFILES,
  isSkillName,
  type SkillName,
} from "./grader-profiles.ts";

export async function runGraderCli(skillName: SkillName): Promise<number> {
  const args = process.argv.slice(2);
  const filtered = args.filter((a) => a !== skillName && !a.endsWith("deterministic.ts"));

  if (filtered.length < 2) {
    console.error(
      `Usage: bun src/evals/${skillName}/graders/deterministic.ts <skill_md_path> <output_md_path>`,
    );
    return 1;
  }

  const skillPath = filtered[0]!;
  const outputPath = filtered[1]!;
  const profile = GRADER_PROFILES[skillName];
  const results = await gradeFiles(skillPath, outputPath, profile);
  console.log(JSON.stringify(results, null, 2));
  return results.score < results.max_score ? 1 : 0;
}

export async function runGraderFromArgs(
  skillName: string,
  skillPath: string,
  outputPath: string,
): Promise<number> {
  if (!isSkillName(skillName)) {
    console.error(`Unknown skill: ${skillName}`);
    return 1;
  }
  const profile = GRADER_PROFILES[skillName];
  const results = await gradeFiles(skillPath, outputPath, profile);
  console.log(JSON.stringify(results, null, 2));
  return results.score < results.max_score ? 1 : 0;
}
