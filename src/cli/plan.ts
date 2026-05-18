import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  findVagueTimeRanges,
  formatPlanProgress,
  formatPlanSchedule,
  formatPlanSummary,
  formatProgressBar,
  listPlans,
  loadPlan,
  reconcilePlanFromDisk,
  slugFromPlanPath,
} from "../lib/plan-manifest.ts";
import { planningDir } from "../lib/planning.ts";

function resolvePlanArg(arg: string | undefined, root: string): string | null {
  if (!arg) return null;
  if (arg.startsWith("plans/")) return arg;
  return `plans/${arg.replace(/\.md$/i, "")}.md`;
}

export async function cmdPlan(args: string[]): Promise<number> {
  const sub = args[0] ?? "status";
  const root = process.cwd();
  const planning = planningDir(root);

  if (!existsSync(planning)) {
    console.error("No .fur.planning found. Run: fur init --gitignore");
    return 1;
  }

  if (sub === "list") {
    const plans = await listPlans(root);
    if (plans.length === 0) {
      console.log("No plans in .fur.planning/plans/");
      console.log("Large work should create plans/<slug>.md — see src/references/plan-template.md");
      return 0;
    }

    console.log("Plans");
    console.log("=====");
    for (const planPath of plans) {
      const report = await loadPlan(planPath, root);
      if (!report) continue;
      const reconciled = await reconcilePlanFromDisk(report, root);
      console.log("");
      console.log(formatPlanSummary(reconciled));
    }
    return 0;
  }

  if (sub === "status") {
    const planArg = resolvePlanArg(args[1], root);
    let planPath = planArg;

    if (!planPath) {
      const plans = await listPlans(root);
      if (plans.length === 0) {
        console.error("No plans found. Create one via fur-task (split mode).");
        return 1;
      }
      if (plans.length === 1) {
        planPath = plans[0]!;
      } else {
        console.error("Usage: fur plan status <slug>");
        console.error("Available:");
        for (const p of plans) console.error(`  - ${slugFromPlanPath(p)}`);
        return 1;
      }
    }

    const report = await loadPlan(planPath, root);
    if (!report) {
      console.error(`Plan not found: ${planPath}`);
      return 1;
    }

    const reconciled = await reconcilePlanFromDisk(report, root);
    const planAbs = join(root, reconciled.path);
    const planText = existsSync(planAbs)
      ? await readFile(planAbs, "utf-8")
      : "";
    const vagueRanges = planText ? findVagueTimeRanges(planText) : [];

    if (process.stdin.isTTY && process.stdout.isTTY) {
      p.intro(
        `fur plan — ${reconciled.slug} · ${reconciled.percentDone}% complete`,
      );
      p.note(
        `${formatProgressBar(reconciled.percentDone, 24)}\n${formatPlanProgress(reconciled)}`,
        "Completion",
      );
      p.note(formatPlanSchedule(reconciled), "Schedule");
      p.note(formatPlanSummary(reconciled), "Summary");

      if (vagueRanges.length > 0) {
        p.log.warn(
          `Vague time range detected (${vagueRanges.join(", ")}). Use single numbers + dates — see plan-template.md`,
        );
      }
      if (!reconciled.frontmatter.target_end) {
        p.log.warn("Missing target_end — add a single due date (YYYY-MM-DD) to the plan.");
      }

      if (reconciled.rows.length > 0) {
        const table = reconciled.rows
          .map(
            (r) =>
              `${r.id.padEnd(4)} ${r.status.padEnd(8)} ${r.estimate.padEnd(3)} ${r.phase.padEnd(10)} ${r.title.slice(0, 40)}`,
          )
          .join("\n");
        p.note(`ID   Status   Est Phase      Title\n${table}`, "Task manifest");
      } else {
        p.log.warn(
          "Manifest table missing — add ## Task manifest per src/references/plan-template.md",
        );
      }

      const fm = reconciled.frontmatter;
      if (
        fm.estimated_tasks != null &&
        fm.estimated_tasks !== reconciled.totalCount
      ) {
        p.log.warn(
          `Frontmatter estimated_tasks (${fm.estimated_tasks}) ≠ manifest rows (${reconciled.totalCount})`,
        );
      }

      p.outro("Next: `fur-do` on the top ready task");
    } else {
      console.log(formatPlanSummary(reconciled));
      console.log("");
      for (const row of reconciled.rows) {
        console.log(
          `${row.id}\t${row.status}\t${row.estimate}\t${row.phase}\t${row.title}\t${row.taskFile}`,
        );
      }
    }
    return 0;
  }

  console.error("Usage:");
  console.error("  fur plan list");
  console.error("  fur plan status <slug>");
  return 1;
}
