import { describe, it, expect } from 'vitest'
import { validateCss, wrapCss } from '@/engines/css-engine'

describe('validateCss', () => {
  it('should return valid for empty CSS', () => {
    expect(validateCss('').valid).toBe(true)
    expect(validateCss('   ').valid).toBe(true)
  })

  it('should return valid for well-formed CSS', () => {
    const css = '.test { color: red; } .another { padding: 10px; }'
    expect(validateCss(css).valid).toBe(true)
  })

  it('should detect unmatched braces', () => {
    const css = '.test { color: red; '
    const result = validateCss(css)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should detect @import without url()', () => {
    const css = '@import "test";'
    const result = validateCss(css)
    expect(result.errors).toContain('@import 必须包含 url()')
  })
})

describe('wrapCss', () => {
  it('should return empty for empty input', () => {
    expect(wrapCss('')).toBe('')
    expect(wrapCss('   ')).toBe('')
  })

  it('should trim CSS', () => {
    expect(wrapCss('  .test {}  ')).toBe('.test {}')
  })
})
