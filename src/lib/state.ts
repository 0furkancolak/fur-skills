import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  computeReadyBatch,
  listPlans,
  loadPlan,
  reconcilePlanFromDisk,
  type ReadyBatch,
  type PlanReport,
} from "./plan-manifest.ts";
import { planningDir } from "./planning.ts";

export interface TaskCounts {
  backlog: number;
  ready: number;
  done: number;
  plans: number;
}

export interface PlanStateSummary {
  slug: string;
  title?: string;
  percentDone: number;
  doneCount: number;
  totalCount: number;
  nextTaskId?: string;
  nextTaskTitle?: string;
  nextTaskStatus?: string;
  isComplete: boolean;
}

export interface FurState {
  version: 1;
  updatedAt: string;
  projectRoot: string;
  activeTask: string | null;
  activePlan: string | null;
  planLock: {
    enabled: boolean;
    activePlan: string | null;
    source: "config" | "single-active-plan" | "disabled" | "ambiguous" | "none";
  };
  readyBatch: ReadyBatch | null;
  counts: TaskCounts;
  plans: PlanStateSummary[];
  lastVerification: {
    status: "unknown";
    source: "not-recorded";
  };
  nextRecommendedAction: string;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  return files.filter((file) => file.endsWith(".md")).sort();
}

interface PlanningRuntimeConfig {
  planning?: {
    planLock?: string | boolean;
    activePlan?: string;
  };
}

async function readRuntimeConfig(
  projectRoot: string,
): Promise<PlanningRuntimeConfig> {
  const configPath = join(planningDir(projectRoot), "config.json");
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(await readFile(configPath, "utf-8")) as PlanningRuntimeConfig;
  } catch {
    return {};
  }
}

function isPlanLockEnabled(value: string | boolean | undefined): boolean {
  if (value === false) return false;
  if (typeof value === "string") {
    return value.toLowerCase() !== "disabled";
  }
  return true;
}

function nextPlanTask(report: PlanReport): {
  id?: string;
  title?: string;
  status?: string;
} {
  const row =
    report.rows.find((r) => r.status === "ready") ??
    report.rows.find((r) => r.status === "backlog") ??
    report.rows.find((r) => r.status === "planned");
  return {
    id: row?.id,
    title: row?.title,
    status: row?.status,
  };
}

async function taskMentionsPlan(taskPath: string, slug: string): Promise<boolean> {
  const text = await readFile(taskPath, "utf-8");
  const planMatch = text.match(/Plan:\s*plans\/([^\s\n]+)/i);
  return planMatch?.[1]?.replace(/\.md$/i, "") === slug;
}

async function tasksForPlan(
  projectRoot: string,
  taskFiles: string[],
  folder: "ready" | "backlog",
  slug: string,
): Promise<string[]> {
  const matched: string[] = [];
  for (const file of taskFiles) {
    const rel = join("docs/ai", "tasks", folder, file);
    if (await taskMentionsPlan(join(projectRoot, rel), slug)) {
      matched.push(rel);
    }
  }
  return matched;
}

function selectPlanLock(
  config: PlanningRuntimeConfig,
  plans: PlanStateSummary[],
): FurState["planLock"] {
  const enabled = isPlanLockEnabled(config.planning?.planLock);
  if (!enabled) {
    return {
      enabled: false,
      activePlan: null,
      source: "disabled",
    };
  }

  const configuredPlan = config.planning?.activePlan;
  if (configuredPlan) {
    return {
      enabled: true,
      activePlan: configuredPlan.replace(/^plans\//, "").replace(/\.md$/i, ""),
      source: "config",
    };
  }

  const activePlans = plans.filter((plan) => !plan.isComplete);
  if (activePlans.length === 1) {
    return {
      enabled: true,
      activePlan: activePlans[0]!.slug,
      source: "single-active-plan",
    };
  }
  if (activePlans.length > 1) {
    return {
      enabled: true,
      activePlan: null,
      source: "ambiguous",
    };
  }
  return {
    enabled: true,
    activePlan: null,
    source: "none",
  };
}

export async function buildFurState(
  projectRoot = process.cwd(),
  updatedAt = new Date(),
): Promise<FurState> {
  const planning = planningDir(projectRoot);
  const readyDir = join(planning, "tasks", "ready");
  const backlogDir = join(planning, "tasks", "backlog");
  const doneDir = join(planning, "tasks", "done");
  const plansDir = join(planning, "plans");

  const [readyFiles, backlogFiles, doneFiles, planFiles] = await Promise.all([
    listMarkdownFiles(readyDir),
    listMarkdownFiles(backlogDir),
    listMarkdownFiles(doneDir),
    listMarkdownFiles(plansDir),
  ]);
  const config = await readRuntimeConfig(projectRoot);

  const planSummaries: PlanStateSummary[] = [];
  const planReports = new Map<string, PlanReport>();
  for (const planPath of await listPlans(projectRoot)) {
    const report = await loadPlan(planPath, projectRoot);
    if (!report) continue;
    const reconciled = await reconcilePlanFromDisk(report, projectRoot);
    planReports.set(reconciled.slug, reconciled);
    const next = nextPlanTask(reconciled);
    planSummaries.push({
      slug: reconciled.slug,
      title: reconciled.frontmatter.title,
      percentDone: reconciled.percentDone,
      doneCount: reconciled.doneCount,
      totalCount: reconciled.totalCount,
      nextTaskId: next.id,
      nextTaskTitle: next.title,
      nextTaskStatus: next.status,
      isComplete: reconciled.totalCount > 0 && reconciled.doneCount === reconciled.totalCount,
    });
  }

  const planLock = selectPlanLock(config, planSummaries);
  let activeTask: string | null = null;
  let activePlan = planLock.activePlan;
  let nextRecommendedAction = "work complete; new work can be started when desired";
  let readyBatch: ReadyBatch | null = null;

  if (planLock.enabled && planLock.source === "ambiguous") {
    nextRecommendedAction =
      "select or set a plan lock before running fur-do; multiple active plans exist";
  } else if (activePlan) {
    const activeReport = planReports.get(activePlan);
    if (activeReport) {
      readyBatch = computeReadyBatch(activeReport);
    }
    const readyForPlan = await tasksForPlan(projectRoot, readyFiles, "ready", activePlan);
    const backlogForPlan = await tasksForPlan(
      projectRoot,
      backlogFiles,
      "backlog",
      activePlan,
    );
    activeTask = readyForPlan[0] ?? backlogForPlan[0] ?? null;
    if (readyBatch && readyBatch.taskIds.length > 1) {
      nextRecommendedAction = `fur-do ${readyBatch.group}`;
    } else if (readyForPlan.length > 0) {
      nextRecommendedAction = `fur-do ${basename(readyForPlan[0]!)}`;
    } else if (backlogForPlan.length > 0) {
      nextRecommendedAction = `fur-task to clarify or promote the next ${activePlan} backlog task`;
    } else {
      const plan = planSummaries.find((p) => p.slug === activePlan);
      nextRecommendedAction = plan?.isComplete
        ? `${activePlan} complete; new work can be started when desired`
        : `${activePlan} has no ready task; use fur-task to file the next planned slice`;
    }
  } else if (!planLock.enabled) {
    activeTask =
      readyFiles.length > 0
        ? join("docs/ai", "tasks", "ready", readyFiles[0]!)
        : backlogFiles.length > 0
          ? join("docs/ai", "tasks", "backlog", backlogFiles[0]!)
          : null;
    activePlan = null;
    nextRecommendedAction =
      readyFiles.length > 0
        ? `fur-do ${basename(readyFiles[0]!)}`
        : backlogFiles.length > 0
          ? "fur-task to clarify or promote the next backlog task"
          : "work complete; new work can be started when desired";
  } else if (planSummaries.length === 0) {
    if (readyFiles.length === 1) {
      activeTask = join("docs/ai", "tasks", "ready", readyFiles[0]!);
      nextRecommendedAction = `fur-do ${basename(readyFiles[0]!)}`;
    } else if (readyFiles.length > 1) {
      nextRecommendedAction =
        "select an explicit task before running fur-do; multiple ready tasks exist";
    } else if (backlogFiles.length > 0) {
      nextRecommendedAction = "fur-task to clarify or promote the next backlog task";
    }
  } else if (readyFiles.length > 0 || backlogFiles.length > 0) {
    nextRecommendedAction =
      "select an explicit plan or task before continuing; no active plan lock is set";
  }

  return {
    version: 1,
    updatedAt: updatedAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
    projectRoot,
    activeTask,
    activePlan,
    planLock,
    readyBatch,
    counts: {
      backlog: backlogFiles.length,
      ready: readyFiles.length,
      done: doneFiles.length,
      plans: planFiles.length,
    },
    plans: planSummaries,
    lastVerification: {
      status: "unknown",
      source: "not-recorded",
    },
    nextRecommendedAction,
  };
}

export async function writeFurState(
  projectRoot = process.cwd(),
  updatedAt = new Date(),
): Promise<FurState> {
  const state = await buildFurState(projectRoot, updatedAt);
  await writeFile(
    join(planningDir(projectRoot), "state.json"),
    `${JSON.stringify(state, null, 2)}\n`,
  );
  return state;
}
