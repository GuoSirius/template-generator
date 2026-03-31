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
  let result = templateHtml
  for (const { placeholder, html } of renderedSnippets) {
    const key = placeholder.replace('placeholder:', '')
    const regex = new RegExp(`<!--\\s*placeholder:${key}\\s*-->`, 'g')
    result = result.replace(regex, html)
  }
  // Replace remaining placeholders with defaults
  result = result.replace(PLACEHOLDER_REGEX, '')
  return result
}
