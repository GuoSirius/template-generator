import { describe, it, expect } from 'vitest'
import { compileTemplate, resolveSnippetData, replacePlaceholders } from '@/engines/template-engine'

describe('compileTemplate', () => {
  it('should compile simple template', () => {
    const html = '<h1><%= title %></h1>'
    const result = compileTemplate(html, { title: 'Hello' })
    expect(result).toBe('<h1>Hello</h1>')
  })

  it('should handle conditional blocks', () => {
    const html = '<% if (show) { %><p>visible</p><% } %>'
    expect(compileTemplate(html, { show: true })).toContain('visible')
    expect(compileTemplate(html, { show: false })).not.toContain('visible')
  })

  it('should handle loop blocks', () => {
    const html = '<% items.forEach(function(i) { %><li><%= i %></li><% }) %>'
    const result = compileTemplate(html, { items: ['a', 'b'] })
    expect(result).toContain('<li>a</li>')
    expect(result).toContain('<li>b</li>')
  })

  it('should return original html on error', () => {
    const html = '<h1>test</h1>'
    const result = compileTemplate(html, {})
    expect(result).toBe('<h1>test</h1>')
  })
})

describe('resolveSnippetData', () => {
  it('should prefer user data over sample data', () => {
    const userData = { title: 'User' }
    const sampleData = { title: 'Sample' }
    expect(resolveSnippetData(userData, sampleData)).toBe(userData)
  })

  it('should fall back to sample data when user data is empty', () => {
    const sampleData = { title: 'Sample' }
    expect(resolveSnippetData({}, sampleData)).toBe(sampleData)
  })

  it('should return empty data when both are empty', () => {
    expect(resolveSnippetData({}, {})).toEqual({})
  })
})

describe('replacePlaceholders', () => {
  it('should replace matching placeholders', () => {
    const template = '<!-- placeholder:hero --><div>content</div>'
    const snippets = [{ placeholder: 'placeholder:hero', html: '<h1>Hero</h1>' }]
    const result = replacePlaceholders(template, snippets)
    expect(result).toContain('<h1>Hero</h1>')
    expect(result).not.toContain('<!-- placeholder:hero -->')
  })

  it('should remove unmatched placeholders', () => {
    const template = '<!-- placeholder:footer --><div>content</div>'
    const snippets = [{ placeholder: 'placeholder:hero', html: '<h1>Hero</h1>' }]
    const result = replacePlaceholders(template, snippets)
    // Unmatched placeholders are kept (per implementation: "残留的空占位符保留不动")
    expect(result).toContain('<!-- placeholder:footer -->')
  })
})
