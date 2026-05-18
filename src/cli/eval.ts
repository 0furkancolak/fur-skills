import { checkEvalMeta } from "../quality/eval-meta.ts";
import { runGraderFromArgs } from "../quality/grader-cli.ts";

export async function cmdEval(args: string[]): Promise<number> {
  const sub = args[0];
  if (!sub) {
    console.error("Usage: fur eval meta <skill>... | fur eval grade <skill> <skill_md> <output_md>");
    return 1;
  }

  if (sub === "meta") {
    const skills = args.slice(1);
    if (skills.length === 0) {
      console.error("Usage: fur eval meta <skill>...");
      return 1;
    }
    let code = 0;
    for (const skill of skills) {
      const result = await checkEvalMeta(skill);
      if (result !== 0) code = 1;
    }
    return code;
  }

  if (sub === "grade") {
    const [, skill, skillMd, outputMd] = args;
    if (!skill || !skillMd || !outputMd) {
      console.error("Usage: fur eval grade <skill> <skill_md> <output_md>");
      return 1;
    }
    return runGraderFromArgs(skill, skillMd, outputMd);
  }

  console.error(`Unknown eval subcommand: ${sub}`);
  return 1;
}
