<template>
  <el-dialog v-model="visible" title="编辑角色" width="min(560px, 94vw)" alignCenter appendToBody destroyOnClose>
    <el-alert v-if="loadError" class="loadError" :title="loadError" type="error" :closable="false" showIcon />
    <el-form labelPosition="top" @submit.prevent>
      <el-form-item label="角色名称">
        <el-input v-model="name" maxlength="120" aria-label="角色名称" @blur="saveField('name')" />
      </el-form-item>
      <el-form-item label="外观 / 性格描述（可选）">
        <el-input v-model="description" type="textarea" :rows="2" aria-label="角色描述" @blur="saveField('description')" />
      </el-form-item>
    </el-form>
    <div v-for="group in purposeGroups" :key="group.purpose" class="referenceGroup">
      <div class="groupHeader">
        <span>{{ group.label }}</span>
        <el-button text size="small" :icon="IconUpload" :loading="uploadingPurpose === group.purpose" @click="pickFile(group.purpose)">上传</el-button>
      </div>
      <div class="referenceList">
        <span v-if="!group.items.length" class="emptyHint">未上传</span>
        <div v-for="reference in group.items" :key="reference.id" class="referenceChip">
          <span class="referenceName" :title="reference.path">{{ reference.path.split('/').pop() }}</span>
          <el-button text size="small" type="danger" :icon="IconTrash" :aria-label="`删除 ${reference.path}`" :disabled="removingId === reference.id" @click="deleteReference(reference.id)" />
        </div>
      </div>
    </div>
    <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelected" />
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { IconTrash, IconUpload } from "@tabler/icons-vue";
import { useCharacters, type CharacterProfile, type CharacterReferencePurpose } from "@/lib/characters";

const props = defineProps<{ directory: string; characterId: string }>();
const visible = defineModel<boolean>({ default: false });
const emit = defineEmits<{ updated: [] }>();

const purposeLabels: Record<CharacterReferencePurpose, string> = { front: "正面", side: "侧面", back: "背面", expression: "表情特写", other: "其它" };
const purposeOrder: CharacterReferencePurpose[] = ["front", "side", "back", "expression", "other"];

const character = ref<CharacterProfile>();
const name = ref("");
const description = ref("");
const loadError = ref("");
const uploadingPurpose = ref<CharacterReferencePurpose>();
const removingId = ref("");
const fileInput = ref<HTMLInputElement>();
let pendingPurpose: CharacterReferencePurpose = "other";

const purposeGroups = computed(() => purposeOrder.map(purpose => ({
  purpose, label: purposeLabels[purpose],
  items: character.value?.references.filter(reference => reference.purpose === purpose) ?? [],
})));

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : "操作失败";
}

async function load() {
  loadError.value = "";
  try {
    character.value = await useCharacters(props.directory).read(props.characterId);
    name.value = character.value.name;
    description.value = character.value.description ?? "";
  } catch (error) {
    loadError.value = errorMessage(error);
  }
}

async function saveField(field: "name" | "description") {
  if (!character.value) return;
  const value = field === "name" ? name.value.trim() : description.value.trim();
  const current = field === "name" ? character.value.name : character.value.description ?? "";
  if (field === "name" && !value) { name.value = character.value.name; return; }
  if (current === value) return;
  try {
    character.value = await useCharacters(props.directory).update(props.characterId, { [field]: value || undefined });
    emit("updated");
  } catch (error) {
    ElMessage.error(errorMessage(error));
  }
}

function pickFile(purpose: CharacterReferencePurpose) {
  pendingPurpose = purpose;
  fileInput.value?.click();
}

async function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || !character.value) return;
  uploadingPurpose.value = pendingPurpose;
  try {
    await useCharacters(props.directory).addReference(props.characterId, file, pendingPurpose);
    await load();
    emit("updated");
  } catch (error) {
    ElMessage.error(errorMessage(error));
  } finally {
    uploadingPurpose.value = undefined;
  }
}

async function deleteReference(referenceId: string) {
  if (!character.value) return;
  removingId.value = referenceId;
  try {
    character.value = await useCharacters(props.directory).removeReference(props.characterId, referenceId);
    emit("updated");
  } catch (error) {
    ElMessage.error(errorMessage(error));
  } finally {
    removingId.value = "";
  }
}

watch([visible, () => props.characterId], ([opened]) => { if (opened) void load(); });
</script>

<style scoped lang="scss">
.loadError {
  margin-bottom: 12px;
}

.referenceGroup {
  margin-bottom: 14px;

  .groupHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-regular);
  }

  .referenceList {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .emptyHint {
      color: var(--el-text-color-placeholder);
      font-size: 12px;
    }

    .referenceChip {
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 200px;
      padding: 2px 4px 2px 8px;
      border-radius: var(--el-border-radius-base);
      background: var(--el-fill-color-light);

      .referenceName {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }
    }
  }
}
</style>
