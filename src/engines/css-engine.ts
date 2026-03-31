export function validateCss(css: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const cssStr = typeof css === 'string' ? css : String(css)
  if (!cssStr || cssStr.trim().length === 0) {
    return { valid: true, errors: [] }
  }

  // Basic CSS syntax checks
  const openBraces = (cssStr.match(/\{/g) || []).length
  const closeBraces = (cssStr.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push(`花括号不匹配: { 有 ${openBraces} 个, } 有 ${closeBraces} 个`)
  }

  // Check for obvious errors
  if (cssStr.includes('@import') && !cssStr.includes('url(')) {
    errors.push('@import 必须包含 url()')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function wrapCss(css: string): string {
  const cssStr = typeof css === 'string' ? css : String(css)
  if (!cssStr || cssStr.trim().length === 0) return ''
  return cssStr.trim()
}
