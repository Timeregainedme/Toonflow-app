import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { lockWorkspaceFiles } from "@/utils/workspace/files";

interface UsageAmount { amount: number; currency: string }

export interface UsageRecord {
  timestamp: number;
  providerId: string;
  providerLabel: string;
  modelId: string;
  modelLabel: string;
  mediaType: "image" | "video" | "audio";
  success: boolean;
  errorMessage?: string;
  durationMs: number;
  outputCount?: number;
  cost?: UsageAmount;
  balanceAfter?: UsageAmount;
}

function usageLogPath(root: string) {
  return join(root, ".toonflow", "usage", "log.jsonl");
}

export async function recordUsage(root: string, record: UsageRecord) {
  const path = usageLogPath(root);
  await mkdir(join(root, ".toonflow", "usage"), { recursive: true });
  const release = lockWorkspaceFiles([path]);
  try { await appendFile(path, `${JSON.stringify(record)}\n`); }
  finally { release(); }
}

export async function readUsageLog(root: string): Promise<UsageRecord[]> {
  const text = await readFile(usageLogPath(root), "utf8").catch((err: NodeJS.ErrnoException) => { if (err.code === "ENOENT") return ""; throw err; });
  const records: UsageRecord[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    // ACT: 单行损坏时跳过，不让一条坏记录拖垮整份用量日志。
    try { records.push(JSON.parse(line) as UsageRecord); } catch { /* 跳过无法解析的行 */ }
  }
  return records;
}

export async function summarizeUsage(root: string) {
  const records = await readUsageLog(root);
  const totalCost: Record<string, number> = {};
  const groups = new Map<string, { providerId: string; providerLabel: string; modelId: string; modelLabel: string; mediaType: UsageRecord["mediaType"]; count: number; successCount: number; cost: Record<string, number> }>();
  let successCount = 0;
  for (const record of records) {
    if (record.success) successCount++;
    if (record.cost) totalCost[record.cost.currency] = (totalCost[record.cost.currency] ?? 0) + record.cost.amount;
    const key = `${record.providerId}\u0000${record.modelId}\u0000${record.mediaType}`;
    let group = groups.get(key);
    if (!group) {
      group = { providerId: record.providerId, providerLabel: record.providerLabel, modelId: record.modelId, modelLabel: record.modelLabel, mediaType: record.mediaType, count: 0, successCount: 0, cost: {} };
      groups.set(key, group);
    }
    group.count++;
    if (record.success) group.successCount++;
    if (record.cost) group.cost[record.cost.currency] = (group.cost[record.cost.currency] ?? 0) + record.cost.amount;
  }
  return {
    totalCount: records.length,
    successCount,
    failureCount: records.length - successCount,
    totalCost,
    byProvider: [...groups.values()],
  };
}

export async function listUsagePage(root: string, page: number, pageSize: number) {
  const records = (await readUsageLog(root)).sort((a, b) => b.timestamp - a.timestamp);
  const start = (page - 1) * pageSize;
  return { total: records.length, items: records.slice(start, start + pageSize) };
}
