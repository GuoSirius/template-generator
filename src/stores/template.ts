import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { TemplateMeta, TemplateConfig, PagesRegistry } from '@/types'
import {
  getPagesRegistry,
  getTemplateConfig,
  getTemplateHtml,
} from '@/engines/yaml-parser'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<TemplateMeta[]>([])
  // 使用 shallowRef 避免深层响应式追踪问题
  const currentTemplate = shallowRef<TemplateMeta | null>(null)
  const currentConfig = shallowRef<TemplateConfig | null>(null)
  const currentHtml = ref('')
  const loading = ref(false)

  const loadTemplates = async () => {
    if (templates.value.length > 0) return
    loading.value = true
    try {
      const registry = await getPagesRegistry()
      templates.value = registry.templates || []
    } catch (e) {
      // 忽略模板加载错误
    } finally {
      loading.value = false
    }
  }

  const selectTemplate = async (folder: string) => {
    const meta = templates.value.find((t) => t.folder === folder)
    if (!meta) return

    currentTemplate.value = meta
    loading.value = true
    try {
      const [config, html] = await Promise.all([
        getTemplateConfig(folder),
        getTemplateHtml(folder),
      ])
      currentConfig.value = config
      currentHtml.value = html
    } catch (e) {
      // 忽略模板详情加载错误
    } finally {
      loading.value = false
    }
  }

  const clearCurrent = () => {
    currentTemplate.value = null
    currentConfig.value = null
    currentHtml.value = ''
  }

  return {
    templates,
    currentTemplate,
    currentConfig,
    currentHtml,
    loading,
    loadTemplates,
    selectTemplate,
    clearCurrent,
  }
})
