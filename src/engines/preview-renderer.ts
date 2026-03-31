export function buildPreviewHtml(
  content: string,
  customCss: string = '',
  seoTitle: string = '',
  seoDescription: string = '',
  seoKeywords: string = '',
  customJs: string = '',
): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoTitle ? `<title>${escapeHtml(seoTitle)}</title>` : ''}
  ${seoDescription ? `<meta name="description" content="${escapeHtml(seoDescription)}">` : ''}
  ${seoKeywords ? `<meta name="keywords" content="${escapeHtml(seoKeywords)}">` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    ${customCss}
  </style>
</head>
<body>
  ${content}
  ${customJs ? `<script>${customJs}<\/script>` : ''}
</body>
</html>`
}

export function buildSnippetPreviewHtml(
  snippetHtml: string,
  customCss: string = '',
): string {
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
