<template>
  <div class="snippet-add-dialog">
    <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:modelValue', $event)"
      title="添加片段"
      width="1000px"
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
          @dblclick="handleDoubleClick(snippet.folder)"
        >
          <div class="card-order" v-if="selectedFolders.includes(snippet.folder)">
            {{ selectedFolders.indexOf(snippet.folder) + 1 }}
          </div>
          <div class="card-body">
            <h4 class="card-name">{{ snippet.name }}</h4>
            <span class="card-version">v{{ snippet.version }}</span>
            <el-tooltip
              :content="snippet.description"
              placement="top"
              :disabled="!snippet.description || snippet.description.length <= 60"
            >
              <p class="card-desc">{{ snippet.description }}</p>
            </el-tooltip>
            <div class="card-tags">
              <el-tag v-for="tag in snippet.tags" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="card-preview">
            <!-- 缩略图预览 -->
            <div class="thumbnail-preview">
              <div v-if="hasPreviewImages(snippet)" class="thumbnail-image" @click.stop="openImagePreview()">
                <el-image
                  :src="getFirstPreviewImage(snippet)"
                  :alt="snippet.name"
                  :preview-src-list="getAllPreviewImages(snippet)"
                  :preview-teleported="true"
                  :z-index="9999"
                  fit="contain"
                  class="thumbnail-el-image"
                />
                <div class="preview-count" v-if="getPreviewImagesCount(snippet) > 1">
                  {{ getPreviewImagesCount(snippet) }}张
                </div>
              </div>
              <div v-else-if="getThumbnailUrl(snippet.thumbnail)" class="thumbnail-image" @click.stop="openImagePreview()">
                <el-image
                  :src="getThumbnailUrl(snippet.thumbnail)"
                  :alt="snippet.name"
                  :preview-src-list="[getThumbnailUrl(snippet.thumbnail)]"
                  :preview-teleported="true"
                  :z-index="9999"
                  fit="contain"
                  class="thumbnail-el-image"
                />
              </div>
              <div v-else class="thumbnail-placeholder">
                <Image :size="32" />
                <span>无缩略图</span>
              </div>
            </div>
            <div class="card-preview-actions" v-if="templateFolder">
              <button
                class="template-preview-btn"
                title="在模板中预览此片段"
                @click.stop="openTemplatePreview(snippet.folder)"
              >
                <Eye :size="14" />
                <span>模板预览</span>
              </button>
            </div>
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
import { Eye, Image } from 'lucide-vue-next'
import type { SnippetMeta } from '@/types'
import { usePreview } from '@/composables/use-preview'
import PreviewDialog from '@/components/preview/PreviewDialog.vue'

const props = defineProps<{
  modelValue?: boolean
  snippets: SnippetMeta[]
  existingIds: string[]
  templateFolder?: string
  customCss?: string
  customJs?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: [folders: string[]]
}>()

const visible = computed({
  get: () => props.modelValue ?? false,
  set: (val: boolean) => emit('update:modelValue', val)
})

const { generateSnippetPreviewHtml } = usePreview()
const selectedFolders = ref<string[]>([])
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

// 获取缩略图URL
function getThumbnailUrl(thumbnailPath: string): string {
  if (!thumbnailPath) return ''
  // 如果已经是完整URL，直接返回
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return thumbnailPath
  }
  // 否则从public目录加载
  return `/template/snippets/${thumbnailPath}`
}

// 多预览图相关辅助函数
function hasPreviewImages(snippet: SnippetMeta): boolean {
  return !!(snippet.previewImages && snippet.previewImages.length > 0)
}

function getFirstPreviewImage(snippet: SnippetMeta): string {
  if (!snippet.previewImages || snippet.previewImages.length === 0) {
    return getThumbnailUrl(snippet.thumbnail)
  }
  const firstImage = snippet.previewImages[0]
  return firstImage.thumbnailUrl || firstImage.url
}

function getAllPreviewImages(snippet: SnippetMeta): string[] {
  if (!snippet.previewImages || snippet.previewImages.length === 0) {
    return snippet.thumbnail ? [getThumbnailUrl(snippet.thumbnail)] : []
  }
  return snippet.previewImages.map(img => img.url)
}

function getPreviewImagesCount(snippet: SnippetMeta): number {
  if (snippet.previewImages && snippet.previewImages.length > 0) {
    return snippet.previewImages.length
  }
  return snippet.thumbnail ? 1 : 0
}

// 打开图片预览（点击缩略图放大）
function openImagePreview() {
  // 这里不需要实现，el-image组件会自动处理预览
  // 这个函数只是为了阻止事件冒泡，让el-image组件处理预览
}



function toggleSelection(folder: string) {
  const index = selectedFolders.value.indexOf(folder)
  if (index === -1) {
    selectedFolders.value.push(folder)
  } else {
    selectedFolders.value.splice(index, 1)
  }
}

// 双击处理：如果没有选中任何片段，则选中并立即添加；如果双击的是唯一选中的片段，也立即添加
function handleDoubleClick(folder: string) {
  // 如果没有选中任何片段，先选中这个片段
  if (selectedFolders.value.length === 0) {
    selectedFolders.value.push(folder)
  }
  
  // 如果双击的是唯一选中的片段，或者这个片段已经被选中，立即添加
  if (selectedFolders.value.length === 1 && selectedFolders.value[0] === folder) {
    onConfirmWithSingle(folder)
  } else if (selectedFolders.value.includes(folder)) {
    // 如果双击的片段已经被选中（在多选情况下），也立即添加
    onConfirm()
  }
}

// 确认添加单个片段
function onConfirmWithSingle(folder: string) {
  emit('add', [folder])
  selectedFolders.value = []
  visible.value = false
}

function removeSelection(folder: string) {
  const index = selectedFolders.value.indexOf(folder)
  if (index !== -1) {
    selectedFolders.value.splice(index, 1)
  }
}



// 单片段模板预览：使用模板 + 该片段的示例数据 + 自定义CSS/JS
async function openTemplatePreview(folder: string) {
  if (!props.templateFolder) return
  try {
    previewAllLoading.value = true
    templatePreviewSrcdoc.value = await generateSnippetPreviewHtml({
      templateFolder: props.templateFolder,
      snippetFolders: [folder],
      customCss: props.customCss || '',
      customJs: props.customJs || '',
      seoTitle: props.seoTitle || '',
      seoDescription: props.seoDescription || '',
      seoKeywords: props.seoKeywords || '',
    })
    showTemplatePreview.value = true
  } catch (e) {
    // 忽略预览生成错误
  } finally {
    previewAllLoading.value = false
  }
}

// 多选片段模板预览：使用模板 + 所有已选片段的示例数据 + 自定义CSS/JS
async function openSelectedPreview() {
  if (!props.templateFolder || selectedFolders.value.length === 0) return
  try {
    previewAllLoading.value = true
    templatePreviewSrcdoc.value = await generateSnippetPreviewHtml({
      templateFolder: props.templateFolder,
      snippetFolders: [...selectedFolders.value],
      customCss: props.customCss || '',
      customJs: props.customJs || '',
      seoTitle: props.seoTitle || '',
      seoDescription: props.seoDescription || '',
      seoKeywords: props.seoKeywords || '',
    })
    showTemplatePreview.value = true
  } catch (e) {
    // 忽略预览生成错误
  } finally {
    previewAllLoading.value = false
  }
}

function onConfirm() {
  if (selectedFolders.value.length > 0) {
    emit('add', [...selectedFolders.value])
    selectedFolders.value = []
    visible.value = false
  }
}

// 重置选择状态
watch(visible, (val) => {
  if (!val) {
    selectedFolders.value = []
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5em;
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
  overflow: hidden;
}

/* 缩略图预览样式 */
.thumbnail-preview {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  position: relative;
}

.preview-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  z-index: 2;
}

.thumbnail-image :deep(.thumbnail-el-image) {
  width: 100%;
  height: 100%;
}

.thumbnail-image :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.thumbnail-image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.thumbnail-preview:hover .thumbnail-image :deep(.el-image__inner) {
  transform: scale(1.05);
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 8px;
  background: var(--bg-secondary);
  font-size: 13px;
}

.thumbnail-placeholder svg {
  opacity: 0.5;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-preview:hover .thumbnail-overlay {
  opacity: 1;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.preview-btn:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.card-preview-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.snippet-card:hover .card-preview-actions {
  opacity: 1;
}

.template-preview-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.template-preview-btn:hover {
  background: rgba(16, 185, 129, 0.85);
  transform: scale(1.05);
}
</style>
