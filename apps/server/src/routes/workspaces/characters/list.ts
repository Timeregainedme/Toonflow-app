import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Router } from "express";
import { z } from "zod";
import u from "@/utils";
import { validateFields } from "@/lib/middleware";
import { success } from "@/lib/responseFormat";

const router = Router();

function isCharacterProfile(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && typeof (value as Record<string, unknown>).id === "string"
    && typeof (value as Record<string, unknown>).name === "string" && Array.isArray((value as Record<string, unknown>).references);
}

export default router.get("/", validateFields({ directory: z.string().min(1).max(4096) }, "query"), async (req, res) => {
  const directory = await u.workspace.resolveWorkspace(req, req.query.directory as string);
  const charactersDirectory = join(directory, ".toonflow", "characters");
  const entries = await readdir(charactersDirectory).catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return []; throw err; });
  const characters = (await Promise.all(entries.filter(name => name.endsWith(".json")).map(async name => {
    // ACT: 单个角色档案损坏时跳过，不拖垮整个列表。
    try {
      const data: unknown = JSON.parse(await readFile(join(charactersDirectory, name), "utf8"));
      return isCharacterProfile(data) ? data : null;
    } catch { return null; }
  }))).filter(item => item !== null);
  res.set("Cache-Control", "no-store").json(success({ characters }));
});
