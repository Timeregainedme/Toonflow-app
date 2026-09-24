<template>
  <el-card v-if="visible" class="characterLibrary" shadow="never" :bodyStyle="{ padding: '8px' }" role="region" aria-label="角色库" @dblclick.stop>
    <div class="libraryToolbar">
      <el-input v-model="searchQuery" class="searchInput" :prefixIcon="IconSearch" placeholder="搜索角色" aria-label="搜索角色" clearable />
      <el-button class="toolbarButton" text :icon="IconUserPlus" title="新建角色" aria-label="新建角色" :disabled="creating" @click="createCharacter" />
      <el-button class="toolbarButton" text :icon="IconX" title="关闭角色库" aria-label="关闭角色库" @click="visible = false" />
    </div>
    <el-alert v-if="loadError" class="loadError" :title="loadError" type="error" :closable="false" showIcon />
    <el-scrollbar class="libraryScroll" maxHeight="min(440px, calc(100dvh - 198px))">
      <el-skeleton v-if="loading" :rows="3" animated />
      <el-empty v-else-if="!filteredCharacters.length" description="暂无角色" />
      <div v-else class="characterGrid">
        <div v-for="character in filteredCharacters" :key="character.id" class="characterCard" role="button" tabindex="0" :title="character.name" @click="editCharacter(character.id)" @keydown.enter="editCharacter(character.id)">
          <icon-user class="characterAvatar" :size="26" aria-hidden="true" />
          <span class="characterName">{{ character.name }}</span>
          <span class="characterCount">{{ character.references.length }} 张参考图</span>
          <el-button class="deleteButton" text type="danger" :icon="IconTrash" :aria-label="`删除 ${character.name}`" title="删除" @click.stop="removeCharacter(character)" />
        </div>
      </div>
    </el-scrollbar>
  </el-card>
  <characterEditor v-if="directory && editingId" v-model="editorVisible" :directory="directory" :characterId="editingId" @updated="loadCharacters" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { IconSearch, IconUser, IconUserPlus, IconTrash, IconX } from "@tabler/icons-vue";
import { useCharacters, type CharacterProfile } from "@/lib/characters";
import characterEditor from "./characterEditor.vue";

const props = defineProps<{ directory?: string }>();
const visible = defineModel<boolean>({ default: false });
const searchQuery = ref("");
const characters = ref<CharacterProfile[]>([]);
const loading = ref(false);
const loadError = ref("");
const creating = ref(false);
const editingId = ref("");
const editorVisible = ref(false);

const filteredCharacters = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return query ? characters.value.filter(item => item.name.toLowerCase().includes(query)) : characters.value;
});

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : "操作失败";
}

async function loadCharacters() {
  if (!props.directory) return;
  loading.value = true;
  loadError.value = "";
  try {
    characters.value = await useCharacters(props.directory).list();
  } catch (error) {
    loadError.value = errorMessage(error);
  } finally {
    loading.value = false;
  }
}

function editCharacter(id: string) {
  editingId.value = id;
  editorVisible.value = true;
}

async function createCharacter() {
  if (!props.directory || creating.value) return;
  let value: string;
  try {
    ({ value } = await ElMessageBox.prompt("为新角色输入名称", "新建角色", {
      inputValue: "新角色",
      inputValidator: name => !!name?.trim() || "请输入角色名称",
      confirmButtonText: "创建",
      cancelButtonText: "取消",
    }));
  } catch {
    return;
  }
  creating.value = true;
  try {
    const character = await useCharacters(props.directory).create({ name: value.trim() });
    characters.value = [...characters.value, character];
    editCharacter(character.id);
  } catch (error) {
    ElMessage.error(errorMessage(error));
  } finally {
    creating.value = false;
  }
}

async function removeCharacter(character: CharacterProfile) {
  if (!props.directory) return;
  try {
    await ElMessageBox.confirm(`确定删除角色“${character.name}”？其参考图也会一并删除，此操作不可撤销。`, "删除角色", { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" });
  } catch {
    return;
  }
  try {
    await useCharacters(props.directory).remove(character.id);
    characters.value = characters.value.filter(item => item.id !== character.id);
    ElMessage.success("角色已删除");
  } catch (error) {
    ElMessage.error(errorMessage(error));
  }
}

watch([visible, () => props.directory], ([opened]) => { if (opened) void loadCharacters(); });
</script>

<style scoped lang="scss">
.characterLibrary {
  width: min(320px, calc(100vw - 30px));
  max-height: calc(100dvh - 140px);

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    max-height: inherit;
    box-sizing: border-box;
  }

  .libraryToolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 8px;
    height: 32px;
    margin-bottom: 8px;

    .toolbarButton {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      margin: 0;
      padding: 0;
    }

    .searchInput {
      flex: 1;
      min-width: 0;
    }
  }

  .loadError {
    flex-shrink: 0;
    margin-bottom: 8px;
  }

  .libraryScroll {
    min-height: 0;
    max-height: 440px;
  }

  .characterGrid {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .characterCard {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: var(--el-border-radius-base);
    cursor: pointer;

    &:hover, &:focus-visible {
      background: var(--el-fill-color-light);
      .deleteButton { opacity: 1; }
    }

    .characterAvatar {
      flex-shrink: 0;
      color: var(--el-text-color-secondary);
    }

    .characterName {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--el-font-size-base);
    }

    .characterCount {
      flex-shrink: 0;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    .deleteButton {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      margin: 0;
      padding: 0;
      opacity: 0;
    }
  }
}
</style>
