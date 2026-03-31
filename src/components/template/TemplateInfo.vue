<template>
  <div class="template-info">
    <div v-if="template" class="info-panel">
      <div class="info-row">
        <span class="info-label">版本</span>
        <el-tag size="small" type="info">{{ template.version }}</el-tag>
      </div>
      <div class="info-row">
        <span class="info-label">描述</span>
        <p class="info-desc">{{ template.description }}</p>
      </div>
      <div v-if="template.thumbnail" class="info-row">
        <span class="info-label">预览图</span>
        <el-image
          :src="thumbnailUrl"
          fit="contain"
          class="template-thumbnail"
          :preview-src-list="[thumbnailUrl]"
          preview-teleported
        />
      </div>
      <div v-if="placeholders.length > 0" class="info-row">
        <span class="info-label">占位区域</span>
        <div class="placeholder-tags">
          <el-tag
            v-for="p in placeholders"
            :key="p.name"
            size="small"
            effect="plain"
          >
            {{ p.name }}
          </el-tag>
        </div>
      </div>
    </div>
    <div v-else class="info-empty">
      <p class="empty-text">请先选择一个模板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateMeta, Placeholder } from '@/types'

const props = defineProps<{
  template: TemplateMeta | null
  placeholders: Placeholder[]
}>()

const base = import.meta.env.BASE_URL || './'
const thumbnailUrl = computed(() => {
  if (!props.template?.thumbnail) return ''
  return `${base}template/pages/${props.template.thumbnail}`
})
</script>

<style scoped>
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.template-thumbnail {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.placeholder-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-text {
  color: var(--text-muted);
  font-size: 14px;
}
</style>
