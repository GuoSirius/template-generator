import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { compileTemplate, resolveSnippetData, wrapWithContainer, buildSpacingStyle, replacePlaceholders } from '@/engines/template-engine'
import { buildPreviewHtml } from '@/engines/preview-renderer'
import { getTemplateHtml, getSnippetHtml } from '@/engines/yaml-parser'
import { useSnippetStore } from '@/stores/snippet'
import { useProjectStore } from '@/stores/project'
import { useTemplateStore } from '@/stores/template'
import type { SnippetConfig, SnippetInstance } from '@/types'
import { createDefaultSpacing } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreviewOverrides {
  css?: string
  js?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  templateHtml?: string
}

export interface RenderedSnippet {
  placeholder: string
  html: string
}

// ---------------------------------------------------------------------------
// Pure helpers – exported for testing
// ---------------------------------------------------------------------------

/**
 * 根据 formSchema.type 统一编译片段 HTML。
 * - object:          { ...data }
 * - array:           { features: data }
 * - objectWithList:  { ...data }
 */
export function compileSnippetByType(
  html: string,
  data: Record<string, any> | Record<string, any>[],
  formSchemaType: string,
): string {
  if (formSchemaType === 'array') {
    return compileTemplate(html, {
      features: Array.isArray(data) ? data : [data],
    })
  }
  return compileTemplate(html, { ...(data as Record<string, any>) })
}

/**
 * 渲染一组片段实例为 { placeholder, html } 数组。
 */
export function renderSnippets(
  instances: SnippetInstance[],
  configs: Map<string, SnippetConfig>,
  getHtml: (id: string) => string,
): RenderedSnippet[] {
  return instances
    .map((inst) => {
      const config = configs.get(inst.snippetId)
      const rawHtml = getHtml(inst.snippetId)
      if (!rawHtml) return null

      const data = resolveSnippetData(
        inst.data as Record<string, any>,
        config?.sampleData || {},
      ) as Record<string, any>

      let compiled: string
      try {
        compiled = compileSnippetByType(
          rawHtml,
          data,
          config?.formSchema.type || 'object',
        )
      } catch (e) {
        // 编译失败时降级使用原始 HTML（无变量替换），避免整页无法预览
        console.warn('Snippet compile failed, falling back to raw HTML:', e)
        compiled = rawHtml
      }

      const spacingStyle = buildSpacingStyle(inst.properties.spacing)
      const wrapped = wrapWithContainer(compiled, inst.properties.className, spacingStyle)
      return { placeholder: inst.properties.placeholder, html: wrapped }
    })
    .filter(Boolean) as RenderedSnippet[]
}

/**
 * 根据片段配置信息渲染片段（用于 SnippetAddDialog 等无 SnippetInstance 的场景）
 */
export function renderSnippetsByFolder(
  folders: string[],
  configs: Map<string, SnippetConfig>,
  getHtml: (id: string) => string,
): RenderedSnippet[] {
  return folders
    .map((folder) => {
      const config = configs.get(folder)
      const rawHtml = getHtml(folder)
      if (!rawHtml) return null

      const data = config?.sampleData
        ? (config.sampleData as Record<string, any>)
        : {}

      let compiled: string
      try {
        compiled = compileSnippetByType(
          rawHtml,
          data,
          config?.formSchema.type || 'object',
        )
      } catch (e) {
        // 编译失败时降级使用原始 HTML
        console.warn('Snippet compile failed, falling back to raw HTML:', e)
        compiled = rawHtml
      }

      const spacingStyle = buildSpacingStyle(
        (config?.defaults as any)?.spacing || createDefaultSpacing(),
      )
      const className = config?.className || folder
      const placeholder = config?.defaultPlaceholder || ''
      const wrapped = wrapWithContainer(compiled, className, spacingStyle)
      return { placeholder, html: wrapped }
    })
    .filter(Boolean) as RenderedSnippet[]
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * 从 stores 读取当前项目数据，生成完整的预览 srcdoc。
 * 支持同步 computed 和异步方法两种使用方式。
 *
 * 支持组件级别的 local CSS/JS 覆盖：当用户在对话框中编辑但尚未保存到 store 时，
 * 调用 setLocalCustomCode() 让预览立即反映本地编辑内容。
 */
export function usePreview() {
  const projectStore = useProjectStore()
  const templateStore = useTemplateStore()
  const snippetStore = useSnippetStore()

  // 组件级别的本地定制代码（用于实时预览编辑中的内容）
  const localCustomCss = ref('')
  const localCustomJs = ref('')

  /**
   * 设置本地 CSS/JS，覆盖 store 中的值用于实时预览。
   * 适用于组件中 edit，但尚未保存到 store 的场景。
   */
  function setLocalCustomCode(css: string, js: string) {
    localCustomCss.value = css
    localCustomJs.value = js
  }

  // -- 内部：基于 store 数据构建 renderedSnippets ---------------------------------

  function buildCurrentRenderedSnippets(): RenderedSnippet[] {
    const instances = projectStore.currentProject?.snippetInstances || []
    const enabled = instances.filter((s) => s.enabled)
    return renderSnippets(
      enabled,
      snippetStore.configs,
      (id) => snippetStore.getSnippetHtml(id),
    )
  }

  // -- 同步 computed：当前项目完整预览 -------------------------------------------

  const fullPreviewSrcdoc: ComputedRef<string> = computed(() => {
    const html = templateStore.currentHtml
    if (!html) return ''

    const project = projectStore.currentProject
    const rendered = buildCurrentRenderedSnippets()
    const finalHtml = replacePlaceholders(html, rendered)

    // 优先使用本地值（编辑中未保存的），否则用 store 中的值
    const css = localCustomCss.value || project?.customCss || ''
    const js = localCustomJs.value || project?.customJs || ''

    return buildPreviewHtml(
      finalHtml,
      css,
      project?.seo.title || '',
      project?.seo.description || '',
      project?.seo.keywords || '',
      js,
    )
  })

  // -- 同步 computed + overrides（CSS/JS 对话框编辑中预览）----------------------

  function previewSrcdoc(overrides: PreviewOverrides): ComputedRef<string> {
    return computed(() => {
      const html = overrides.templateHtml || templateStore.currentHtml
      if (!html) return ''

      const project = projectStore.currentProject
      const rendered = buildCurrentRenderedSnippets()
      const finalHtml = replacePlaceholders(html, rendered)

      // overrides 优先，然后本地值，最后 store兜底
      const css = overrides.css ?? (localCustomCss.value || project?.customCss || '')
      const js = overrides.js ?? (localCustomJs.value || project?.customJs || '')

      return buildPreviewHtml(
        finalHtml,
        css,
        overrides.seoTitle ?? (project?.seo.title || ''),
        overrides.seoDescription ?? (project?.seo.description || ''),
        overrides.seoKeywords ?? (project?.seo.keywords || ''),
        js,
      )
    })
  }

  // -- 异步：列表页项目预览（需动态加载模板和片段 HTML）------------------------

  async function generatePreviewHtml(project: {
    templateId: string
    snippetInstances: SnippetInstance[]
    customCss?: string
    customJs?: string
    seo: { title?: string; description?: string; keywords?: string }
  }): Promise<string> {
    // 并行加载模板 HTML 和所有片段详情
    const enabled = project.snippetInstances.filter((s) => s.enabled)

    const snippetIds = [...new Set(enabled.map((i) => i.snippetId))]
    await Promise.all(
      snippetIds.map((id) => snippetStore.loadSnippetDetail(id)),
    )

    // 确保片段 HTML 缓存
    for (const id of snippetIds) {
      if (!snippetStore.getSnippetHtml(id)) {
        const html = await getSnippetHtml(id)
        snippetStore.htmlCache.set(id, html)
      }
    }

    const templateHtml = await getTemplateHtml(project.templateId)
    const rendered = renderSnippets(
      enabled,
      snippetStore.configs,
      (id) => snippetStore.getSnippetHtml(id),
    )
    const finalHtml = replacePlaceholders(templateHtml, rendered)

    return buildPreviewHtml(
      finalHtml,
      project.customCss || '',
      project.seo.title || '',
      project.seo.description || '',
      project.seo.keywords || '',
      project.customJs || '',
    )
  }

  // -- 异步：片段添加对话框的单片段/多片段模板预览 ----------------------------

  async function generateSnippetPreviewHtml(options: {
    templateFolder: string
    snippetFolders: string[]
  }): Promise<string> {
    // 加载所有片段详情
    await Promise.all(
      options.snippetFolders.map((f) => snippetStore.loadSnippetDetail(f)),
    )

    // 确保片段 HTML 缓存
    for (const f of options.snippetFolders) {
      if (!snippetStore.getSnippetHtml(f)) {
        const html = await getSnippetHtml(f)
        snippetStore.htmlCache.set(f, html)
      }
    }

    // 加载模板 HTML
    let templateHtml: string
    if (templateStore.currentTemplate?.folder === options.templateFolder && templateStore.currentHtml) {
      templateHtml = templateStore.currentHtml
    } else {
      templateHtml = await getTemplateHtml(options.templateFolder)
    }

    // 渲染片段（使用 sampleData）
    const rendered = renderSnippetsByFolder(
      options.snippetFolders,
      snippetStore.configs,
      (id) => snippetStore.getSnippetHtml(id),
    )
    const finalHtml = replacePlaceholders(templateHtml, rendered)

    return buildPreviewHtml(finalHtml)
  }

  // -- 确保所有已启用片段的资源已加载 -----------------------------------------

  async function ensureSnippetResources(): Promise<void> {
    const instances = projectStore.currentProject?.snippetInstances || []
    const enabled = instances.filter((s) => s.enabled)
    const snippetIds = [...new Set(enabled.map((i) => i.snippetId))]

    await Promise.all(
      snippetIds.map(async (id) => {
        if (!snippetStore.configs.has(id)) {
          await snippetStore.loadSnippetDetail(id)
        }
        if (!snippetStore.getSnippetHtml(id)) {
          const html = await getSnippetHtml(id)
          snippetStore.htmlCache.set(id, html)
        }
      }),
    )
  }

  return {
    fullPreviewSrcdoc,
    previewSrcdoc,
    generatePreviewHtml,
    generateSnippetPreviewHtml,
    ensureSnippetResources,
    setLocalCustomCode,
  }
}
