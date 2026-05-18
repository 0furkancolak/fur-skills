import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

const README_CONTENT = `# .fur.planning

Project-local planning workspace for AI agents.

## Layout

\`\`\`txt
tasks/backlog/  Draft tasks (not yet ready for implementation)
tasks/ready/    Ready-to-implement tasks (prioritized)
tasks/done/     Completed tasks (kept for reference)
plans/          Implementation plans (include parallel slices / worktree notes when needed)
progress/       Progress snapshots (fur compact -> progress/archive/)
context/        Project context: MCP, issue tracker, verification, domain notes
\`\`\`

## Rules

- Keep secrets out of this folder.
- External tracker writes require clear \`.fur.workspace/config.json\` permission.
- Local markdown is the fallback when MCP/Jira/GitHub is unavailable.
- Prefer loading \`progress/latest.md\` in agents; do not paste full task history into chat.
- Link to task files instead of pasting their full contents.
- Archive long context digests to \`context/archive/\` with a short summary left in place.
`;

const ISSUE_TRACKER_CONTENT = `# Issue Tracker

## Mode

local-markdown

## Supported Modes

- local-markdown: Tasks stored as markdown files in \`.fur.planning/tasks/\`
- jira: Sync with Jira via MCP (requires configuration)
- github: Sync with GitHub Issues via MCP (requires configuration)
- mixed: Local markdown with selective external sync

## Rules

- External writes are allowed only when \`.fur.workspace/config.json\` selects the tracker/repo unambiguously and the relevant \`writeAllowed\` flag is true.
- Reading external issues for context is allowed when tools are available.
- If external tracker is unavailable, write local markdown task.
- Never fake an external issue ID.
`;

const MCP_CONTENT = `# MCP Context

Document available MCP sources here.

Examples:

- Jira / Atlassian
- GitHub
- Context7
- Browser / Playwright
- Figma

## Rules

- Read-only context gathering is allowed when tools are configured.
- Write actions require clear \`.fur.workspace/config.json\` permission.
- If MCP is unavailable, continue with local markdown.
`;

const VERIFICATION_CONTENT = `# Verification

Update these commands per project.

\`\`\`bash
pnpm typecheck
pnpm lint
pnpm test
\`\`\`

## Rules

- Run targeted checks first (e.g., lint only changed files).
- Do not claim done when verification fails.
- If a command is missing, explain it and suggest an alternative.
- Always run verification before marking a task as done.
`;

export function planningDir(projectRoot: string): string {
  return join(projectRoot, ".fur.planning");
}

export async function ensurePlanningDirs(projectRoot: string): Promise<void> {
  const base = planningDir(projectRoot);
  await mkdir(join(base, "tasks", "backlog"), { recursive: true });
  await mkdir(join(base, "tasks", "ready"), { recursive: true });
  await mkdir(join(base, "tasks", "done"), { recursive: true });
  await mkdir(join(base, "plans"), { recursive: true });
  await mkdir(join(base, "progress"), { recursive: true });
  await mkdir(join(base, "progress", "archive"), { recursive: true });
  await mkdir(join(base, "context"), { recursive: true });
  await mkdir(join(base, "context", "archive"), { recursive: true });
}

export async function writePlanningFiles(projectRoot: string): Promise<void> {
  const base = planningDir(projectRoot);
  await writeFile(join(base, "README.md"), README_CONTENT);

  const issuePath = join(base, "context", "issue-tracker.md");
  if (!existsSync(issuePath)) {
    await writeFile(issuePath, ISSUE_TRACKER_CONTENT);
  }

  const mcpPath = join(base, "context", "mcp.md");
  if (!existsSync(mcpPath)) {
    await writeFile(mcpPath, MCP_CONTENT);
  }

  const verificationPath = join(base, "context", "verification.md");
  if (!existsSync(verificationPath)) {
    await writeFile(verificationPath, VERIFICATION_CONTENT);
  }
}

export async function addGitignoreEntry(projectRoot: string): Promise<void> {
  const gitignoreFile = join(projectRoot, ".gitignore");
  let content = "";
  if (existsSync(gitignoreFile)) {
    content = await readFile(gitignoreFile, "utf-8");
  }
  if (!content.split("\n").some((line) => line.trim() === ".fur.planning/")) {
    await appendFile(
      gitignoreFile,
      "\n# Fur agent planning workspace\n.fur.planning/\n",
    );
  }
}

export interface PlanningConfig {
  gitignore: boolean;
  questionLevel: string;
  projectMaturity: string;
  responseDepth: string;
  evidenceStyle: string;
  verificationStrictness: string;
}

export async function writeConfig(
  projectRoot: string,
  config: PlanningConfig,
): Promise<void> {
  const createdAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = {
    version: 2,
    planningDir: ".fur.planning",
    gitignore: config.gitignore,
    localTaskMode: "local-markdown",
    questionLevel: config.questionLevel,
    projectMaturity: config.projectMaturity,
    responseDepth: config.responseDepth,
    evidenceStyle: config.evidenceStyle,
    verificationStrictness: config.verificationStrictness,
    questionPolicy: {
      askBeforeSplittingLargeTasks: true,
      askWhenAcceptanceCriteriaMissing: true,
      askWhenTrackerConfigAmbiguous: true,
      askWhenRiskIsHigh: true,
    },
    createdAt,
  };
  await writeFile(
    join(planningDir(projectRoot), "config.json"),
    `${JSON.stringify(body, null, 2)}\n`,
  );
}

export async function countMd(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  const glob = new Bun.Glob("*.md");
  let count = 0;
  for await (const _ of glob.scan({ cwd: dir, onlyFiles: true })) {
    count++;
  }
  return count;
}
