import { existsSync } from "node:fs";
import { chmod, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { ensureDir } from "../infrastructure/symlink.ts";
import { cliEntryPath, homeBinFur } from "../lib/paths.ts";

/** Writes an executable ~/bin/fur launcher (shell cannot exec a non-+x .ts symlink). */
export async function installCliWrapper(
  root: string,
  bunPath = Bun.which("bun") ?? "bun",
): Promise<void> {
  const cliPath = cliEntryPath(root);
  const target = homeBinFur();
  await ensureDir(dirname(target));

  if (existsSync(target)) {
    await unlink(target);
  }

  const body = `#!/usr/bin/env sh
set -e
exec "${bunPath}" "${cliPath}" "$@"
`;
  await writeFile(target, body, { encoding: "utf-8" });
  await chmod(target, 0o755);
}
