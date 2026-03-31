import { describe, it, expect } from 'vitest'
import { compileTemplate, resolveSnippetData, buildSpacingStyle, wrapWithContainer, replacePlaceholders } from '@/engines/template-engine'

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

describe('buildSpacingStyle', () => {
  it('should build correct spacing style', () => {
    const spacing = {
      top: { value: 10, unit: 'px' },
      right: { value: 20, unit: 'px' },
      bottom: { value: 30, unit: 'px' },
      left: { value: 40, unit: 'px' },
    }
    expect(buildSpacingStyle(spacing)).toBe('margin: 10px 20px 30px 40px;')
  })

  it('should handle different units', () => {
    const spacing = {
      top: { value: 1, unit: 'rem' },
      right: { value: 50, unit: '%' },
      bottom: { value: 0, unit: 'px' },
      left: { value: 0, unit: 'px' },
    }
    expect(buildSpacingStyle(spacing)).toBe('margin: 1rem 50% 0px 0px;')
  })
})

describe('wrapWithContainer', () => {
  it('should wrap html with container div', () => {
    const html = '<p>content</p>'
    const result = wrapWithContainer(html, 'my-class', 'margin: 10px;')
    expect(result).toBe('<div class="my-class" style="margin: 10px;"><p>content</p></div>')
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
    expect(result).not.toContain('<!-- placeholder:footer -->')
  })
})
