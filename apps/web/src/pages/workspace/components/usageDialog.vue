<template>
  <el-dialog v-model="visible" title="用量统计" width="min(760px, 94vw)" alignCenter appendToBody destroyOnClose>
    <el-alert v-if="loadError" class="loadError" :title="loadError" type="error" :closable="false" showIcon />
    <el-skeleton v-else-if="loadingSummary" :rows="3" animated />
    <template v-else-if="summary">
      <div class="overview">
        <div class="metric">
          <el-text size="small" type="info">总生成次数</el-text>
          <span>{{ summary.totalCount }}</span>
        </div>
        <div class="metric">
          <el-text size="small" type="info">成功 / 失败</el-text>
          <span>{{ summary.successCount }} / {{ summary.failureCount }}</span>
        </div>
        <div class="metric">
          <el-text size="small" type="info">合计花费</el-text>
          <span v-if="costEntries.length">{{ costEntries.map(([currency, amount]) => `${currency} ${amount.toFixed(2)}`).join("、") }}</span>
          <span v-else>—</span>
        </div>
      </div>
      <el-text v-if="hasMissingCost" size="small" type="info" class="costHint">部分供应商未提供花费数据，以上金额可能不完整</el-text>

      <el-text tag="strong" size="small" class="sectionTitle">按供应商 / 模型</el-text>
      <el-table :data="summary.byProvider" size="small" maxHeight="220px" aria-label="按供应商模型统计">
        <el-table-column label="供应商" prop="providerLabel" minWidth="120" showOverflowTooltip />
        <el-table-column label="模型" prop="modelLabel" minWidth="140" showOverflowTooltip />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">{{ mediaTypeLabels[row.mediaType as MediaType] }}</template>
        </el-table-column>
        <el-table-column label="次数" prop="count" width="80" />
        <el-table-column label="成功率" width="90">
          <template #default="{ row }">{{ row.count ? Math.round((row.successCount / row.count) * 100) : 0 }}%</template>
        </el-table-column>
        <el-table-column label="花费" minWidth="120">
          <template #default="{ row }">{{ formatCost(row.cost) }}</template>
        </el-table-column>
      </el-table>

      <el-text tag="strong" size="small" class="sectionTitle">生成记录</el-text>
      <el-skeleton v-if="loadingList" :rows="4" animated />
      <el-empty v-else-if="!records.length" description="该项目还没有生成记录" />
      <template v-else>
        <el-table :data="records" size="small" maxHeight="260px" aria-label="生成记录明细">
          <el-table-column label="时间" minWidth="150">
            <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
          </el-table-column>
          <el-table-column label="供应商 · 模型" minWidth="160" showOverflowTooltip>
            <template #default="{ row }">{{ row.providerLabel }} · {{ row.modelLabel }}</template>
          </el-table-column>
          <el-table-column label="类型" width="70">
            <template #default="{ row }">{{ mediaTypeLabels[row.mediaType as MediaType] }}</template>
          </el-table-column>
          <el-table-column label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'" size="small" disableTransitions>{{ row.success ? "成功" : "失败" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="耗时" width="80">
            <template #default="{ row }">{{ (row.durationMs / 1000).toFixed(1) }}s</template>
          </el-table-column>
          <el-table-column label="花费" minWidth="100">
            <template #default="{ row }">{{ row.cost ? `${row.cost.currency} ${row.cost.amount.toFixed(2)}` : "—" }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          small
          layout="prev, pager, next"
          :currentPage="page"
          :pageSize="pageSize"
          :total="total"
          @update:currentPage="page = $event" />
      </template>
    </template>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";

type MediaType = "image" | "video" | "audio";
type CostAmount = { amount: number; currency: string };
type UsageRecord = {
  timestamp: number; providerId: string; providerLabel: string; modelId: string; modelLabel: string;
  mediaType: MediaType; success: boolean; errorMessage?: string; durationMs: number; outputCount?: number;
  cost?: CostAmount; balanceAfter?: CostAmount;
};
type ProviderSummary = { providerId: string; providerLabel: string; modelId: string; modelLabel: string; mediaType: MediaType; count: number; successCount: number; cost: Record<string, number> };
type UsageSummary = { totalCount: number; successCount: number; failureCount: number; totalCost: Record<string, number>; byProvider: ProviderSummary[] };

const props = defineProps<{ directory: string }>();
const visible = defineModel<boolean>({ default: false });
const mediaTypeLabels: Record<MediaType, string> = { image: "图片", video: "视频", audio: "音频" };

const summary = ref<UsageSummary>();
const records = ref<UsageRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loadingSummary = ref(false);
const loadingList = ref(false);
const loadError = ref("");

const costEntries = computed(() => Object.entries(summary.value?.totalCost ?? {}));
const hasMissingCost = computed(() => (summary.value?.totalCount ?? 0) > 0 && summary.value?.byProvider.some(item => !Object.keys(item.cost).length));

function formatCost(cost: Record<string, number>) {
  const entries = Object.entries(cost);
  return entries.length ? entries.map(([currency, amount]) => `${currency} ${amount.toFixed(2)}`).join("、") : "—";
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
}

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : "加载失败";
}

async function loadSummary() {
  loadingSummary.value = true;
  loadError.value = "";
  try {
    const { data } = await axios.get<{ data: UsageSummary }>("/api/workspaces/usage/summary", { params: { directory: props.directory } });
    summary.value = data.data;
  } catch (error) {
    loadError.value = errorMessage(error);
  } finally {
    loadingSummary.value = false;
  }
}

async function loadList() {
  loadingList.value = true;
  try {
    const { data } = await axios.get<{ data: { total: number; items: UsageRecord[] } }>("/api/workspaces/usage/list", { params: { directory: props.directory, page: page.value, pageSize } });
    records.value = data.data.items;
    total.value = data.data.total;
  } catch (error) {
    loadError.value = errorMessage(error);
  } finally {
    loadingList.value = false;
  }
}

watch(visible, value => { if (value) { page.value = 1; void loadSummary(); void loadList(); } });
watch(page, () => { if (visible.value) void loadList(); });
</script>

<style scoped lang="scss">
.loadError {
  margin-bottom: 12px;
}

.overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px 20px;
  margin-bottom: 8px;

  .metric {
    display: grid;
    justify-items: start;
    gap: 4px;
    font-size: 15px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
}

.costHint {
  display: block;
  margin-bottom: 12px;
}

.sectionTitle {
  display: block;
  margin: 12px 0 8px;
}

.pagination {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
