<template>
  <div class="snippet-add-dialog">
    <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:modelValue', $event)"
      title="添加片段"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="snippet-grid">
        <div
          v-for="snippet in availableSnippets"
          :key="snippet.folder"
          class="snippet-card"
          :class="{ selected: selectedFolder === snippet.folder }"
          @click="selectedFolder = snippet.folder"
        >
          <div class="card-body">
            <h4 class="card-name">{{ snippet.name }}</h4>
            <span class="card-version">v{{ snippet.version }}</span>
            <p class="card-desc">{{ snippet.description }}</p>
            <div class="card-tags">
              <el-tag v-for="tag in snippet.tags" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="card-preview">
            <div v-if="selectedFolder === snippet.folder && previewHtml" class="preview-area">
              <iframe :srcdoc="previewHtml" class="preview-iframe" sandbox="allow-same-origin" />
            </div>
            <div v-else class="preview-placeholder">
              <Eye :size="24" />
              <span>点击查看预览</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedFolder"
          class="confirm-btn"
          @click="onConfirm"
        >
          添加片段
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye } from 'lucide-vue-next'
import type { SnippetMeta } from '@/types'
import { useSnippetStore } from '@/stores/snippet'
import { compileTemplate, resolveSnippetData } from '@/engines/template-engine'
import { buildSnippetPreviewHtml } from '@/engines/preview-renderer'

const props = defineProps<{
  modelValue?: boolean
  snippets: SnippetMeta[]
  existingIds: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: [folder: string]
}>()

const visible = computed({
  get: () => props.modelValue ?? false,
  set: (val: boolean) => emit('update:modelValue', val)
})

const snippetStore = useSnippetStore()
const selectedFolder = ref<string>('')
const previewHtml = ref('')

const availableSnippets = computed(() => {
  return props.snippets.filter(s => !props.existingIds.includes(s.folder))
})

watch(selectedFolder, async (folder) => {
  if (!folder) {
    previewHtml.value = ''
    return
  }
  const config = await snippetStore.loadSnippetDetail(folder)
  const html = snippetStore.getSnippetHtml(folder)
  if (config && html) {
    const data = resolveSnippetData({}, config.sampleData)
    let compiled = html
    try {
      if (config.formSchema.type === 'array') {
        compiled = compileTemplate(html, { features: Array.isArray(data) ? data : [] })
      } else {
        compiled = compileTemplate(html, { ...(data as Record<string, any>) })
      }
    } catch (e) {
      console.error('Preview compile error:', e)
    }
    previewHtml.value = buildSnippetPreviewHtml(compiled)
  }
})

function onConfirm() {
  if (selectedFolder.value) {
    emit('add', selectedFolder.value)
    selectedFolder.value = ''
    previewHtml.value = ''
    visible.value = false
  }
}
</script>

<style scoped>
.snippet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  max-height: 55vh;
  overflow-y: auto;
  padding: 4px;
}

.snippet-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.snippet-card:hover {
  border-color: var(--primary);
}

.snippet-card.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
}

.card-body {
  padding: 14px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: inline;
}

.card-version {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 8px;
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.card-preview {
  height: 180px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.preview-area {
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 6px;
  font-size: 13px;
  opacity: 0.6;
}

.confirm-btn {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  border-color: #0284C7;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #0EA5E9, #0369A1);
}
</style>
