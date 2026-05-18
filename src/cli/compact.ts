import { existsSync, readlinkSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { planningDir } from "../lib/planning.ts";

export async function cmdCompact(): Promise<number> {
  const projectRoot = process.cwd();
  const prog = join(planningDir(projectRoot), "progress");

  if (!existsSync(prog)) {
    console.log("No progress directory. Run: fur init --gitignore");
    return 1;
  }

  const archive = join(prog, "archive");
  await mkdir(archive, { recursive: true });

  const keep = Number.parseInt(process.env.FUR_PROGRESS_KEEP ?? "8", 10);
  let protectedPath = "";
  const latestLink = join(prog, "latest.md");
  if (existsSync(latestLink)) {
    try {
      let target = readlinkSync(latestLink);
      if (!target.startsWith("/")) {
        target = join(prog, target);
      }
      protectedPath = target;
    } catch {
      /* not a symlink */
    }
  }

  const snapshotPattern = /^\d{8}-\d{6}\.md$/;

  while (true) {
    const glob = new Bun.Glob("[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-*.md");
    const files: string[] = [];
    for await (const file of glob.scan({ cwd: prog, onlyFiles: true })) {
      if (snapshotPattern.test(file)) {
        files.push(join(prog, file));
      }
    }
    files.sort();

    if (files.length <= keep) break;

    let moved = false;
    for (const fpath of files) {
      if (protectedPath && fpath === protectedPath) continue;
      await rename(fpath, join(archive, fpath.split("/").pop()!));
      moved = true;
      break;
    }

    if (!moved) {
      console.log("Could not compact further (only protected snapshot left?).");
      break;
    }
  }

  console.log(`Compaction complete (keep=${keep}).`);
  return 0;
}
