import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { planningDir } from "./planning.ts";

export type TaskManifestStatus =
  | "planned"
  | "backlog"
  | "ready"
  | "done"
  | "deferred"
  | "cancelled"
  | "unknown";

/** Fixed hours per manifest Est. letter (no ranges). */
export const ESTIMATE_HOURS: Record<string, number> = {
  S: 1.5,
  M: 3,
  L: 6,
  XL: 12,
};

export const DEFAULT_SESSION_HOURS = 3;

export interface PlanFrontmatter {
  plan_version?: number;
  slug?: string;
  title?: string;
  status?: string;
  estimated_tasks?: number;
  /** Integer only — no ranges like "8-12" */
  estimated_sessions?: number;
  /** Hours per focused session (default 3) */
  session_hours?: number;
  /** Total planned hours — should match sum of manifest Est. column */
  estimated_hours?: number;
  target_start?: string;
  /** Single ISO date — no ranges */
  target_end?: string;
  /** @deprecated Use estimated_hours + target_end instead */
  estimated_duration?: string;
  created?: string;
}

export interface ManifestRow {
  id: string;
  title: string;
  phase: string;
  estimate: string;
  status: TaskManifestStatus;
  taskFile: string;
}

/** Weighted progress: done=100%, ready=50%, backlog=25%, planned/deferred/cancelled=0% */
const STATUS_PROGRESS_WEIGHT: Record<TaskManifestStatus, number> = {
  done: 1,
  ready: 0.5,
  backlog: 0.25,
  planned: 0,
  deferred: 0,
  cancelled: 0,
  unknown: 0,
};

export interface PlanMetrics {
  byStatus: Record<string, number>;
  doneCount: number;
  totalCount: number;
  /** Strict completion: done / total */
  percentDone: number;
  /** Weighted pipeline progress across all manifest rows */
  percentProgress: number;
}

export interface PlanReport extends PlanMetrics {
  slug: string;
  path: string;
  frontmatter: PlanFrontmatter;
  rows: ManifestRow[];
}

export function computePlanMetrics(rows: ManifestRow[]): PlanMetrics {
  const byStatus: Record<string, number> = {};
  let doneCount = 0;
  let weightedSum = 0;

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    if (row.status === "done") doneCount++;
    weightedSum += STATUS_PROGRESS_WEIGHT[row.status] ?? 0;
  }

  const totalCount = rows.length;
  const percentDone =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const percentProgress =
    totalCount === 0 ? 0 : Math.round((weightedSum / totalCount) * 100);

  return { byStatus, doneCount, totalCount, percentDone, percentProgress };
}

/** ASCII progress bar, e.g. [████████░░░░░░░░░░░░] 40% */
export function formatProgressBar(percent: number, width = 20): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${clamped}%`;
}

export function hoursFromTaskEstimate(est: string): number {
  const key = est.trim().toUpperCase();
  return ESTIMATE_HOURS[key] ?? 0;
}

export function sumManifestHours(rows: ManifestRow[]): number {
  return rows.reduce((sum, row) => sum + hoursFromTaskEstimate(row.estimate), 0);
}

/** Detect vague ranges like "2-3 weeks", "8–12 sessions", "3-4 days". */
export function findVagueTimeRanges(text: string): string[] {
  const patterns: Array<{ re: RegExp; label: string }> = [
    {
      re: /\d+\s*[-–]\s*\d+\s*(week|weeks|day|days|hour|hours|session|sessions|hafta|gün|saat|oturum)/gi,
      label: "range + unit",
    },
    { re: /\d+\s*[-–]\s*\d+\s*(weeks?|days?)/gi, label: "range (week/day)" },
    {
      re: /estimated_duration:\s*[^\n]*\d+\s*[-–]\s*\d+/gi,
      label: "frontmatter estimated_duration range",
    },
    {
      re: /estimated_sessions:\s*[^\n]*\d+\s*[-–]\s*\d+/gi,
      label: "frontmatter estimated_sessions range",
    },
  ];
  const hits = new Set<string>();
  for (const { re, label } of patterns) {
    if (re.test(text)) hits.add(label);
    re.lastIndex = 0;
  }
  return [...hits];
}

export function formatPlanSchedule(report: PlanReport): string {
  const fm = report.frontmatter;
  const manifestHours = sumManifestHours(report.rows);
  const hours =
    fm.estimated_hours != null && fm.estimated_hours > 0
      ? fm.estimated_hours
      : manifestHours;
  const sessions =
    fm.estimated_sessions != null && fm.estimated_sessions > 0
      ? fm.estimated_sessions
      : report.totalCount;
  const sessionHours = fm.session_hours ?? DEFAULT_SESSION_HOURS;
  const sessionTotal = sessions * sessionHours;

  const lines: string[] = [];
  lines.push(`Total time: ${hours} hours (manifest sum: ${manifestHours} hours)`);
  lines.push(
    `Session plan: ${sessions} sessions × ${sessionHours} hours = ${sessionTotal} hours`,
  );
  if (fm.target_start) lines.push(`Start: ${fm.target_start}`);
  if (fm.target_end) lines.push(`Target end: ${fm.target_end}`);
  if (hours !== sessionTotal) {
    lines.push(
      `Note: total hours (${hours}) does not match session plan (${sessionTotal}) — fix the plan`,
    );
  }
  return lines.join("\n");
}

export function formatPlanProgress(report: PlanMetrics): string {
  return (
    `${formatProgressBar(report.percentDone)} complete · ` +
    `${report.doneCount}/${report.totalCount} done · ` +
    `progress ${report.percentProgress}%`
  );
}

const MANIFEST_HEADER =
  /^\|\s*ID\s*\|\s*Title\s*\|\s*Phase\s*\|\s*Est\.\s*\|\s*Status\s*\|\s*Task file\s*\|/i;

function normalizeStatus(raw: string): TaskManifestStatus {
  const s = raw.trim().toLowerCase();
  if (
    s === "planned" ||
    s === "backlog" ||
    s === "ready" ||
    s === "done" ||
    s === "deferred" ||
    s === "cancelled"
  ) {
    return s;
  }
  return "unknown";
}

function parseManifestTable(body: string): ManifestRow[] {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => MANIFEST_HEADER.test(l));
  if (start === -1) return [];

  const rows: ManifestRow[] = [];
  for (let i = start + 2; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line.startsWith("|")) break;
    if (/^\|\s*---/.test(line)) continue;

    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cells.length < 6) continue;
    const [id, title, phase, estimate, status, taskFile] = cells;
    if (!id || id === "ID") continue;

    rows.push({
      id,
      title: title ?? "",
      phase: phase ?? "",
      estimate: estimate ?? "",
      status: normalizeStatus(status ?? ""),
      taskFile: taskFile ?? "",
    });
  }
  return rows;
}

function parseFrontmatter(text: string): {
  frontmatter: PlanFrontmatter;
  body: string;
} {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: text };
  }
  const fm = YAML.parse(match[1]!) as PlanFrontmatter;
  return { frontmatter: fm ?? {}, body: match[2]! };
}

export function slugFromPlanPath(planPath: string): string {
  const base = planPath.split("/").pop() ?? planPath;
  return base.replace(/\.md$/i, "");
}

export async function loadPlan(
  planPath: string,
  root = process.cwd(),
): Promise<PlanReport | null> {
  const rel = planPath.startsWith("plans/")
    ? planPath
    : `plans/${planPath.endsWith(".md") ? planPath : `${planPath}.md`}`;
  const abs = planPath.startsWith("/") ? planPath : join(planningDir(root), rel);

  if (!existsSync(abs)) return null;

  const text = await readFile(abs, "utf-8");
  const { frontmatter, body } = parseFrontmatter(text);
  const rows = parseManifestTable(body);
  const slug = frontmatter.slug ?? slugFromPlanPath(abs);

  const metrics = computePlanMetrics(rows);

  return {
    slug,
    path: abs.replace(`${root}/`, "").replace(/^\//, ""),
    frontmatter,
    rows,
    ...metrics,
  };
}

export async function listPlans(root = process.cwd()): Promise<string[]> {
  const plansPath = join(planningDir(root), "plans");
  if (!existsSync(plansPath)) return [];

  const entries = await readdir(plansPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => join("plans", e.name))
    .sort();
}

export async function reconcilePlanFromDisk(
  report: PlanReport,
  root = process.cwd(),
): Promise<PlanReport> {
  const base = planningDir(root);
  const taskDirs = ["tasks/backlog", "tasks/ready", "tasks/done"] as const;

  const onDisk = new Map<
    string,
    { status: TaskManifestStatus; path: string }
  >();

  for (const dir of taskDirs) {
    const fullDir = join(base, dir);
    if (!existsSync(fullDir)) continue;
    const files = await readdir(fullDir);
    for (const file of files.filter((f) => f.endsWith(".md"))) {
      const rel = `${dir}/${file}`;
      const content = await readFile(join(fullDir, file), "utf-8");
      const idMatch = content.match(/Plan task ID:\s*(T\d+)/i);
      const planMatch = content.match(/Plan:\s*plans\/([^\s\n]+)/i);
      if (!planMatch) continue;
      const planSlug = planMatch[1]!.replace(/\.md$/i, "");
      if (planSlug !== report.slug) continue;
      const taskId = idMatch?.[1] ?? rel;
      const folderStatus = dir.split("/")[1] as TaskManifestStatus;
      onDisk.set(taskId, { status: folderStatus, path: rel });
    }
  }

  const rows = report.rows.map((row) => {
    const disk = onDisk.get(row.id);
    if (disk) {
      return {
        ...row,
        status: disk.status,
        taskFile: disk.path,
      };
    }
    return row;
  });

  return {
    ...report,
    rows,
    ...computePlanMetrics(rows),
  };
}

export function formatPlanSummary(report: PlanReport): string {
  const fm = report.frontmatter;
  const lines: string[] = [];
  lines.push(`Plan: ${report.slug}`);
  lines.push(`File: ${report.path}`);
  if (fm.title) lines.push(`Title: ${fm.title}`);
  if (fm.estimated_tasks != null) {
    lines.push(
      `Estimated tasks (declared): ${fm.estimated_tasks} | manifest rows: ${report.totalCount}`,
    );
  }
  lines.push(formatPlanSchedule(report));
  if (fm.estimated_duration) {
    lines.push(
      `(deprecated: use estimated_hours + target_end instead of estimated_duration)`,
    );
  }
  lines.push(formatPlanProgress(report));
  lines.push(
    `Completion: ${report.percentDone}% · Progress (weighted): ${report.percentProgress}%`,
  );
  const statusParts = Object.entries(report.byStatus)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  if (statusParts.length > 0) {
    lines.push(`By status: ${statusParts.join(", ")}`);
  }
  return lines.join("\n");
}

function nextActionableTask(rows: ManifestRow[]): ManifestRow | undefined {
  return (
    rows.find((r) => r.status === "ready") ??
    rows.find((r) => r.status === "backlog") ??
    rows.find((r) => r.status === "planned")
  );
}

/**
 * Markdown block agents must paste into chat (primary UX — not CLI).
 * See src/references/plan-ai-output.md
 */
export function formatPlanDashboardMarkdown(report: PlanReport): string {
  const fm = report.frontmatter;
  const manifestHours = sumManifestHours(report.rows);
  const hours =
    fm.estimated_hours != null && fm.estimated_hours > 0
      ? fm.estimated_hours
      : manifestHours;
  const sessions =
    fm.estimated_sessions != null && fm.estimated_sessions > 0
      ? fm.estimated_sessions
      : report.totalCount;
  const sessionHours = fm.session_hours ?? DEFAULT_SESSION_HOURS;
  const next = nextActionableTask(report.rows);

  const tableRows: string[] = [
    "## Plan summary",
    "",
    fm.title ? `**${fm.title}** · \`${report.slug}\`` : `**\`${report.slug}\`**`,
    "",
    "| Field | Value |",
    "|-------|-------|",
    `| Completion | **${report.percentDone}%** (${report.doneCount}/${report.totalCount} done) |`,
    `| Progress | **${report.percentProgress}%** (ready=50%, backlog=25%) |`,
    `| Total time | ${hours} hours |`,
    `| Sessions | ${sessions} × ${sessionHours} hours = ${sessions * sessionHours} hours |`,
  ];

  if (fm.target_start) tableRows.push(`| Start | ${fm.target_start} |`);
  if (fm.target_end) tableRows.push(`| Target end | **${fm.target_end}** |`);
  if (next) {
    tableRows.push(
      `| Next up | **${next.id}** — ${next.title} (\`${next.status}\`) |`,
    );
  }

  tableRows.push(
    "",
    "```",
    formatProgressBar(report.percentDone, 24),
    "```",
    "",
  );

  if (report.rows.length > 0) {
    tableRows.push("| ID | Status | Est | Phase | Task |");
    tableRows.push("|----|--------|-----|-------|------|");
    for (const r of report.rows) {
      const task =
        r.taskFile.length > 0
          ? `\`${r.taskFile.split("/").pop()}\``
          : "—";
      tableRows.push(
        `| ${r.id} | ${r.status} | ${r.estimate} | ${r.phase} | ${task} |`,
      );
    }
  }

  tableRows.push("", `_Source: \`${report.path}\`_`);
  return tableRows.join("\n");
}

/** Load all plans with disk reconciliation — for status / multi-plan views. */
export async function loadAllPlanReports(
  root = process.cwd(),
): Promise<PlanReport[]> {
  const paths = await listPlans(root);
  const reports: PlanReport[] = [];
  for (const planPath of paths) {
    const report = await loadPlan(planPath, root);
    if (!report) continue;
    reports.push(await reconcilePlanFromDisk(report, root));
  }
  return reports;
}
