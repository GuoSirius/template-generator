<template>
  <div class="custom-css-dialog">
    <el-dialog
      :model-value="dialogVisible"
      @update:model-value="handleDialogClose"
      title="定制 CSS"
      width="800px"
      :close-on-click-modal="false"
      top="5vh"
      destroy-on-close
    >
      <div class="css-layout">
        <div class="css-editor-section">
          <div class="section-header">
            <span class="section-title">CSS 编辑器</span>
            <div class="validation-info" :class="cssValidation.valid ? 'valid' : 'invalid'">
              <CheckCircle2 v-if="cssValidation.valid" :size="14" />
              <AlertCircle v-else :size="14" />
              <span>{{ cssValidation.valid ? '语法正确' : cssValidation.errors[0] }}</span>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              ref="editorRef"
              v-model="cssCode"
              class="css-textarea"
              placeholder="输入自定义 CSS 样式..."
              spellcheck="false"
              @input="onInput"
              @keydown="handleKeyDown"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="info" class="preview-btn" @click="handlePreview">
            <Eye :size="16" />
            应用并预览
          </el-button>
          <el-button type="primary" class="save-btn" @click="onSave">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <PreviewDialog
      v-model="showPreview"
      :srcdoc="previewSrcdocValue"
      title="CSS 预览效果"
      :height="isFullscreen ? 'calc(100vh - 120px)' : '70vh'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2, AlertCircle, Eye, Maximize2, Minimize2 } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus'
import { validateCss } from '@/engines/css-engine'
import { usePreview } from '@/composables/use-preview'
import type { SnippetInstance } from '@/types'
import PreviewDialog from '@/components/preview/PreviewDialog.vue'

const props = defineProps<{
  visible?: boolean
  modelValue: string
  templateHtml: string
  snippetInstances: SnippetInstance[]
  seoTitle?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: string]
  save: [value: string]
}>()

const { previewSrcdoc } = usePreview()

const dialogVisible = computed({
  get: () => props.visible ?? false,
  set: (val: boolean) => emit('update:visible', val)
})

const cssCode = ref('')
const originalCode = ref('')
const showPreview = ref(false)
const editorRef = ref<HTMLTextAreaElement>()

const cssValidation = computed(() => validateCss(String(cssCode.value)))

// 计算预览 HTML：使用 usePreview 统一管道，传入编辑中的 CSS
const previewSrcdocValue = previewSrcdoc({
  css: String(cssCode.value),
  templateHtml: props.templateHtml,
  seoTitle: props.seoTitle,
})

watch(() => props.modelValue, (val) => {
  cssCode.value = val
  originalCode.value = val
}, { immediate: true })

function onInput() {
  emit('update:modelValue', cssCode.value)
}

function handleKeyDown(e: KeyboardEvent) {
  // Tab 键插入两个空格
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = editorRef.value?.selectionStart || 0
    const end = editorRef.value?.selectionEnd || 0
    const target = editorRef.value
    if (target) {
      const before = target.value.substring(0, start)
      const after = target.value.substring(end)
      target.value = before + '  ' + after
      target.selectionStart = target.selectionEnd = start + 2
      cssCode.value = target.value
      emit('update:modelValue', cssCode.value)
    }
  }
}

function hasChanges(): boolean {
  return cssCode.value !== originalCode.value
}

async function handleCancel() {
  if (hasChanges()) {
    try {
      await ElMessageBox.confirm(
        '您有未保存的更改，确定要放弃吗？',
        '确认取消',
        {
          confirmButtonText: '放弃更改',
          cancelButtonText: '继续编辑',
          type: 'warning',
        }
      )
      dialogVisible.value = false
    } catch {
      // 用户取消，留在弹框
    }
  } else {
    dialogVisible.value = false
  }
}

function handleDialogClose(val: boolean) {
  if (!val) {
    handleCancel()
  }
}

function handlePreview() {
  showPreview.value = true
}

function onSave() {
  emit('save', cssCode.value)
  originalCode.value = cssCode.value
  dialogVisible.value = false
}
</script>

<style scoped>
.css-layout {
  display: flex;
  flex-direction: column;
  height: 55vh;
}

.css-editor-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.validation-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.validation-info.valid {
  color: #22C55E;
}

.validation-info.invalid {
  color: #EF4444;
}

.editor-wrapper {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
}

.css-textarea {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  padding: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.css-textarea::placeholder {
  color: #6a6a6a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.save-btn {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  border-color: #0284C7;
}

.preview-btn {
  background: #10B981;
  border-color: #10B981;
}
</style>