<template>
  <div class="snippet-add-dialog">
    <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:modelValue', $event)"
      title="添加片段"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="selection-summary" v-if="selectedFolders.length > 0">
        <span>已选择 {{ selectedFolders.length }} 个片段：</span>
        <div class="selected-tags">
          <el-tag
            v-for="(folder, index) in selectedFolders"
            :key="folder"
            closable
            @close="removeSelection(folder)"
            class="selection-tag"
          >
            {{ index + 1 }}. {{ getSnippetName(folder) }}
          </el-tag>
        </div>
      </div>

      <div class="snippet-grid">
        <div
          v-for="(snippet, index) in availableSnippets"
          :key="snippet.folder"
          class="snippet-card"
          :class="{ selected: selectedFolders.includes(snippet.folder) }"
          @click="toggleSelection(snippet.folder)"
        >
          <div class="card-order" v-if="selectedFolders.includes(snippet.folder)">
            {{ selectedFolders.indexOf(snippet.folder) + 1 }}
          </div>
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
            <div v-if="previewFolder === snippet.folder && previewHtml" class="preview-area">
              <iframe :srcdoc="previewHtml" class="preview-iframe" sandbox="allow-same-origin" />
            </div>
            <div v-else class="preview-placeholder" @mouseenter="loadPreview(snippet.folder)">
              <Eye :size="24" />
              <span>点击选择</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="selectedFolders.length === 0"
            class="confirm-btn"
            @click="onConfirm"
          >
            添加 {{ selectedFolders.length }} 个片段
          </el-button>
        </div>
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
  add: [folders: string[]]
}>()

const visible = computed({
  get: () => props.modelValue ?? false,
  set: (val: boolean) => emit('update:modelValue', val)
})

const snippetStore = useSnippetStore()
const selectedFolders = ref<string[]>([])
const previewFolder = ref<string>('')
const previewHtml = ref('')

const availableSnippets = computed(() => {
  return props.snippets
})

function getSnippetName(folder: string): string {
  const snippet = props.snippets.find(s => s.folder === folder)
  return snippet?.name || folder
}

function toggleSelection(folder: string) {
  const index = selectedFolders.value.indexOf(folder)
  if (index === -1) {
    selectedFolders.value.push(folder)
  } else {
    selectedFolders.value.splice(index, 1)
  }
}

function removeSelection(folder: string) {
  const index = selectedFolders.value.indexOf(folder)
  if (index !== -1) {
    selectedFolders.value.splice(index, 1)
  }
}

async function loadPreview(folder: string) {
  if (previewFolder.value === folder) return

  previewFolder.value = folder
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
}

function onConfirm() {
  if (selectedFolders.value.length > 0) {
    emit('add', [...selectedFolders.value])
    selectedFolders.value = []
    previewFolder.value = ''
    previewHtml.value = ''
    visible.value = false
  }
}

// 重置选择状态
watch(visible, (val) => {
  if (!val) {
    selectedFolders.value = []
    previewFolder.value = ''
    previewHtml.value = ''
  }
})
</script>

<style scoped>
.selection-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 14px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selection-tag {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(2, 132, 199, 0.15));
  border-color: var(--primary);
}

.snippet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  max-height: 55vh;
  overflow-y: auto;
  padding: 4px;
}

.snippet-card {
  position: relative;
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

.card-order {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
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
  height: 160px;
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
  cursor: pointer;
}

.preview-placeholder:hover {
  opacity: 1;
  background: rgba(56, 189, 248, 0.05);
}

.confirm-btn {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  border-color: #0284C7;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #0EA5E9, #0369A1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>