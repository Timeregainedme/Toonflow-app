<template>
  <div class="workspaceMenu">
    <el-card shadow="never" :bodyStyle="{ padding: '5px 10px' }">
      <div class="menuContent">
        <el-button class="toolButton" text aria-label="退出项目" title="退出项目" @click="exitVisible = true">
          <icon-x :size="17" aria-hidden="true" />
        </el-button>
        <el-button class="toolButton" text :disabled="!directory" aria-label="用量统计" title="用量统计" @click="openUsage">
          <icon-report-money :size="17" aria-hidden="true" />
        </el-button>
        <el-button class="toolButton" text :aria-label="hasDesktopUpdate ? '设置，有新版本可用' : '设置'" title="设置" @click="emit('openSettings')">
          <el-badge isDot :hidden="!hasDesktopUpdate">
            <icon-settings :size="17" aria-hidden="true" />
          </el-badge>
        </el-button>
      </div>
    </el-card>
    <el-dialog v-model="exitVisible" title="退出项目" width="360px" alignCenter appendToBody>
      <span>是否退出当前项目并返回首页？</span>
      <template #footer>
        <el-button @click="exitVisible = false">取消</el-button>
        <el-button type="primary" :loading="leaving" @click="exitProject">退出项目</el-button>
      </template>
    </el-dialog>
    <component :is="usageDialog" v-if="directory" v-model="usageVisible" :directory="directory" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, shallowRef, type Component } from "vue";
import { useRouter } from "vue-router";
import { IconX, IconSettings, IconReportMoney } from "@tabler/icons-vue";
import { hasDesktopUpdate } from "@/stores/desktopUpdate";
import { useWorkspaceStore } from "@/stores/workspace";

const emit = defineEmits<{ openSettings: [] }>();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const directory = computed(() => workspaceStore.project?.directory);
const exitVisible = ref(false);
const leaving = ref(false);
const usageVisible = ref(false);
const usageDialog = shallowRef<Component>();

function openUsage() {
  if (!directory.value) return;
  usageDialog.value ??= defineAsyncComponent(() => import("./usageDialog.vue"));
  usageVisible.value = true;
}

async function exitProject() {
  if (leaving.value) return;
  leaving.value = true;
  try {
    await router.push("/home");
  } finally {
    leaving.value = false;
  }
}
</script>

<style scoped lang="scss">
.workspaceMenu {
  .menuContent {
    display: flex;
    align-items: center;
    gap: 10px;

    .toolButton {
      width: 28px;
      height: 28px;
      margin: 0;
      padding: 0;
    }
  }
}
</style>
