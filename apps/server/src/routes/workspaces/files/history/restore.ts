import { Router } from "express";
import { z } from "zod";
import u from "@/utils";
import { validateFields } from "@/lib/middleware";
import { success } from "@/lib/responseFormat";

const router = Router();

export default router.post("/", validateFields({
  directory: z.string().min(1).max(4096), path: z.string().min(1).max(4096),
  versionId: z.string().min(1).max(300),
}), async (req, res) => {
  const { directory, path } = await u.workspaceFile.resolveWorkspaceFile(req, req.body.directory, req.body.path);
  u.workspaceFile.protectWorkspaceRoot(directory, path);
  const release = u.workspaceFile.lockWorkspaceFiles([path]);
  try { await u.fileHistory.restoreFileHistory(directory, path, req.body.versionId); }
  finally { release(); }
  res.json(success());
});
