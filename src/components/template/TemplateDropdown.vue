<template>
  <div class="template-dropdown">
    <el-select
      :model-value="modelValue"
      placeholder="选择页面模板"
      size="large"
      style="width: 100%;"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <el-option
        v-for="tpl in templates"
        :key="tpl.folder"
        :label="tpl.name"
        :value="tpl.folder"
      >
        <div class="template-option">
          <span class="template-option-name">{{ tpl.name }}</span>
          <span class="template-option-version">v{{ tpl.version }}</span>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import type { TemplateMeta } from '@/types'

defineProps<{
  templates: TemplateMeta[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.template-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.template-option-name {
  font-weight: 500;
}

.template-option-version {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 8px;
}
</style>
