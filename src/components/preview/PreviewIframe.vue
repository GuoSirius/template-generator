<template>
  <div class="preview-container" ref="containerRef">
    <div class="preview-toolbar" v-if="showToolbar">
      <slot name="toolbar" />
      <button class="fullscreen-btn" @click="toggleFullscreen(containerRef)" title="全屏预览">
        <Maximize2 v-if="!isFullscreen" :size="18" />
        <Minimize2 v-else :size="18" />
      </button>
    </div>
    <div class="preview-frame-wrapper" :class="{ collapsed: collapsed }">
      <iframe
        ref="iframeEl"
        class="preview-iframe"
        :srcdoc="srcdoc"
        sandbox="allow-scripts allow-same-origin"
        @load="onIframeLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import { useFullscreen } from '@/composables/use-fullscreen'

withDefaults(defineProps<{
  srcdoc: string
  showToolbar?: boolean
  collapsed?: boolean
}>(), {
  showToolbar: true,
  collapsed: false,
})

const emit = defineEmits<{
  load: []
}>()

const containerRef = ref<HTMLElement>()
const { isFullscreen, toggleFullscreen } = useFullscreen()

const onIframeLoad = () => {
  emit('load')
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-primary);
  height: 100%;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  gap: 6px;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.fullscreen-btn:hover {
  filter: brightness(1.15);
  transform: scale(1.05);
}

.preview-frame-wrapper {
  flex: 1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-frame-wrapper.collapsed {
  max-height: 0;
  opacity: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  min-height: 400px;
  background: white;
}
</style>
