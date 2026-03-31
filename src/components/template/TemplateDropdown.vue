<template>
  <div class="template-dropdown">
    <el-select
      :model-value="modelValue"
      placeholder="选择页面模板"
      size="large"
      style="width: 100%;"
      filterable
      :filter-method="handleFilter"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <el-option
        v-for="tpl in filteredTemplates"
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
import { ref, computed } from 'vue'
import type { TemplateMeta } from '@/types'

const props = defineProps<{
  templates: TemplateMeta[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const filterText = ref('')

const handleFilter = (value: string) => {
  filterText.value = value
}

const filteredTemplates = computed(() => {
  if (!filterText.value) return props.templates
  const keyword = filterText.value.toLowerCase()
  return props.templates.filter(t => t.name.toLowerCase().includes(keyword))
})
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