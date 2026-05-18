import { existsSync } from "node:fs";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  countMd,
  ensurePlanningDirs,
  planningDir,
} from "../lib/planning.ts";
import {
  findWorkspaceConfig,
  repoRegisteredInWorkspace,
  reportWorkspaceHint,
} from "../lib/workspace.ts";

async function gitInfo(projectRoot: string): Promise<{
  branch: string;
  commit: string;
  status: string;
  isGit: boolean;
}> {
  const proc = Bun.spawn(["git", "rev-parse", "--is-inside-work-tree"], {
    cwd: projectRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  if (code !== 0) {
    return { branch: "", commit: "", status: "", isGit: false };
  }

  const branchProc = Bun.spawn(["git", "branch", "--show-current"], {
    cwd: projectRoot,
    stdout: "pipe",
  });
  const branch = (await new Response(branchProc.stdout).text()).trim() || "unknown";

  const commitProc = Bun.spawn(["git", "rev-parse", "--short", "HEAD"], {
    cwd: projectRoot,
    stdout: "pipe",
  });
  const commit = (await new Response(commitProc.stdout).text()).trim() || "unknown";

  const statusProc = Bun.spawn(["git", "status", "--short"], {
    cwd: projectRoot,
    stdout: "pipe",
  });
  const status = await new Response(statusProc.stdout).text();

  return { branch, commit, status, isGit: true };
}

export async function cmdRefresh(): Promise<number> {
  const projectRoot = process.cwd();
  const planning = planningDir(projectRoot);
  await ensurePlanningDirs(projectRoot);

  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  const snapshot = join(planning, "progress", `${timestamp}.md`);
  const git = await gitInfo(projectRoot);

  const workspaceConfigPath = findWorkspaceConfig(projectRoot);
  let trackerSection = "";
  if (workspaceConfigPath) {
    trackerSection += `- Workspace config: ${workspaceConfigPath}\n`;
    const repoId = repoRegisteredInWorkspace(workspaceConfigPath, projectRoot);
    trackerSection += repoId
      ? `- Workspace repo id: ${repoId}\n`
      : "- Workspace repo id: not registered\n";
  } else {
    trackerSection += "- Workspace config: not found\n";
  }

  const readyDir = join(planning, "tasks", "ready");
  const readyFiles: string[] = [];
  if (existsSync(readyDir)) {
    const glob = new Bun.Glob("*.md");
    for await (const file of glob.scan({ cwd: readyDir, onlyFiles: true })) {
      readyFiles.push(join(readyDir, file));
    }
    readyFiles.sort();
  }
  const latestReady = readyFiles.slice(-10).map((f) => `- ${f}`).join("\n");

  let gitSection = "";
  if (git.isGit) {
    gitSection = `- Branch: ${git.branch}
- Commit: ${git.commit}

### Status

\`\`\`txt
${git.status.trimEnd()}
\`\`\``;
  } else {
    gitSection = "Not a git repository.";
  }

  const body = `# Fur Progress Snapshot

Date: ${now.toString()}
Project: ${projectRoot}

## Git

${gitSection}

## Counts

- Backlog: ${await countMd(join(planning, "tasks", "backlog"))}
- Ready: ${await countMd(join(planning, "tasks", "ready"))}
- Done: ${await countMd(join(planning, "tasks", "done"))}
- Plans: ${await countMd(join(planning, "plans"))}

## Tracker sync

${trackerSection}
## Latest ready tasks

${latestReady || ""}
`;

  await writeFile(snapshot, body);
  const latestLink = join(planning, "progress", "latest.md");
  try {
    const { unlink } = await import("node:fs/promises");
    if (existsSync(latestLink)) await unlink(latestLink);
  } catch {
    /* ignore */
  }
  await symlink(snapshot, latestLink);

  console.log("Progress snapshot written:");
  console.log(snapshot);
  return 0;
}

export async function cmdProgress(): Promise<number> {
  const projectRoot = process.cwd();
  const planning = planningDir(projectRoot);

  if (!existsSync(planning)) {
    console.log("No .fur.planning found. Run:");
    console.log("  fur init --gitignore");
    console.log("or:");
    console.log("  fur init --no-gitignore");
    return 1;
  }

  console.log("Fur progress");
  console.log("============");
  console.log("");
  console.log(`- Backlog: ${await countMd(join(planning, "tasks", "backlog"))}`);
  console.log(`- Ready: ${await countMd(join(planning, "tasks", "ready"))}`);
  console.log(`- Done: ${await countMd(join(planning, "tasks", "done"))}`);
  console.log(`- Plans: ${await countMd(join(planning, "plans"))}`);
  console.log("");
  console.log("Tracker sync");
  console.log("------------");
  reportWorkspaceHint(projectRoot);
  console.log("");

  const latest = join(planning, "progress", "latest.md");
  if (existsSync(latest)) {
    console.log("Latest snapshot:");
    console.log(latest);
    console.log("");
    const text = await Bun.file(latest).text();
    const lines = text.split("\n").slice(0, 160);
    console.log(lines.join("\n"));
  } else {
    console.log("No progress snapshot yet. Run:");
    console.log("  fur refresh");
  }
  return 0;
}
