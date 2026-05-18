import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";

export interface WorkspaceConfig {
  version?: number;
  defaultTaskSource?: string;
  writePolicy?: string;
  repositories?: RepositoryEntry[];
  createdAt?: string;
}

export interface RepositoryEntry {
  id?: string;
  path?: string;
  github?: {
    owner?: string;
    repo?: string;
    mcp?: string;
    writeAllowed?: boolean;
    closeAllowed?: boolean;
  };
  jira?: {
    projectKeys?: string[];
    mcp?: string;
    writeAllowed?: boolean;
    transitionAllowed?: boolean;
  };
}

export interface WorkspaceValidationResult {
  errors: string[];
  warnings: string[];
  repoCount: number;
  defaultTaskSource: string;
  writePolicy: string;
}

export function findWorkspaceConfig(startDir: string): string | null {
  let dir = realpathSync(startDir);
  while (dir !== dirname(dir)) {
    const candidate = join(dir, ".fur.workspace", "config.json");
    if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  return null;
}

export function workspaceRootFromConfig(configPath: string): string {
  return dirname(dirname(realpathSync(configPath)));
}

export function repoRegisteredInWorkspace(
  configPath: string,
  projectRoot: string,
): string | null {
  const raw = readFileSync(configPath, "utf-8");
  let data: WorkspaceConfig;
  try {
    data = JSON.parse(raw) as WorkspaceConfig;
  } catch {
    return null;
  }

  const workspaceRoot = workspaceRootFromConfig(configPath);
  const resolvedProject = realpathSync(projectRoot);

  for (const repo of data.repositories ?? []) {
    const path = repo.path;
    if (!path) continue;
    const repoRoot = realpathSync(join(workspaceRoot, path));
    if (repoRoot === resolvedProject) {
      return repo.id ?? path;
    }
  }
  return null;
}

export async function loadWorkspaceConfig(
  configPath: string,
): Promise<WorkspaceConfig> {
  const raw = await Bun.file(configPath).text();
  return JSON.parse(raw) as WorkspaceConfig;
}

export function validateWorkspaceConfig(
  configPath: string,
  data: WorkspaceConfig,
): WorkspaceValidationResult {
  const workspaceRoot = workspaceRootFromConfig(configPath);
  const errors: string[] = [];
  const warnings: string[] = [];

  const repos = data.repositories;
  if (!Array.isArray(repos)) {
    errors.push("repositories must be an array");
    return {
      errors,
      warnings,
      repoCount: 0,
      defaultTaskSource: String(data.defaultTaskSource ?? "local"),
      writePolicy: String(data.writePolicy ?? "config-allowed"),
    };
  }

  const ids = new Map<string, string[]>();
  const jiraKeys = new Map<string, string[]>();
  const githubPairs = new Map<string, string[]>();

  for (let idx = 0; idx < repos.length; idx++) {
    const repo = repos[idx]!;
    const label = repo.id ?? `repositories[${idx}]`;

    const idList = ids.get(repo.id ?? "") ?? [];
    idList.push(label);
    ids.set(repo.id ?? "", idList);

    const path = repo.path;
    if (!path) {
      errors.push(`${label}: missing path`);
    } else {
      const absPath = join(workspaceRoot, path);
      if (!existsSync(absPath)) {
        errors.push(`${label}: path does not exist: ${path}`);
      }
    }

    const github = repo.github;
    if (github && typeof github === "object") {
      const owner = github.owner;
      const name = github.repo;
      if (owner && name) {
        const key = `${owner}/${name}`;
        const list = githubPairs.get(key) ?? [];
        list.push(label);
        githubPairs.set(key, list);
      } else {
        warnings.push(`${label}: github owner/repo incomplete`);
      }
      if (!github.mcp) {
        warnings.push(`${label}: github.mcp missing`);
      }
    }

    const jira = repo.jira;
    if (jira && typeof jira === "object") {
      const keys = jira.projectKeys ?? [];
      if (keys.length === 0) {
        warnings.push(`${label}: jira.projectKeys empty`);
      }
      for (const key of keys) {
        const upper = String(key).toUpperCase();
        const list = jiraKeys.get(upper) ?? [];
        list.push(label);
        jiraKeys.set(upper, list);
      }
      if (!jira.mcp) {
        warnings.push(`${label}: jira.mcp missing`);
      }
    }
  }

  for (const [repoId, labels] of ids) {
    if (repoId && labels.length > 1) {
      errors.push(`duplicate repository id: ${repoId}`);
    }
  }

  for (const [key, labels] of jiraKeys) {
    if (labels.length > 1) {
      errors.push(`duplicate Jira project key ${key}: ${labels.join(", ")}`);
    }
  }

  for (const [pair, labels] of githubPairs) {
    if (labels.length > 1) {
      errors.push(`duplicate GitHub repository ${pair}: ${labels.join(", ")}`);
    }
  }

  return {
    errors,
    warnings,
    repoCount: repos.length,
    defaultTaskSource: String(data.defaultTaskSource ?? "local"),
    writePolicy: String(data.writePolicy ?? "config-allowed"),
  };
}

export function reportWorkspaceHint(projectRoot: string): void {
  const config = findWorkspaceConfig(projectRoot);
  if (config) {
    console.log(`Workspace config found: ${config}`);
    const registered = repoRegisteredInWorkspace(config, projectRoot);
    if (registered) {
      console.log(`Workspace repo id: ${registered}`);
    } else {
      console.log("This repo is not registered in the workspace config yet.");
      console.log(`Add a repositories[] entry for: ${projectRoot}`);
    }
  } else {
    console.log("No parent .fur.workspace/config.json found.");
    console.log("For tracker-aware multi-repo work, run from the workspace root:");
    console.log("  fur workspace init");
  }
}
