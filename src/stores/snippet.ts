import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SnippetMeta, SnippetConfig, SnippetsRegistry } from '@/types'
import {
  getSnippetsRegistry,
  getSnippetConfig,
  getSnippetHtml,
} from '@/engines/yaml-parser'

export const useSnippetStore = defineStore('snippet', () => {
  const snippets = ref<SnippetMeta[]>([])
  const configs = ref<Map<string, SnippetConfig>>(new Map())
  const htmlCache = ref<Map<string, string>>(new Map())
  const loading = ref(false)

  const loadSnippets = async () => {
    if (snippets.value.length > 0) return
    loading.value = true
    try {
      const registry = await getSnippetsRegistry()
      snippets.value = registry.snippets || []
    } catch (e) {
      console.error('Failed to load snippets:', e)
    } finally {
      loading.value = false
    }
  }

  const getSnippetMeta = (folder: string): SnippetMeta | undefined => {
    return snippets.value.find((s) => s.folder === folder)
  }

  const loadSnippetDetail = async (folder: string): Promise<SnippetConfig | null> => {
    if (configs.value.has(folder)) {
      return configs.value.get(folder)!
    }
    loading.value = true
    try {
      const [config, html] = await Promise.all([
        getSnippetConfig(folder),
        getSnippetHtml(folder),
      ])
      configs.value.set(folder, config)
      htmlCache.value.set(folder, html)
      return config
    } catch (e) {
      console.error('Failed to load snippet detail:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const getSnippetHtml = (folder: string): string => {
    return htmlCache.value.get(folder) || ''
  }

  return {
    snippets,
    configs,
    htmlCache,
    loading,
    loadSnippets,
    getSnippetMeta,
    loadSnippetDetail,
    getSnippetHtml,
  }
})
