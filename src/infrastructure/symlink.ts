import { lstat, readlink, symlink, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function ensureDir(path: string): Promise<void> {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(path, { recursive: true });
}

export async function symlinkForce(target: string, linkPath: string): Promise<void> {
  const resolvedTarget = resolve(target);

  try {
    const stat = await lstat(linkPath);
    if (stat.isSymbolicLink()) {
      try {
        const current = await readlink(linkPath);
        const resolvedCurrent = resolve(dirname(linkPath), current);
        if (resolvedCurrent === resolvedTarget) {
          return;
        }
      } catch {
        // broken symlink — replace below
      }
      await unlink(linkPath);
    } else {
      throw new Error(
        `${linkPath} zaten mevcut ve bir symlink değil. Elle kaldırın veya taşıyın, sonra tekrar deneyin.`,
      );
    }
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      throw e;
    }
  }

  await symlink(target, linkPath);
}
