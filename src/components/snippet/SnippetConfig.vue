<template>
  <div class="snippet-config">
    <div v-if="!snippetConfig" class="config-empty">
      <p>请先选择一个片段</p>
    </div>
    <template v-else>
      <!-- 片段基本信息 -->
      <div class="snippet-meta">
        <div class="meta-row">
          <span class="meta-label">版本</span>
          <el-tag size="small">{{ snippetMeta?.version || '-' }}</el-tag>
        </div>
        <div class="meta-row">
          <span class="meta-label">描述</span>
          <span class="meta-desc">{{ snippetMeta?.description || '-' }}</span>
        </div>
      </div>

      <!-- 留白距离 -->
      <div class="config-section">
        <h4 class="section-title">留白距离</h4>
        <SpacingEditor v-model="properties.spacing" />
      </div>

      <!-- 占位符标识 -->
      <div class="config-section">
        <h4 class="section-title">占位符标识</h4>
        <PlaceholderSelector
          v-model="properties.placeholder"
          :placeholder-names="placeholderNames"
          placeholder="选择或输入 placeholder:xxx"
        />
      </div>

      <!-- CSS 类名 -->
      <div class="config-section">
        <h4 class="section-title">CSS 类名</h4>
        <ClassNameInput
          v-model="properties.className"
          placeholder="输入 CSS 类名"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SnippetConfig, SnippetMeta, Spacing } from '@/types'
import SpacingEditor from './SpacingEditor.vue'
import PlaceholderSelector from './PlaceholderSelector.vue'
import ClassNameInput from './ClassNameInput.vue'

const props = defineProps<{
  snippetConfig: SnippetConfig | null
  snippetMeta: SnippetMeta | null
  properties: {
    spacing: Spacing
    placeholder: string
    className: string
  }
  placeholderNames: string[]
}>()

const emit = defineEmits<{
  'update:properties': [value: { spacing: Spacing; placeholder: string; className: string }]
}>()

const properties = computed({
  get: () => props.properties,
  set: (val) => emit('update:properties', val),
})
</script>

<style scoped>
.config-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.snippet-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}

.meta-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.config-section {
  margin-bottom: 18px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
</style>
