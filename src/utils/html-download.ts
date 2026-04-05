/**
 * HTML 下载工具
 * 提供格式化 HTML 和压缩 HTML 的打包下载功能
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * HTML 格式化器
 * 缩进每级 2 个空格
 */

// 自闭合标签列表
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

// 预格式化标签（保持原有空白）
const PRE_TAGS = new Set(['pre', 'textarea'])

// 不需要换行的行内标签
const INLINE_TAGS = new Set([
  'span',
  'a',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'mark',
  'small',
  'sub',
  'sup',
  'code',
  'kbd',
  'samp',
  'var',
  'abbr',
  'cite',
  'q',
  'time',
  'label',
  'input',
  'button',
  'select',
  'option',
])

/**
 * 缩进字符串
 */
function indent(level: number, spaces = 2): string {
  return ' '.repeat(level * spaces)
}

/**
 * 判断标签是否为块级
 */
function isBlockTag(tagName: string): boolean {
  return !INLINE_TAGS.has(tagName.toLowerCase())
}

/**
 * 格式化 HTML 内容（递归）
 */
function formatHtmlContent(html: string, level: number): string {
  const lines: string[] = []
  let currentIndent = indent(level)
  let i = 0

  while (i < html.length) {
    // 跳过空白
    if (/\s/.test(html[i]) && (i === 0 || /\s/.test(html[i - 1]))) {
      i++
      continue
    }

    // 处理注释
    if (html.slice(i, i + 4) === '<!--') {
      const end = html.indexOf('-->', i)
      if (end !== -1) {
        lines.push(currentIndent + html.slice(i, end + 3).trim())
        i = end + 3
        continue
      }
    }

    // 处理标签
    if (html[i] === '<') {
      // 检查是否为闭合标签或自闭合标签
      const isCloseTag = html[i + 1] === '/'
      const tagMatch = html.slice(i).match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/)
      if (tagMatch) {
        const fullMatch = tagMatch[0]
        const tagName = tagMatch[1].toLowerCase()

        // 自闭合或 Void 标签
        if (fullMatch.endsWith('/>') || VOID_TAGS.has(tagName)) {
          lines.push(currentIndent + fullMatch)
        }
        // 闭合标签（减少缩进）
        else if (isCloseTag) {
          level = Math.max(0, level - 1)
          currentIndent = indent(level)
          lines.push(currentIndent + fullMatch)
        }
        // 预格式化标签（保持原样）
        else if (PRE_TAGS.has(tagName)) {
          // 找到对应闭合标签
          const closeTag = `</${tagName}>`
          const closeIndex = html.indexOf(closeTag, i)
          if (closeIndex !== -1) {
            const content = html.slice(i, closeIndex + closeTag.length)
            lines.push(currentIndent + content)
            i = closeIndex + closeTag.length
            continue
          }
        }
        // 脚本或样式标签
        else if (tagName === 'script' || tagName === 'style') {
          const closeTag = `</${tagName}>`
          const closeIndex = html.indexOf(closeTag, i)
          if (closeIndex !== -1) {
            if (tagName === 'style') {
              lines.push(currentIndent + `<${tagName}>`)
              lines.push(formatCss(html.slice(i + tagMatch[0].length, closeIndex), level + 1))
              lines.push(currentIndent + closeTag)
            } else {
              lines.push(currentIndent + `<${tagName}>`)
              lines.push(formatJs(html.slice(i + tagMatch[0].length, closeIndex), level + 1))
              lines.push(currentIndent + closeTag)
            }
            i = closeIndex + closeTag.length
            continue
          }
        }
        // 块级标签
        else if (isBlockTag(tagName)) {
          lines.push(currentIndent + fullMatch)
          level++
          currentIndent = indent(level)
        }
        // 行内标签
        else {
          lines.push(currentIndent + fullMatch)
        }

        i += fullMatch.length
        continue
      }
    }

    // 处理文本内容
    let text = ''
    while (i < html.length && html[i] !== '<') {
      text += html[i]
      i++
    }
    text = text.trim()
    if (text) {
      lines.push(currentIndent + text)
    }
  }

  return lines.join('\n')
}

/**
 * 格式化 CSS 内容
 */
function formatCss(css: string, level: number): string {
  const indentStr = indent(level)
  const lines: string[] = []
  let depth = 0
  let i = 0

  while (i < css.length) {
    // 跳过空白
    if (/\s/.test(css[i])) {
      i++
      continue
    }

    // 处理注释
    if (css.slice(i, i + 2) === '/*') {
      const end = css.indexOf('*/', i)
      if (end !== -1) {
        lines.push(indentStr + ' '.repeat(depth * 2) + css.slice(i, end + 2).trim())
        i = end + 2
        continue
      }
    }

    // 处理大括号
    if (css[i] === '{') {
      depth++
      lines.push(indentStr + ' '.repeat((depth - 1) * 2) + '{')
      i++
      continue
    }
    if (css[i] === '}') {
      depth = Math.max(0, depth - 1)
      lines.push(indentStr + ' '.repeat(depth * 2) + '}')
      i++
      continue
    }

    // 处理分号和换行
    if (css[i] === ';') {
      lines[lines.length - 1] += ';'
      i++
      continue
    }

    // 处理属性
    let prop = ''
    while (i < css.length && css[i] !== '{' && css[i] !== '}' && css[i] !== ';') {
      prop += css[i]
      i++
    }
    prop = prop.trim()
    if (prop && prop !== ':') {
      if (css[i] === ':') {
        let value = ''
        i++ // skip :
        while (i < css.length && css[i] !== ';' && css[i] !== '}') {
          value += css[i]
          i++
        }
        value = value.trim()
        if (value) {
          lines.push(indentStr + ' '.repeat(depth * 2) + prop + ': ' + value + ';')
        }
        if (css[i] === ';') i++
      } else if (prop) {
        lines.push(indentStr + ' '.repeat(depth * 2) + prop)
      }
    }
  }

  return lines.join('\n')
}

/**
 * 格式化 JS 内容（基础格式化）
 */
function formatJs(js: string, level: number): string {
  const indentStr = indent(level)
  const lines: string[] = []
  let depth = 0
  let i = 0

  while (i < js.length) {
    // 跳过空白（但保持换行）
    if (/\s/.test(js[i])) {
      if (js[i] === '\n') {
        lines.push(indentStr + ' '.repeat(depth * 2))
      }
      i++
      continue
    }

    // 处理注释
    if (js.slice(i, i + 2) === '//') {
      const end = js.indexOf('\n', i)
      const comment = end !== -1 ? js.slice(i, end) : js.slice(i)
      lines.push(indentStr + ' '.repeat(depth * 2) + comment)
      i = end !== -1 ? end : js.length
      continue
    }

    // 处理字符串（避免特殊字符干扰）
    if (js[i] === '"' || js[i] === "'" || js[i] === '`') {
      const quote = js[i]
      let str = quote
      i++
      while (i < js.length && js[i] !== quote) {
        if (js[i] === '\\' && i + 1 < js.length) {
          str += js[i] + js[i + 1]
          i += 2
        } else {
          str += js[i]
          i++
        }
      }
      str += js[i] || ''
      i++
      lines.push(indentStr + ' '.repeat(depth * 2) + str)
      continue
    }

    const ch = js[i]

    // 处理大括号
    if (ch === '{' || ch === '}' || ch === ';' || ch === ',') {
      if (ch !== ',') {
        if (ch === '{') depth++
        else if (ch === '}') depth = Math.max(0, depth - 1)
      }
      lines.push(indentStr + ' '.repeat(depth * 2) + ch)
      i++
      continue
    }

    // 处理括号（不改变缩进）
    if (ch === '(' || ch === ')') {
      lines.push(indentStr + ' '.repeat(depth * 2) + ch)
      i++
      continue
    }

    // 收集标识符/关键字
    let token = ''
    while (i < js.length && !/[\s;{},()"'`]+/.test(js[i])) {
      token += js[i]
      i++
    }
    if (token.trim()) {
      lines.push(indentStr + ' '.repeat(depth * 2) + token)
    }
  }

  // 清理空行并过滤
  return lines.filter((line) => line.trim() !== '').join('\n')
}

/**
 * 格式化 HTML（美化输出）
 * 每级缩进 2 个空格
 */
export function beautifyHtml(html: string): string {
  try {
    // 提取 head 和 body 内容分别格式化
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

    let result = html

    // 如果能找到 head 和 body，分开处理
    if (headMatch && bodyMatch) {
      const headContent = headMatch[1]
      const bodyContent = bodyMatch[1]
      const doctype = html.match(/<!DOCTYPE[^>]*>/i)?.[0] || ''
      const htmlAttrs = html.match(/<html([^>]*)>/i)?.[1] || ''

      const formattedHead = formatHtmlContent(headContent, 2)
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n')

      const formattedBody = formatHtmlContent(bodyContent, 2)
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n')

      result = `${doctype}
<html${htmlAttrs}>
  <head>
${formattedHead}
  </head>
  <body>
${formattedBody}
  </body>
</html>`
    } else {
      result = formatHtmlContent(html, 0)
    }

    return result.trim()
  } catch {
    // 回退到简单格式化
    return html
      .replace(/></g, '>\n<')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
  }
}

/**
 * 压缩 HTML（移除空白和注释）
 */
export function minifyHtml(html: string): string {
  return (
    html
      // 移除 HTML 注释
      .replace(/<!--[\s\S]*?-->/g, '')
      // 移除多余的空白
      .replace(/\s+/g, ' ')
      // 移除标签间不必要的空白
      .replace(/>\s+</g, '><')
      // 清理属性间的多余空格
      .replace(/\s+([\w-]+)="([^"]*)"/g, ' $1="$2"')
      .replace(/([\w-]+)="([^"]*)"\s+/g, '$1="$2" ')
      .trim()
  )
}

/**
 * 下载单个 HTML 文件
 */
export function downloadHtml(html: string, fileName: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, fileName)
}

/**
 * 打包下载 HTML 文件（格式化版 + 压缩版）
 */
export async function downloadHtmlPackage(
  formattedHtml: string,
  minifiedHtml: string,
  projectName: string,
): Promise<void> {
  const zip = new JSZip()

  // 添加格式化版本
  zip.file(`${projectName}.html`, beautifyHtml(formattedHtml))

  // 添加压缩版本
  zip.file(`${projectName}_minified.html`, minifyHtml(minifiedHtml))

  // 生成 zip 包并下载
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${projectName}.zip`)
}
