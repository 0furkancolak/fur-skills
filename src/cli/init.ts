import {
  addGitignoreEntry,
  ensurePlanningDirs,
  writeConfig,
  writePlanningFiles,
} from "../lib/planning.ts";
import {
  isTty,
  parseGitignoreAnswer,
  promptChoice,
  validEvidenceStyle,
  validProjectMaturity,
  validQuestionLevel,
  validResponseDepth,
  validVerificationStrictness,
} from "../lib/prompts.ts";
import { reportWorkspaceHint } from "../lib/workspace.ts";

export interface InitOptions {
  mode?: "--gitignore" | "--no-gitignore";
  questionLevel?: string;
  projectMaturity?: string;
  responseDepth?: string;
  evidenceStyle?: string;
  verificationStrictness?: string;
}

function parseInitArgs(args: string[]): InitOptions {
  const opts: InitOptions = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i]!;
    if (arg === "--gitignore" || arg === "--no-gitignore") {
      opts.mode = arg;
      i++;
    } else if (
      arg === "--question-level" ||
      arg === "--project-maturity" ||
      arg === "--response-depth" ||
      arg === "--evidence-style" ||
      arg === "--verification-strictness"
    ) {
      const value = args[i + 1];
      if (!value) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      if (arg === "--question-level") opts.questionLevel = value;
      if (arg === "--project-maturity") opts.projectMaturity = value;
      if (arg === "--response-depth") opts.responseDepth = value;
      if (arg === "--evidence-style") opts.evidenceStyle = value;
      if (arg === "--verification-strictness") opts.verificationStrictness = value;
      i += 2;
    } else {
      console.error(`Unknown init option: ${arg}`);
      console.error(
        "Usage: fur init [--gitignore|--no-gitignore] [--question-level ...] ...",
      );
      process.exit(1);
    }
  }
  return opts;
}

export async function cmdInit(args: string[]): Promise<number> {
  const projectRoot = process.cwd();
  const opts = parseInitArgs(args);

  let mode = opts.mode;
  if (!mode) {
    if (isTty()) {
      const answer = await promptChoice(
        "Ignore .fur.planning in git? yes/no",
        "yes",
      );
      const parsed = parseGitignoreAnswer(answer);
      if (!parsed) {
        console.error(`Invalid answer: ${answer}`);
        return 1;
      }
      mode = parsed;
    } else {
      mode = "--gitignore";
    }
  }

  let projectMaturity = opts.projectMaturity;
  if (!projectMaturity) {
    if (isTty()) {
      projectMaturity = await promptChoice(
        "Project maturity (new/established)",
        "new",
      );
    } else {
      projectMaturity = "new";
    }
  }
  if (!validProjectMaturity(projectMaturity)) {
    console.error(`Invalid project maturity: ${projectMaturity}`);
    console.error("Expected: new or established");
    return 1;
  }

  let questionLevel = opts.questionLevel;
  if (!questionLevel) {
    if (isTty()) {
      const defaultLevel =
        projectMaturity === "established" ? "normal" : "high";
      questionLevel = await promptChoice(
        "Question level (low/normal/high)",
        defaultLevel,
      );
    } else {
      questionLevel =
        projectMaturity === "established" ? "normal" : "high";
    }
  }
  if (!validQuestionLevel(questionLevel)) {
    console.error(`Invalid question level: ${questionLevel}`);
    return 1;
  }

  let responseDepth = opts.responseDepth;
  if (!responseDepth) {
    responseDepth = isTty()
      ? await promptChoice("Response depth (concise/standard/deep)", "standard")
      : "standard";
  }
  if (!validResponseDepth(responseDepth)) {
    console.error(`Invalid response depth: ${responseDepth}`);
    return 1;
  }

  let evidenceStyle = opts.evidenceStyle;
  if (!evidenceStyle) {
    evidenceStyle = isTty()
      ? await promptChoice(
          "Evidence style (paths-only/inline/inline-plus-paths)",
          "inline",
        )
      : "inline";
  }
  if (!validEvidenceStyle(evidenceStyle)) {
    console.error(`Invalid evidence style: ${evidenceStyle}`);
    return 1;
  }

  let verificationStrictness = opts.verificationStrictness;
  if (!verificationStrictness) {
    verificationStrictness = isTty()
      ? await promptChoice(
          "Verification strictness (loose/normal/strict)",
          "normal",
        )
      : "normal";
  }
  if (!validVerificationStrictness(verificationStrictness)) {
    console.error(`Invalid verification strictness: ${verificationStrictness}`);
    return 1;
  }

  await ensurePlanningDirs(projectRoot);
  await writePlanningFiles(projectRoot);

  const useGitignore = mode === "--gitignore";
  if (useGitignore) {
    await addGitignoreEntry(projectRoot);
  }

  await writeConfig(projectRoot, {
    gitignore: useGitignore,
    questionLevel,
    projectMaturity,
    responseDepth,
    evidenceStyle,
    verificationStrictness,
  });

  if (useGitignore) {
    console.log("Initialized .fur.planning and added it to .gitignore");
  } else {
    console.log("Initialized .fur.planning without adding it to .gitignore");
  }

  console.log(`Question level: ${questionLevel}`);
  console.log(`Project maturity: ${projectMaturity}`);
  console.log(`Response depth: ${responseDepth}`);
  console.log(`Evidence style: ${evidenceStyle}`);
  console.log(`Verification strictness: ${verificationStrictness}`);
  console.log("");
  reportWorkspaceHint(projectRoot);
  return 0;
}
