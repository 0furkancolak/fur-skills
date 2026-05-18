import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadWorkspaceConfig,
  validateWorkspaceConfig,
  workspaceRootFromConfig,
} from "../lib/workspace.ts";

function workspaceDir(projectRoot: string): string {
  return join(projectRoot, ".fur.workspace");
}

function workspaceConfigPath(projectRoot: string): string {
  return join(workspaceDir(projectRoot), "config.json");
}

export async function cmdWorkspaceInit(): Promise<number> {
  const projectRoot = process.cwd();
  const dir = workspaceDir(projectRoot);
  await mkdir(dir, { recursive: true });

  const config = workspaceConfigPath(projectRoot);
  if (existsSync(config)) {
    console.log("Workspace config already exists:");
    console.log(config);
    return 0;
  }

  const createdAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = {
    version: 1,
    defaultTaskSource: "local",
    writePolicy: "config-allowed",
    repositories: [],
    createdAt,
  };
  await writeFile(config, `${JSON.stringify(body, null, 2)}\n`);

  console.log("Workspace config written:");
  console.log(config);
  console.log("");
  console.log(
    "Add repository entries under repositories[] before using tracker-aware imports or external writes.",
  );
  return 0;
}

export async function cmdWorkspaceDoctor(): Promise<number> {
  const projectRoot = process.cwd();
  const config = workspaceConfigPath(projectRoot);

  if (!existsSync(config)) {
    console.log("No workspace config found:");
    console.log(config);
    console.log("Run: fur workspace init");
    return 1;
  }

  let data;
  try {
    data = await loadWorkspaceConfig(config);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log("Fur workspace doctor");
    console.log("====================");
    console.log("");
    console.log(`Invalid JSON: ${msg}`);
    return 1;
  }

  const actualRoot = workspaceRootFromConfig(config);

  console.log("Fur workspace doctor");
  console.log("====================");
  console.log("");
  console.log(`Workspace: ${actualRoot}`);
  console.log(`Config: ${config}`);
  console.log("");

  const result = validateWorkspaceConfig(config, data);

  console.log(`Repositories: ${result.repoCount}`);
  console.log(`Default task source: ${result.defaultTaskSource}`);
  console.log(`Write policy: ${result.writePolicy}`);
  console.log("");

  if (result.errors.length > 0) {
    console.log("Errors:");
    for (const error of result.errors) {
      console.log(`- ${error}`);
    }
  } else {
    console.log("Errors: none");
  }

  console.log("");
  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  } else {
    console.log("Warnings: none");
  }

  return result.errors.length > 0 ? 1 : 0;
}
