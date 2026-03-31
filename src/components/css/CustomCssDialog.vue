<template>
  <div class="custom-css-dialog">
    <el-dialog
      :model-value="dialogVisible"
      @update:model-value="$emit('update:visible', $event)"
      title="定制 CSS"
      width="900px"
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
              v-model="cssCode"
              class="css-textarea"
              placeholder="输入自定义 CSS 样式..."
              spellcheck="false"
              @input="onInput"
            />
          </div>
        </div>
        <div class="css-preview-section">
          <div class="section-header">
            <span class="section-title">预览效果</span>
            <button class="icon-btn btn-preview" title="全屏预览" @click="fullscreenPreview">
              <Maximize2 :size="14" />
            </button>
          </div>
          <div class="preview-wrapper" ref="previewContainerRef">
            <iframe
              v-if="previewSrcdoc"
              :srcdoc="previewSrcdoc"
              class="css-preview-iframe"
              sandbox="allow-same-origin"
            />
            <div v-else class="preview-empty">
              <Code :size="32" />
              <span>编辑 CSS 后查看效果</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="save-btn"
          @click="onSave"
        >
          保存应用
        </el-button>
      </template>
    </el-dialog>

    <!-- 全屏预览对话框 -->
    <el-dialog
      v-model="showFullscreen"
      title="CSS 预览（全屏）"
      fullscreen
      destroy-on-close
    >
      <iframe
        v-if="previewSrcdoc"
        :srcdoc="previewSrcdoc"
        class="fullscreen-iframe"
        sandbox="allow-same-origin"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2, AlertCircle, Maximize2, Code } from 'lucide-vue-next'
import { useFullscreen } from '@/composables/use-fullscreen'
import { validateCss } from '@/engines/css-engine'

const props = defineProps<{
  visible?: boolean
  modelValue: string
  previewHtml: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: string]
  save: [value: string]
}>()

const dialogVisible = computed({
  get: () => props.visible ?? false,
  set: (val: boolean) => emit('update:visible', val)
})

const cssCode = ref('')
const showFullscreen = ref(false)
const previewContainerRef = ref<HTMLElement>()
const { toggleFullscreen } = useFullscreen()

const cssValidation = computed(() => validateCss(String(cssCode.value)))

const previewSrcdoc = computed(() => {
  if (!props.previewHtml) return ''
  const cssStr = String(cssCode.value)
  const styleTag = cssStr.trim()
    ? `<style>${cssStr}</style>`
    : ''
  return props.previewHtml.replace('</head>', `${styleTag}</head>`)
})

watch(() => props.modelValue, (val) => {
  cssCode.value = val
}, { immediate: true })

function onInput() {
  emit('update:modelValue', cssCode.value)
}

function onSave() {
  emit('save', cssCode.value)
  dialogVisible.value = false
}

function fullscreenPreview() {
  if (previewContainerRef.value) {
    toggleFullscreen(previewContainerRef.value)
  }
}
</script>

<style scoped>
.css-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 60vh;
}

.css-editor-section,
.css-preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

.css-textarea {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  padding: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.preview-wrapper {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.css-preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 8px;
  font-size: 14px;
  opacity: 0.6;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  background: #22C55E;
}

.icon-btn:hover {
  transform: scale(1.1);
  brightness: 1.2;
}

.btn-preview { background: #22C55E; }

.save-btn {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  border-color: #0284C7;
}

.fullscreen-iframe {
  width: 100%;
  height: calc(100vh - 60px);
  border: none;
  background: white;
}
</style>
