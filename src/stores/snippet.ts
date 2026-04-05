import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SnippetMeta, SnippetConfig } from '@/types'
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
    } catch {
      // 忽略片段加载错误
    } finally {
      loading.value = false
    }
  }

  const getSnippetMeta = (folder: string): SnippetMeta | undefined => {
    return snippets.value.find((s) => s.folder === folder)
  }

  const loadSnippetDetail = async (folder: string): Promise<SnippetConfig | null> => {
    // 已缓存但 HTML 为空或不完整，单独加载 HTML
    const existingHtml = htmlCache.value.get(folder)
    if (configs.value.has(folder) && (!existingHtml || existingHtml.length < 10)) {
      try {
        const html = await getSnippetHtml(folder)
        if (html && html.length > 0) {
          htmlCache.value.set(folder, html)
        }
      } catch {
        // 忽略 HTML 加载错误
      }
      return configs.value.get(folder)!
    }
    if (configs.value.has(folder)) {
      return configs.value.get(folder)!
    }
    loading.value = true
    try {
      // 分别加载 config 和 html，避免一个失败影响另一个
      const configPromise = getSnippetConfig(folder)
      const htmlPromise = getSnippetHtml(folder).catch(() => '')
      const [config, html] = await Promise.all([configPromise, htmlPromise])
      configs.value.set(folder, config)
      if (html && html.length > 0) {
        htmlCache.value.set(folder, html)
      }
      return config
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  const getCachedSnippetHtml = (folder: string): string => {
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
    getSnippetHtml: getCachedSnippetHtml,
  }
})
