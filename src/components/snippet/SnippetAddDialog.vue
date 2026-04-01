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
          v-for="snippet in availableSnippets"
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
              <iframe :srcdoc="previewHtml" class="preview-iframe" sandbox="allow-modals allow-scripts allow-same-origin" />
            </div>
            <div v-else class="preview-placeholder" @mouseenter="loadPreview(snippet.folder)">
              <Eye :size="24" />
              <span>点击选择</span>
            </div>
            <button
              v-if="templateFolder"
              class="card-preview-btn"
              title="在模板中预览此片段"
              @click.stop="openTemplatePreview(snippet.folder)"
            >
              <Eye :size="14" />
              <span>模板预览</span>
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button
            v-if="templateFolder"
            type="success"
            :disabled="selectedFolders.length === 0"
            class="preview-all-btn"
            :loading="previewAllLoading"
            @click="openSelectedPreview"
          >
            <Eye :size="16" />
            预览效果
          </el-button>
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

    <!-- 模板预览对话框 -->
    <PreviewDialog
      v-model="showTemplatePreview"
      :srcdoc="templatePreviewSrcdoc"
      title="模板预览"
      height="75vh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye } from 'lucide-vue-next'
import type { SnippetMeta } from '@/types'
import { useSnippetStore } from '@/stores/snippet'
import { compileSnippetByType } from '@/composables/use-preview'
import { buildSnippetPreviewHtml } from '@/engines/preview-renderer'
import { usePreview } from '@/composables/use-preview'
import PreviewDialog from '@/components/preview/PreviewDialog.vue'

const props = defineProps<{
  modelValue?: boolean
  snippets: SnippetMeta[]
  existingIds: string[]
  templateFolder?: string
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
const { generateSnippetPreviewHtml } = usePreview()
const selectedFolders = ref<string[]>([])
const previewFolder = ref<string>('')
const previewHtml = ref('')
const showTemplatePreview = ref(false)
const templatePreviewSrcdoc = ref('')
const previewAllLoading = ref(false)

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

// hover 迷你预览：只渲染片段本身（保留原有逻辑）
async function loadPreview(folder: string) {
  if (previewFolder.value === folder) return

  previewFolder.value = folder
  const config = await snippetStore.loadSnippetDetail(folder)
  const html = snippetStore.getSnippetHtml(folder)
  if (config && html) {
    const data = config.sampleData || {}
    let compiled = html
    try {
      compiled = compileSnippetByType(html, data, config.formSchema.type)
    } catch (e) {
      console.error('Preview compile error:', e)
    }
    previewHtml.value = buildSnippetPreviewHtml(compiled)
  }
}

// 单片段模板预览：使用模板 + 该片段的示例数据
async function openTemplatePreview(folder: string) {
  if (!props.templateFolder) return
  try {
    previewAllLoading.value = true
    templatePreviewSrcdoc.value = await generateSnippetPreviewHtml({
      templateFolder: props.templateFolder,
      snippetFolders: [folder],
    })
    showTemplatePreview.value = true
  } catch (e) {
    console.error('Template preview failed:', e)
  } finally {
    previewAllLoading.value = false
  }
}

// 多选片段模板预览：使用模板 + 所有已选片段的示例数据
async function openSelectedPreview() {
  if (!props.templateFolder || selectedFolders.value.length === 0) return
  try {
    previewAllLoading.value = true
    templatePreviewSrcdoc.value = await generateSnippetPreviewHtml({
      templateFolder: props.templateFolder,
      snippetFolders: [...selectedFolders.value],
    })
    showTemplatePreview.value = true
  } catch (e) {
    console.error('Template preview failed:', e)
  } finally {
    previewAllLoading.value = false
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
    showTemplatePreview.value = false
    templatePreviewSrcdoc.value = ''
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
  position: relative;
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

.card-preview-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  backdrop-filter: blur(4px);
}

.snippet-card:hover .card-preview-btn {
  opacity: 1;
}

.card-preview-btn:hover {
  background: rgba(16, 185, 129, 0.85);
  transform: scale(1.05);
}

.confirm-btn {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  border-color: #0284C7;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #0EA5E9, #0369A1);
}

.preview-all-btn {
  background: #10B981;
  border-color: #10B981;
}

.preview-all-btn:hover {
  background: #059669;
  border-color: #059669;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer :deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
