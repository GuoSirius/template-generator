import { describe, it, expect } from 'vitest'
import { compileSnippetByType, renderSnippets, renderSnippetsByFolder } from '@/composables/use-preview'
import type { SnippetConfig, SnippetInstance } from '@/types'
import { createDefaultSpacing } from '@/types'

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

function makeProperties(overrides = {}) {
  return {
    placeholder: 'placeholder:hero',
    className: 'hero-banner',
    spacing: createDefaultSpacing(),
    ...overrides,
  }
}

function makeConfig(overrides: Partial<SnippetConfig> = {}): SnippetConfig {
  return {
    className: 'test-snippet',
    defaultPlaceholder: 'hero',
    defaults: { spacing: createDefaultSpacing() },
    formSchema: { type: 'object', groups: [] },
    sampleData: { title: 'Sample Title', desc: 'Sample Desc' },
    ...overrides,
  }
}

function makeInstance(overrides: Partial<SnippetInstance> = {}): SnippetInstance {
  return {
    id: 'inst-1',
    snippetId: 'hero-banner',
    enabled: true,
    data: { title: 'User Title', desc: 'User Desc' },
    properties: makeProperties(),
    sortOrder: 0,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// compileSnippetByType
// ---------------------------------------------------------------------------

describe('compileSnippetByType', () => {
  const html = '<h1><%= title %></h1>'
  const properties = makeProperties()

  it('should compile object type by spreading data', () => {
    const result = compileSnippetByType(html, { title: 'Hello' }, properties, 'object')
    expect(result).toBe('<h1>Hello</h1>')
  })

  it('should compile array type by wrapping in { features }', () => {
    const arrayHtml = '<% features.forEach(function(f) { %><li><%= f.name %></li><% }) %>'
    const data = [{ name: 'A' }, { name: 'B' }]
    const result = compileSnippetByType(arrayHtml, data, properties, 'array')
    expect(result).toContain('<li>A</li>')
    expect(result).toContain('<li>B</li>')
  })

  it('should compile objectWithList type by spreading data', () => {
    const result = compileSnippetByType(html, { title: 'Test' }, properties, 'objectWithList')
    expect(result).toBe('<h1>Test</h1>')
  })

  it('should wrap non-array data as single-element array for array type', () => {
    const arrayHtml = '<% features.forEach(function(f) { %><li><%= f.name %></li><% }) %>'
    const result = compileSnippetByType(arrayHtml, { name: 'Only' }, properties, 'array')
    expect(result).toContain('<li>Only</li>')
  })

  it('should pass properties to template', () => {
    const htmlWithProps = '<div class="<%= properties.className %>"><%= title %></div>'
    const result = compileSnippetByType(htmlWithProps, { title: 'Test' }, makeProperties({ className: 'test-class' }), 'object')
    expect(result).toContain('class="test-class"')
    expect(result).toContain('Test')
  })
})

// ---------------------------------------------------------------------------
// renderSnippets
// ---------------------------------------------------------------------------

describe('renderSnippets', () => {
  const configs = new Map<string, SnippetConfig>()
  configs.set('hero-banner', makeConfig())

  const getHtml = () =>
    '<div class="hero-section"><%= title %></div>'

  it('should render snippets with resolved data', () => {
    const instances = [makeInstance()]
    const result = renderSnippets(instances, configs, getHtml)
    expect(result).toHaveLength(1)
    expect(result[0].html).toContain('User Title')
  })

  it('should use sample data when instance data is empty', () => {
    const instance = makeInstance({ data: {} })
    const result = renderSnippets([instance], configs, getHtml)
    expect(result[0].html).toContain('Sample Title')
  })

  it('should skip instances with no HTML', () => {
    const getEmptyHtml = () => ''
    const result = renderSnippets([makeInstance()], configs, getEmptyHtml)
    expect(result).toHaveLength(0)
  })

  it('should pass properties to template', () => {
    const htmlWithProps = '<div class="<%= properties.className %>"><%= title %></div>'
    const getHtmlWithProps = () => htmlWithProps
    const result = renderSnippets([makeInstance()], configs, getHtmlWithProps)
    expect(result[0].html).toContain('class="hero-banner"')
  })
})

// ---------------------------------------------------------------------------
// renderSnippetsByFolder
// ---------------------------------------------------------------------------

describe('renderSnippetsByFolder', () => {
  const configs = new Map<string, SnippetConfig>()
  configs.set('hero-banner', makeConfig())

  const getHtml = (folder: string) =>
    folder === 'hero-banner'
      ? '<div class="hero-section"><%= title %></div>'
      : ''

  it('should render snippets by folder', () => {
    const result = renderSnippetsByFolder(['hero-banner'], configs, getHtml)
    expect(result).toHaveLength(1)
    expect(result[0].placeholder).toBe('placeholder:hero')
    expect(result[0].html).toContain('Sample Title')
  })

  it('should skip folders with no HTML', () => {
    const result = renderSnippetsByFolder(['non-existent'], configs, getHtml)
    expect(result).toHaveLength(0)
  })

  it('should handle empty folder list', () => {
    expect(renderSnippetsByFolder([], configs, getHtml)).toHaveLength(0)
  })

  it('should pass properties to template', () => {
    const testConfigs = new Map<string, SnippetConfig>()
    testConfigs.set('test-folder', makeConfig({
      className: 'test-class',
      defaultPlaceholder: 'test',
    }))
    const getHtmlWithProps = () => '<div class="<%= properties.className %>"><%= title %></div>'

    const result = renderSnippetsByFolder(['test-folder'], testConfigs, getHtmlWithProps)
    expect(result[0].html).toContain('class="test-class"')
    expect(result[0].html).toContain('Sample Title')
  })
})
