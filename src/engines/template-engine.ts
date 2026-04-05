import template from 'lodash-es/template'
import type { SnippetData, FieldValue } from '@/types'

/**
 * 使用 lodash 模板语法渲染 HTML。
 * 支持 <%= title %> 等表达式。
 */
export function renderLodashTemplate(html: string, data: Record<string, FieldValue | string>): string {
  try {
    const compiled = template(html)
    return compiled(data)
  } catch {
    // 模板语法不存在，使用原始 HTML
    return html
  }
}

export function compileTemplate(htmlTemplate: string, data: SnippetData): string {
  try {
    const compiled = template(htmlTemplate)
    try {
      return compiled(data)
    } catch {
      return htmlTemplate
    }
  } catch {
    return htmlTemplate
  }
}

export function resolveSnippetData(
  snippetData: SnippetData,
  sampleData: SnippetData,
): SnippetData {
  // 如果 snippetData 是数组且不为空，使用 snippetData
  if (Array.isArray(snippetData) && snippetData.length > 0) {
    return snippetData
  }
  // 如果 snippetData 是对象且有键值，使用 snippetData
  if (!Array.isArray(snippetData) && snippetData && Object.keys(snippetData).length > 0) {
    return snippetData
  }
  // 如果 sampleData 存在，使用 sampleData
  if (sampleData) {
    return sampleData
  }
  // 否则返回空数据
  return Array.isArray(snippetData) ? [] : {}
}

export function buildSpacingStyle(spacing: {
  top: { value: number; unit: string }
  right: { value: number; unit: string }
  bottom: { value: number; unit: string }
  left: { value: number; unit: string }
}): string {
  const { top, right, bottom, left } = spacing
  return `margin: ${top.value}${top.unit} ${right.value}${right.unit} ${bottom.value}${bottom.unit} ${left.value}${left.unit};`
}

export function wrapWithContainer(html: string, className: string, spacingStyle: string): string {
  return `<div class="${className}" style="${spacingStyle}">${html}</div>`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PLACEHOLDER_REGEX = /<!--\s*placeholder:([\w-]+)\s*-->/g

/**
 * 从 placeholder 字符串中提取占位符名称。
 * 支持格式：'placeholder:header' → 'header', '' → ''
 */
function extractPlaceholderName(placeholder: string): string {
  const match = placeholder.match(/^placeholder:(.+)$/)
  return match ? match[1] : ''
}

/**
 * 替换模板中的占位符为渲染后的片段 HTML。
 *
 * 规则：
 * 1. 将片段按 placeholder 分为 matched（在 availablePlaceholders 中）和 unmatched 两组
 * 2. matched 组按 availablePlaceholders 顺序，将片段替换到对应占位符位置
 *    - 同一占位符多个片段依次放入该占位符的每个出现位置
 * 3. unmatched 组按原始顺序追加到最后一个被替换的位置之后
 * 4. 残留的空占位符注释保留不动
 *
 * @param templateHtml      模板 HTML（通常是 body 内容）
 * @param renderedSnippets  渲染后的片段数组 { placeholder, html }[]
 * @param availablePlaceholders 可用的占位符名称列表（从 TemplateConfig.placeholders 获取）
 */
export function replacePlaceholders(
  templateHtml: string,
  renderedSnippets: { placeholder: string; html: string }[],
  availablePlaceholders: string[] = [],
): string {
  if (renderedSnippets.length === 0) {
    return templateHtml
  }

  // Step 1: 提取每个 snippet 的 placeholder name，分离 matched 和 unmatched 组
  const matched = new Map<string, string[]>()   // name → html[]
  const unmatched: string[] = []                // 原始顺序的未匹配 html

  for (const { placeholder, html } of renderedSnippets) {
    const name = extractPlaceholderName(placeholder)
    if (!name) {
      // 空 placeholder 视为未匹配
      unmatched.push(html)
      continue
    }
    if (availablePlaceholders.length > 0 && !availablePlaceholders.includes(name)) {
      unmatched.push(html)
      continue
    }
    if (!matched.has(name)) {
      matched.set(name, [])
    }
    matched.get(name)!.push(html)
  }

  let result = templateHtml
  let lastInsertEndPos = -1

  // Step 2: 按 availablePlaceholders 定义顺序处理匹配组
  const processOrder = availablePlaceholders.length > 0
    ? availablePlaceholders
    : [...matched.keys()] // 无列表时按出现的 key 顺序

  for (const name of processOrder) {
    const htmlList = matched.get(name)
    if (!htmlList || htmlList.length === 0) continue

    const regex = new RegExp(`<!--\\s*placeholder:${name}\\s*-->`, 'g')
    const matches = [...result.matchAll(regex)]

    if (matches.length === 0) continue

    let offset = 0
    let localLastEnd = -1

    // 如果占位符数量少于片段数量，将所有片段合并到一个占位符中
    if (matches.length < htmlList.length) {
      // 将所有片段合并
      const combinedHtml = htmlList.join('')
      // 只替换第一个占位符
      const firstMatch = matches[0]
      const insertPos = firstMatch.index! + offset
      const insertEndPos = insertPos + combinedHtml.length

      result =
        result.slice(0, insertPos) +
        combinedHtml +
        result.slice(insertPos + firstMatch[0].length)

      offset += combinedHtml.length - firstMatch[0].length
      localLastEnd = insertEndPos
      
      // 移除其他占位符（不显示）
      for (let i = 1; i < matches.length; i++) {
        const m = matches[i]
        const pos = m.index! + offset
        result = result.slice(0, pos) + result.slice(pos + m[0].length)
        offset -= m[0].length
      }
    } else {
      // 正常情况：每个片段替换一个占位符
      for (let i = 0; i < Math.min(htmlList.length, matches.length); i++) {
        const m = matches[i]
        const insertPos = m.index! + offset
        const insertEndPos = insertPos + htmlList[i].length

        result =
          result.slice(0, insertPos) +
          htmlList[i] +
          result.slice(insertPos + m[0].length)

        offset += htmlList[i].length - m[0].length
        localLastEnd = insertEndPos
      }
    }

    // 更新全局最后插入位置
    if (localLastEnd > lastInsertEndPos) {
      lastInsertEndPos = localLastEnd
    }
  }

  // Step 3: 未匹配片段追加到最后插入位置之后
  if (unmatched.length > 0 && unmatched.some(h => h)) {
    const appendContent = unmatched.join('')
    if (lastInsertEndPos >= 0) {
      result = result.slice(0, lastInsertEndPos) + appendContent + result.slice(lastInsertEndPos)
    } else {
      // 没有任何占位符被替换，追加到末尾
      result += appendContent
    }
  }

  // Step 4: 残留空占位符保留不动（用户要求）

  return result
}
