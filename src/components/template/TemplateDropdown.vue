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
            <div class="template-info">
              <span class="template-option-name">{{ tpl.name }}</span>
              <span class="template-option-version">v{{ tpl.version }}</span>
              <p class="template-option-desc">{{ tpl.description }}</p>
            </div>
          </div>
        </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import type { TemplateMeta } from '@/types'

// 获取缩略图URL（保留函数供其他地方使用）
function getThumbnailUrl(thumbnailPath: string): string {
  if (!thumbnailPath) return ''
  // 如果已经是完整URL，直接返回
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return thumbnailPath
  }
  // 否则从public目录加载
  return `/template/pages/${thumbnailPath}`
}

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
  width: 100%;
}

.template-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.template-option-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.template-option-version {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.template-option-desc {
  font-size: 12px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  margin: 0;
}
</style>