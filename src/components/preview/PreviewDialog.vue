<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :fullscreen="isFullscreen"
    :width="width"
    :top="top"
    destroy-on-close
  >
    <template #header>
      <div class="preview-dialog-header">
        <span class="preview-dialog-title">{{ title }}</span>
        <div class="preview-dialog-actions">
          <el-button
            :icon="isFullscreen ? Minimize2 : Maximize2"
            circle
            size="small"
            @click="isFullscreen = !isFullscreen"
            :title="isFullscreen ? '退出全屏' : '全屏'"
          />
        </div>
      </div>
    </template>
    <component
      :is="iframeComponent"
      v-if="srcdoc"
      :srcdoc="srcdoc"
      :show-toolbar="false"
      :style="{ height: isFullscreen ? 'calc(100vh - 120px)' : defaultHeight }"
    />
    <div v-else class="preview-empty">
      <span>暂无预览内容</span>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import PreviewIframe from './PreviewIframe.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  srcdoc?: string
  title?: string
  width?: string
  top?: string
  height?: string
  usePreviewIframe?: boolean
}>(), {
  title: '页面预览',
  width: '85%',
  top: '3vh',
  height: '75vh',
  usePreviewIframe: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isFullscreen = ref(false)
const defaultHeight = computed(() => props.height)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const iframeComponent = computed(() => props.usePreviewIframe ? PreviewIframe : 'iframe')

watch(() => props.modelValue, (val) => {
  if (val) {
    isFullscreen.value = false
  }
})
</script>

<style scoped>
.preview-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 40px;
}

.preview-dialog-title {
  font-size: 15px;
  font-weight: 600;
}

.preview-dialog-actions {
  display: flex;
  gap: 8px;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>