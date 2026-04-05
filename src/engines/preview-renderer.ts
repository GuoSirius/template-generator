/**
 * 构建预览HTML - 在模板基础上添加自定义CSS/JS和片段内容
 * @param templateHtml 完整的模板HTML（包含<!DOCTYPE html>等）
 * @param bodyContent 替换占位符后的body内容
 * @param customCss 自定义CSS
 * @param seoTitle SEO标题（模板使用lodash模板语法处理）
 * @param seoDescription SEO描述（模板使用lodash模板语法处理）
 * @param seoKeywords SEO关键词（模板使用lodash模板语法处理）
 * @param customJs 自定义JavaScript
 */
export function buildPreviewHtml(
  templateHtml: string,
  bodyContent: string,
  customCss: string = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _seoTitle: string = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _seoDescription: string = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _seoKeywords: string = '',
  customJs: string = '',
): string {
  let html = templateHtml
  
  // 模板HTML使用lodash模板语法（如 <%= title %>），无需正则替换SEO标签
  
  // 1. 添加自定义CSS到head末尾（确保在所有其他style之后）
  if (customCss) {
    html = html.replace(/<\/head>/i, `\n  <style>\n    ${customCss}\n  </style>\n</head>`)
  }
  
  // 2. 替换body内容
  if (html.includes('<body')) {
    // 提取body开始标签和结束标签之间的内容
    html = html.replace(/<body[^>]*>[\s\S]*<\/body>/i, (match) => {
      // 保留body标签本身，只替换内容
      return match.replace(/<body[^>]*>([\s\S]*)<\/body>/i, () => {
        return `<body>${bodyContent}</body>`
      })
    })
  }
  
  // 3. 添加自定义JS到body末尾
  if (customJs) {
    html = html.replace(/<\/body>/i, `  <script>${customJs}</' + 'script>\n</body>`)
  }
  
  return html
}

/**
 * 构建片段预览HTML - 仅用于测试，实际应该使用buildPreviewHtml
 * @deprecated 使用buildPreviewHtml代替
 */
export function buildSnippetPreviewHtml(
  snippetHtml: string,
  customCss: string = '',
): string {
  // 创建一个简单的HTML结构用于片段预览
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; }
    ${customCss}
  </style>
</head>
<body>
  ${snippetHtml}
</body>
</html>`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
