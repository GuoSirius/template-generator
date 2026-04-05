import { computed, ref, type ComputedRef } from 'vue'
import { compileTemplate, resolveSnippetData, wrapWithContainer, buildSpacingStyle, replacePlaceholders, renderLodashTemplate } from '@/engines/template-engine'
import { buildPreviewHtml } from '@/engines/preview-renderer'
import { getTemplateHtml, getTemplateConfig, getSnippetHtml } from '@/engines/yaml-parser'
import { useSnippetStore } from '@/stores/snippet'
import { useProjectStore } from '@/stores/project'
import { useTemplateStore } from '@/stores/template'
import type { SnippetConfig, SnippetInstance, SnippetData } from '@/types'
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
  data: SnippetData,
  formSchemaType: string,
): string {
  if (formSchemaType === 'array') {
    const arrayData = Array.isArray(data) ? data : [data]
    return compileTemplate(html, { features: arrayData })
  }
  // object 和 objectWithList 类型都直接传入数据
  return compileTemplate(html, data)
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
        inst.data,
        config?.sampleData || {} as SnippetData,
      )

      let compiled: string
      try {
        compiled = compileSnippetByType(
          rawHtml,
          data,
          config?.formSchema.type || 'object',
        )
      } catch (e) {
        // 编译失败时降级使用原始 HTML（无变量替换），避免整页无法预览
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

      const data = config?.sampleData || {} as SnippetData

      let compiled: string
      try {
        compiled = compileSnippetByType(
          rawHtml,
          data,
          config?.formSchema.type || 'object',
        )
      } catch (e) {
        // 编译失败时降级使用原始 HTML
        compiled = rawHtml
      }

      const spacingStyle = buildSpacingStyle(
        config?.defaults?.spacing || createDefaultSpacing(),
      )
      const className = config?.className || folder
      const placeholder = config?.defaultPlaceholder || ''
      const wrapped = wrapWithContainer(compiled, className, spacingStyle)
      return { placeholder, html: wrapped }
    })
    .filter(Boolean) as RenderedSnippet[]
}

// ---------------------------------------------------------------------------
// 内部公共工具函数
// ---------------------------------------------------------------------------

/** 从完整 HTML 文档中提取 body 内容 */
function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return bodyMatch ? bodyMatch[1] : html
}

/** 确保指定的片段资源（配置 + HTML）已加载 */
async function ensureSnippetsLoaded(
  snippetStore: ReturnType<typeof useSnippetStore>,
  ids: string[],
): Promise<void> {
  await Promise.all(ids.map((id) => snippetStore.loadSnippetDetail(id)))
  for (const id of ids) {
    if (!snippetStore.getSnippetHtml(id)) {
      const html = await getSnippetHtml(id)
      snippetStore.htmlCache.set(id, html)
    }
  }
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
 *
 * 渲染流程（所有预览入口共用）：
 *   1. 获取模板 HTML + 最新 placeholders 配置
 *   2. 提取 body 内容
 *   3. 渲染所有启用的代码片段 → RenderedSnippet[]
 *   4. 调用 replacePlaceholders（优先匹配占位符，未匹配追加到末尾）
 *   5. 调用 buildPreviewHtml 组装最终 HTML（SEO + CSS→head末尾 + body内容 + JS→body末尾）
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

  // -- 内部：基于 store 数据构建 renderedSnippets ------------------------------

  function buildCurrentRenderedSnippets(): RenderedSnippet[] {
    const instances = projectStore.currentProject?.snippetInstances || []
    const enabled = instances.filter((s) => s.enabled)
    return renderSnippets(
      enabled,
      snippetStore.configs,
      (id) => snippetStore.getSnippetHtml(id),
    )
  }

  /**
   * 获取当前可用的占位符名称列表（从模板配置中提取）。
   * 同步路径：从已加载的 currentConfig 中获取。
   */
  function getAvailablePlaceholders(): string[] {
    // 从当前已加载的配置中获取
    const placeholders = templateStore.currentConfig?.placeholders
    if (placeholders && placeholders.length > 0) {
      return placeholders.map((p) => p.name)
    }
    return []
  }

  /**
   * 公共渲染核心：模板 HTML + 片段 → 替换占位符后的 body content。
   *
   * 统一处理：
   * - 模板 HTML 获取（同步/异步）
   * - 最新 placeholders 提取
   * - body 内容提取
   * - 片段渲染（实例模式 / 文件夹+sampleData 模式）
   * - 占位符替换（含未匹配追加逻辑）
   */
  async function buildRenderedBody(options: {
    templateHtml?: string
    templateId?: string
    instances?: SnippetInstance[]
    folders?: string[]
    useSampleData?: boolean
  }): Promise<string> {
    const { templateHtml: inputHtml, templateId, instances, folders, useSampleData = false } = options

    // Step 1: 确定模板 HTML
    let html = inputHtml
    if (!html && templateId) {
      html = await getTemplateHtml(templateId)
    }
    if (!html) return ''

    // Step 2: 如果是异步路径且没有 currentConfig，尝试加载配置以获取最新 placeholders
    let placeholders = getAvailablePlaceholders()
    if (templateId && placeholders.length === 0) {
      try {
        const config = await getTemplateConfig(templateId)
        if (config?.placeholders) {
          placeholders = config.placeholders.map((p) => p.name)
        }
      } catch (e) {
        // 忽略 placeholders 加载错误，不影响预览生成
      }
    }

    // Step 3: 提取 body 内容
    const bodyContent = extractBodyContent(html)

    // Step 4: 渲染片段
    let rendered: RenderedSnippet[]

    if (useSampleData && folders) {
      // 文件夹 + sampleData 模式（SnippetAddDialog 场景）
      await ensureSnippetsLoaded(snippetStore, folders)
      rendered = renderSnippetsByFolder(
        folders,
        snippetStore.configs,
        (id) => snippetStore.getSnippetHtml(id),
      )
    } else if (instances) {
      // 实例模式（项目预览场景）— 确保资源已加载
      const enabled = instances.filter((s) => s.enabled)
      const snippetIds = [...new Set(enabled.map((i) => i.snippetId))]
      await ensureSnippetsLoaded(snippetStore, snippetIds)
      rendered = renderSnippets(
        enabled,
        snippetStore.configs,
        (id) => snippetStore.getSnippetHtml(id),
      )
    } else {
      // 默认：从当前 store 构建
      rendered = buildCurrentRenderedSnippets()
    }

    // Step 5: 替换占位符（传入最新 placeholders 列表）
    return replacePlaceholders(bodyContent, rendered, placeholders)
  }

  // -- 同步 computed：当前项目完整预览 -------------------------------------------

  const fullPreviewSrcdoc: ComputedRef<string> = computed(() => {
    // 不再强制依赖 snippetsReady 标志——模板应立即可见，片段异步加载后在同一预览中"热更新"
    const html = templateStore.currentHtml
    if (!html) return ''

    const project = projectStore.currentProject

    // 显式追踪 htmlCache 以确保 HTML 加载完成后触发重新渲染
    void snippetStore.htmlCache

    // 同步路径：直接使用已缓存的模板数据和配置
    let bodyContent = extractBodyContent(html)
    // 始终渲染当前已有的片段（loadSnippetDetail 会补充 htmlCache）
    const rendered = buildCurrentRenderedSnippets()

    const placeholders = getAvailablePlaceholders()
    bodyContent = replacePlaceholders(bodyContent, rendered, placeholders)

    // 优先使用本地值（编辑中未保存的），否则用 store 中的值
    const css = localCustomCss.value || project?.customCss || ''
    const js = localCustomJs.value || project?.customJs || ''

    // SEO 数据（模板使用 lodash 模板语法处理）
    const seoTitle = project?.seo.title || ''
    const seoDescription = project?.seo.description || ''
    const seoKeywords = project?.seo.keywords || ''

    // 构建预览 HTML
    let finalHtml = buildPreviewHtml(
      html,
      bodyContent,
      css,
      seoTitle,
      seoDescription,
      seoKeywords,
      js,
    )

    // 使用 lodash 模板渲染完整 HTML（支持 <%= title %> 等语法）
    finalHtml = renderLodashTemplate(finalHtml, {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
    })

    return finalHtml
  })

  // -- 同步 computed + overrides（CSS/JS 对话框编辑中预览）----------------------

  function previewSrcdoc(overrides: PreviewOverrides): ComputedRef<string> {
    // 直接在 getter 中访问 overrides 的属性，确保响应式追踪
    // 注意：不能在 getter 外层解构，否则会丢失响应式
    return computed(() => {
      const html = overrides.templateHtml || templateStore.currentHtml
      if (!html) return ''

      const project = projectStore.currentProject

      // 同步路径
      let bodyContent = extractBodyContent(html)
      const rendered = buildCurrentRenderedSnippets()
      const placeholders = getAvailablePlaceholders()
      bodyContent = replacePlaceholders(bodyContent, rendered, placeholders)

      // 直接访问 overrides 属性，确保 Vue 追踪响应式
      // overrides.css 可能为 undefined（未传）或空字符串（已清空）
      const hasExplicitCss = overrides.css !== undefined
      const css = hasExplicitCss ? overrides.css : (localCustomCss.value || project?.customCss || '')
      const js = overrides.js ?? (localCustomJs.value || project?.customJs || '')

      // SEO 数据
      const seoTitle = overrides.seoTitle ?? (project?.seo.title || '')
      const seoDescription = overrides.seoDescription ?? (project?.seo.description || '')
      const seoKeywords = overrides.seoKeywords ?? (project?.seo.keywords || '')

      // 构建预览 HTML
      let finalHtml = buildPreviewHtml(
        html,
        bodyContent,
        css,
        seoTitle,
        seoDescription,
        seoKeywords,
        js,
      )

      // 使用 lodash 模板渲染完整 HTML
      finalHtml = renderLodashTemplate(finalHtml, {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
      })

      return finalHtml
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
    // 获取完整的模板HTML
    const templateHtml = await getTemplateHtml(project.templateId)
    if (!templateHtml) return ''
    
    const finalBodyContent = await buildRenderedBody({
      templateHtml,
      templateId: project.templateId,
      instances: project.snippetInstances,
    })

    return buildPreviewHtml(
      templateHtml,
      finalBodyContent,
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
    customCss?: string
    customJs?: string
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
  }): Promise<string> {
    // Step 1: 获取完整的模板HTML
    let templateHtml = templateStore.currentTemplate?.folder === options.templateFolder
      ? templateStore.currentHtml
      : undefined
    
    if (!templateHtml) {
      templateHtml = await getTemplateHtml(options.templateFolder)
    }
    
    if (!templateHtml) return ''

    // Step 2: 获取替换占位符后的body内容
    const finalBodyContent = await buildRenderedBody({
      templateHtml,
      templateId: options.templateFolder,
      folders: options.snippetFolders,
      useSampleData: true,
    })

    // Step 3: 使用完整的模板HTML和替换后的body内容构建预览
    return buildPreviewHtml(
      templateHtml,
      finalBodyContent,
      options.customCss || '',
      options.seoTitle || '',
      options.seoDescription || '',
      options.seoKeywords || '',
      options.customJs || ''
    )
  }

  // -- 公开：确保所有已启用片段的资源已加载 -----------------------------------

  async function ensureSnippetResources(): Promise<void> {
    const instances = projectStore.currentProject?.snippetInstances || []
    const enabled = instances.filter((s) => s.enabled)
    const snippetIds = [...new Set(enabled.map((i) => i.snippetId))]
    await ensureSnippetsLoaded(snippetStore, snippetIds)
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
