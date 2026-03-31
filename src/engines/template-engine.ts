import template from 'lodash-es/template'

export function compileTemplate(htmlTemplate: string, data: Record<string, any>): string {
  try {
    const compiled = template(htmlTemplate)
    return compiled(data)
  } catch (e) {
    console.error('Template compilation error:', e)
    return htmlTemplate
  }
}

export function resolveSnippetData(
  snippetData: Record<string, any> | Record<string, any>[],
  sampleData: Record<string, any> | Record<string, any>[],
): Record<string, any> | Record<string, any>[] {
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

const PLACEHOLDER_REGEX = /<!--\s*placeholder:([\w-]+)\s*-->/g

export function replacePlaceholders(
  templateHtml: string,
  renderedSnippets: { placeholder: string; html: string }[],
): string {
  // 按占位符分组，支持同一个占位符多个片段
  const groupedByPlaceholder = new Map<string, string[]>()
  for (const { placeholder, html } of renderedSnippets) {
    const key = placeholder.replace('placeholder:', '')
    if (!groupedByPlaceholder.has(key)) {
      groupedByPlaceholder.set(key, [])
    }
    groupedByPlaceholder.get(key)!.push(html)
  }

  let result = templateHtml

  // 遍历每个占位符的所有片段
  for (const [key, htmlList] of groupedByPlaceholder) {
    // 找到模板中所有匹配的占位符位置
    const regex = new RegExp(`<!--\\s*placeholder:${key}\\s*-->`, 'g')
    const matches = [...result.matchAll(regex)]

    if (matches.length > 0) {
      // 将该占位符的所有片段依次替换对应的占位符
      let newResult = result
      let offset = 0

      for (let i = 0; i < Math.min(htmlList.length, matches.length); i++) {
        const match = matches[i]
        const insertPos = match.index! + offset
        // 替换占位符注释为片段HTML
        newResult = newResult.slice(0, insertPos) + htmlList[i] + newResult.slice(insertPos + match[0].length)
        // 计算偏移量（因为替换后字符串长度会变化）
        offset += htmlList[i].length - match[0].length
      }

      result = newResult
    }
  }

  // 移除剩余未替换的占位符注释
  result = result.replace(PLACEHOLDER_REGEX, '')
  return result
}
