import { lstat, mkdir, readdir, readFile, link, copyFile, unlink, rename, rm, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { writeWorkspaceFile } from "@/utils/workspace/files";

// ACT: 按体积分档保留历史版本数量；固定阈值不做用户可配置项，大文件历史单文件封顶约 500MB。
const smallFileLimit = 2 * 1024 * 1024;
const smallFileRetention = 20;
const largeFileRetention = 5;
const versionNamePattern = /^([0-9]+)-([0-9a-f]{8})(\.[\w.-]+)?$/;

function historyDirectory(root: string, path: string) {
  return join(root, ".toonflow", "fileHistory", relative(root, path));
}

async function pruneHistory(directory: string, keep: number) {
  const entries = await readdir(directory).catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return []; throw err; });
  const excess = entries.sort().slice(0, Math.max(0, entries.length - keep));
  await Promise.all(excess.map(name => unlink(join(directory, name)).catch(() => {})));
}

/** 在覆盖写入前把当前文件硬链接进历史目录；不读取/复制内容，不引入写一半的中间态。 */
export async function captureFileHistory(root: string, path: string) {
  const info = await lstat(path).catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return null; throw err; });
  if (!info || !info.isFile()) return;
  const directory = historyDirectory(root, path);
  await mkdir(directory, { recursive: true });
  const ext = /\.[^./\\]+$/.exec(path)?.[0] ?? "";
  const target = join(directory, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`);
  try { await link(path, target); }
  catch (err) { if ((err as NodeJS.ErrnoException).code === "EXDEV") await copyFile(path, target); else throw err; }
  await pruneHistory(directory, info.size > smallFileLimit ? largeFileRetention : smallFileRetention);
}

/** 覆盖写入前先打一份历史快照；exclusive（新建场景）天然跳过，行为等同直接调用 writeWorkspaceFile。 */
export async function writeWorkspaceFileWithHistory(root: string, path: string, content: string | Uint8Array, exclusive = false) {
  if (!exclusive) await captureFileHistory(root, path).catch(() => {});
  await writeWorkspaceFile(path, content, exclusive);
}

export async function listFileHistory(root: string, path: string) {
  const directory = historyDirectory(root, path);
  const entries = await readdir(directory).catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return []; throw err; });
  const versions = await Promise.all(entries.map(async name => {
    const info = await stat(join(directory, name));
    const match = versionNamePattern.exec(name);
    return { id: name, timestamp: match ? Number(match[1]) : info.mtimeMs, size: info.size };
  }));
  return versions.sort((a, b) => b.timestamp - a.timestamp);
}

export async function restoreFileHistory(root: string, path: string, versionId: string) {
  if (!versionNamePattern.test(versionId)) throw Object.assign(new Error("版本标识无效"), { status: 400 });
  const source = join(historyDirectory(root, path), versionId);
  const info = await lstat(source).catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return null; throw err; });
  if (!info || !info.isFile()) throw Object.assign(new Error("历史版本不存在"), { status: 404 });
  const content = await readFile(source);
  await writeWorkspaceFileWithHistory(root, path, content, false);
}

/** 文件改名/移动后把历史目录一并挪走；best-effort，失败不影响本次改名。 */
export async function moveFileHistory(root: string, source: string, target: string) {
  const sourceDirectory = historyDirectory(root, source);
  const exists = await lstat(sourceDirectory).catch(() => null);
  if (!exists) return;
  const targetDirectory = historyDirectory(root, target);
  await mkdir(dirname(targetDirectory), { recursive: true }).catch(() => {});
  await rename(sourceDirectory, targetDirectory).catch(() => {});
}

/** 文件删除后清理对应历史目录；best-effort，失败不影响本次删除。 */
export async function removeFileHistoryTree(root: string, path: string) {
  await rm(historyDirectory(root, path), { recursive: true, force: true }).catch(() => {});
}
