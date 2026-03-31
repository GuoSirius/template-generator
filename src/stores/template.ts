import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TemplateMeta, TemplateConfig, PagesRegistry } from '@/types'
import {
  getPagesRegistry,
  getTemplateConfig,
  getTemplateHtml,
} from '@/engines/yaml-parser'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<TemplateMeta[]>([])
  const currentTemplate = ref<TemplateMeta | null>(null)
  const currentConfig = ref<TemplateConfig | null>(null)
  const currentHtml = ref<string>('')
  const loading = ref(false)

  const loadTemplates = async () => {
    if (templates.value.length > 0) return
    loading.value = true
    try {
      const registry = await getPagesRegistry()
      templates.value = registry.templates || []
    } catch (e) {
      console.error('Failed to load templates:', e)
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
      console.error('Failed to load template details:', e)
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
