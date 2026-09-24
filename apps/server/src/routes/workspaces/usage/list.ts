import { Router } from "express";
import { z } from "zod";
import u from "@/utils";
import { validateFields } from "@/lib/middleware";
import { success } from "@/lib/responseFormat";

const router = Router();

export default router.get("/", validateFields({
  directory: z.string().min(1).max(4096),
  page: z.string().regex(/^[1-9]\d*$/).optional(),
  pageSize: z.string().regex(/^[1-9]\d*$/).optional(),
}, "query"), async (req, res) => {
  const directory = await u.workspace.resolveWorkspace(req, req.query.directory as string);
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 20));
  const result = await u.usage.listUsagePage(directory, page, pageSize);
  res.set("Cache-Control", "no-store").json(success(result));
});
