<template>
  <div v-if="characters.length || selected.length" class="characterPicker nodrag">
    <span v-for="character in selectedCharacters" :key="character.id" class="characterChip">
      <icon-user :size="14" aria-hidden="true" />
      <span class="chipName">{{ character.name }}</span>
      <button type="button" class="chipRemove" :disabled="disabled" :aria-label="`移除角色 ${character.name}`" @click="toggle(character.id)">
        <icon-x :size="12" aria-hidden="true" />
      </button>
    </span>
    <el-popover v-model:visible="popoverVisible" trigger="click" placement="bottom-start" :width="220" :showArrow="false" :disabled="disabled || !characters.length">
      <template #reference>
        <button type="button" class="addButton" :disabled="disabled || !characters.length" :aria-label="characters.length ? '选择角色' : '暂无可选角色'" :title="characters.length ? '选择角色' : '暂无可选角色，请先在角色库创建'">
          <icon-plus :size="14" aria-hidden="true" />
        </button>
      </template>
      <div class="characterMenu">
        <button
          v-for="character in characters"
          :key="character.id"
          type="button"
          class="characterOption"
          :aria-pressed="selected.includes(character.id)"
          @click="toggle(character.id)">
          <icon-user :size="16" aria-hidden="true" />
          <span class="optionName">{{ character.name }}</span>
          <icon-check v-if="selected.includes(character.id)" :size="16" aria-hidden="true" />
        </button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IconCheck, IconPlus, IconUser, IconX } from "@tabler/icons-vue";
import type { NodeCharacter } from "../nodeCharacters";

const props = defineProps<{ characters: NodeCharacter[]; disabled?: boolean }>();
const selected = defineModel<string[]>({ default: () => [] });
const popoverVisible = ref(false);
const selectedCharacters = computed(() => selected.value.flatMap(id => {
  const character = props.characters.find(item => item.id === id);
  return character ? [character] : [];
}));

function toggle(id: string) {
  if (props.disabled) return;
  selected.value = selected.value.includes(id) ? selected.value.filter(item => item !== id) : [...selected.value, id];
}
</script>

<style scoped lang="scss">
.characterPicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;

  .characterChip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 4px 3px 8px;
    border-radius: var(--el-border-radius-round);
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    font-size: 12px;

    .chipName {
      max-width: 96px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chipRemove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      cursor: pointer;

      &:hover { background: var(--el-fill-color); }
    }
  }

  .addButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    background: transparent;
    color: var(--el-text-color-secondary);
    cursor: pointer;

    &:hover { color: var(--el-color-primary); border-color: var(--el-color-primary); }
    &:disabled { cursor: not-allowed; opacity: 0.5; }
  }
}

.characterMenu {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;

  .characterOption {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 0;
    border-radius: var(--el-border-radius-base);
    background: transparent;
    color: var(--el-text-color-primary);
    text-align: left;
    cursor: pointer;

    &:hover { background: var(--el-fill-color-light); }

    .optionName {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
