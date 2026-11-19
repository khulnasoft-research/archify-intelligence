import { realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

export interface RepositoryRoot {
  requestedPath: string;
  realPath: string;
  isDirectory: true;
}

export async function resolveLocalRepositoryRoot(
  inputPath: string,
): Promise<RepositoryRoot> {
  if (!inputPath.trim()) throw new Error("Repository path is required");
  const requestedPath = isAbsolute(inputPath) ? inputPath : resolve(inputPath);
  const realPath = await realpath(requestedPath);
  const info = await stat(realPath);
  if (!info.isDirectory())
    throw new Error("Repository root must be a directory");
  return { requestedPath, realPath, isDirectory: true };
}

export function resolveRepositoryChild(
  root: string,
  childPath: string,
): string {
  if (isAbsolute(childPath))
    throw new Error("Absolute child paths are not allowed");
  const candidate = resolve(root, childPath);
  const rel = relative(root, candidate);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error("Repository path escapes the repository root");
  }
  return candidate;
}
