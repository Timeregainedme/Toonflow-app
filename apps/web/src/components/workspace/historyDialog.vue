<template>
  <el-dialog v-model="visible" title="版本历史" width="min(560px, 94vw)" alignCenter appendToBody destroyOnClose>
    <el-alert v-if="loadError" class="loadError" :title="loadError" type="error" :closable="false" showIcon />
    <el-skeleton v-else-if="loading" :rows="4" animated />
    <el-empty v-else-if="!versions.length" description="暂无历史版本" />
    <el-table v-else :data="versions" rowKey="id" maxHeight="360px" aria-label="历史版本列表">
      <el-table-column label="时间" minWidth="160">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="大小" width="100">
        <template #default="{ row }">{{ formatBytes(row.size) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="110" align="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" :loading="restoringId === row.id" :disabled="!!restoringId" @click="restore(row.id)">恢复此版本</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import useWorkspaceFiles from "@/lib/workspaceFiles";

const props = defineProps<{ directory: string; path: string }>();
const visible = defineModel<boolean>({ default: false });
const emit = defineEmits<{ restored: [] }>();

type HistoryVersion = { id: string; timestamp: number; size: number };
const versions = ref<HistoryVersion[]>([]);
const loading = ref(false);
const loadError = ref("");
const restoringId = ref("");

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : "操作失败";
}

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    versions.value = await useWorkspaceFiles(props.directory).listHistory(props.path);
  } catch (error) {
    loadError.value = errorMessage(error);
  } finally {
    loading.value = false;
  }
}

async function restore(versionId: string) {
  if (restoringId.value) return;
  try {
    await ElMessageBox.confirm("恢复后会自动保留当前版本，可再次撤销。是否恢复到这个历史版本？", "恢复历史版本", { confirmButtonText: "恢复", cancelButtonText: "取消", type: "warning" });
  } catch {
    return;
  }
  restoringId.value = versionId;
  try {
    await useWorkspaceFiles(props.directory).restoreHistory(props.path, versionId);
    ElMessage.success("已恢复到所选版本");
    emit("restored");
    await load();
  } catch (error) {
    ElMessage.error(errorMessage(error));
  } finally {
    restoringId.value = "";
  }
}

watch(visible, value => { if (value) load(); });
</script>

<style scoped lang="scss">
.loadError {
  margin-bottom: 12px;
}
</style>
