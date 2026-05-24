import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  listPlans,
  loadPlan,
  reconcilePlanFromDisk,
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
}

export interface FurState {
  version: 1;
  updatedAt: string;
  projectRoot: string;
  activeTask: string | null;
  activePlan: string | null;
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

async function activePlanForTask(
  activeTaskPath: string | null,
  plans: PlanStateSummary[],
): Promise<string | null> {
  if (!activeTaskPath) return plans[0]?.slug ?? null;
  for (const plan of plans) {
    if (await taskMentionsPlan(activeTaskPath, plan.slug)) return plan.slug;
  }
  return plans[0]?.slug ?? null;
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

  const planSummaries: PlanStateSummary[] = [];
  for (const planPath of await listPlans(projectRoot)) {
    const report = await loadPlan(planPath, projectRoot);
    if (!report) continue;
    const reconciled = await reconcilePlanFromDisk(report, projectRoot);
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
    });
  }

  const activeTask =
    readyFiles.length > 0
      ? join(".fur.planning", "tasks", "ready", readyFiles[0]!)
      : backlogFiles.length > 0
        ? join(".fur.planning", "tasks", "backlog", backlogFiles[0]!)
        : null;
  const activeTaskAbs = activeTask ? join(projectRoot, activeTask) : null;
  const activePlan = await activePlanForTask(activeTaskAbs, planSummaries);
  const nextRecommendedAction =
    readyFiles.length > 0
      ? `fur-do ${basename(readyFiles[0]!)}`
      : backlogFiles.length > 0
        ? "fur-task to clarify or promote the next backlog task"
        : "fur-task to create the next unit of work";

  return {
    version: 1,
    updatedAt: updatedAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
    projectRoot,
    activeTask,
    activePlan,
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
