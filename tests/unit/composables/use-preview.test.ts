import { describe, it, expect } from 'vitest'
import { compileSnippetByType, renderSnippets, renderSnippetsByFolder } from '@/composables/use-preview'
import type { SnippetConfig, SnippetInstance } from '@/types'
import { createDefaultSpacing } from '@/types'

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<SnippetConfig> = {}): SnippetConfig {
  return {
    className: 'test-snippet',
    defaultPlaceholder: 'placeholder:hero',
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
    properties: {
      placeholder: 'placeholder:hero',
      className: 'hero-banner',
      spacing: createDefaultSpacing(),
    },
    sortOrder: 0,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// compileSnippetByType
// ---------------------------------------------------------------------------

describe('compileSnippetByType', () => {
  const html = '<h1><%= title %></h1>'

  it('should compile object type by spreading data', () => {
    const result = compileSnippetByType(html, { title: 'Hello' }, 'object')
    expect(result).toBe('<h1>Hello</h1>')
  })

  it('should compile array type by wrapping in { features }', () => {
    const arrayHtml = '<% features.forEach(function(f) { %><li><%= f.name %></li><% }) %>'
    const data = [{ name: 'A' }, { name: 'B' }]
    const result = compileSnippetByType(arrayHtml, data, 'array')
    expect(result).toContain('<li>A</li>')
    expect(result).toContain('<li>B</li>')
  })

  it('should compile objectWithList type by spreading data', () => {
    const result = compileSnippetByType(html, { title: 'Test' }, 'objectWithList')
    expect(result).toBe('<h1>Test</h1>')
  })

  it('should wrap non-array data as single-element array for array type', () => {
    const arrayHtml = '<% features.forEach(function(f) { %><li><%= f.name %></li><% }) %>'
    const result = compileSnippetByType(arrayHtml, { name: 'Only' }, 'array')
    expect(result).toContain('<li>Only</li>')
  })
})

// ---------------------------------------------------------------------------
// renderSnippets
// ---------------------------------------------------------------------------

describe('renderSnippets', () => {
  const configs = new Map<string, SnippetConfig>()
  configs.set('hero-banner', makeConfig({
    formSchema: { type: 'object', groups: [] },
  }))
  configs.set('features-list', makeConfig({
    className: 'features-list',
    defaultPlaceholder: 'placeholder:features',
    formSchema: { type: 'array', groups: [] },
    sampleData: [{ name: 'F1' }, { name: 'F2' }],
  }))

  const getHtml = (id: string) => {
    if (id === 'hero-banner') return '<h1><%= title %></h1>'
    if (id === 'features-list') return '<% features.forEach(function(f) { %><p><%= f.name %></p><% }) %>'
    return ''
  }

  it('should render enabled snippet instances', () => {
    const instances = [makeInstance()]
    const result = renderSnippets(instances, configs, getHtml)

    expect(result).toHaveLength(1)
    expect(result[0].placeholder).toBe('placeholder:hero')
    expect(result[0].html).toContain('User Title')
    expect(result[0].html).toContain('class="hero-banner"')
  })

  it('should render disabled instances (caller is responsible for filtering)', () => {
    const instances = [makeInstance({ enabled: false })]
    const result = renderSnippets(instances, configs, getHtml)
    // renderSnippets itself does not filter by enabled; the caller (buildCurrentRenderedSnippets) does
    expect(result).toHaveLength(1)
  })

  it('should skip instances with no HTML', () => {
    const instances = [makeInstance({ snippetId: 'unknown' })]
    const result = renderSnippets(instances, configs, getHtml)
    expect(result).toHaveLength(0)
  })

  it('should fall back to sampleData when user data is empty', () => {
    const instances = [makeInstance({ data: {} })]
    const result = renderSnippets(instances, configs, getHtml)

    expect(result).toHaveLength(1)
    expect(result[0].html).toContain('Sample Title')
  })

  it('should compile array type snippets correctly', () => {
    const instances = [makeInstance({
      snippetId: 'features-list',
      properties: {
        placeholder: 'placeholder:features',
        className: 'features-list',
        spacing: createDefaultSpacing(),
      },
      data: [{ name: 'Custom F1' }],
    })]
    const result = renderSnippets(instances, configs, getHtml)

    expect(result).toHaveLength(1)
    expect(result[0].html).toContain('Custom F1')
    expect(result[0].html).toContain('class="features-list"')
  })

  it('should handle multiple instances', () => {
    const instances = [
      makeInstance({ id: 'inst-1' }),
      makeInstance({
        id: 'inst-2',
        snippetId: 'features-list',
        properties: {
          placeholder: 'placeholder:features',
          className: 'features-list',
          spacing: createDefaultSpacing(),
        },
      }),
    ]
    const result = renderSnippets(instances, configs, getHtml)
    expect(result).toHaveLength(2)
  })

  it('should return empty array for empty input', () => {
    expect(renderSnippets([], configs, getHtml)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// renderSnippetsByFolder
// ---------------------------------------------------------------------------

describe('renderSnippetsByFolder', () => {
  const configs = new Map<string, SnippetConfig>()
  configs.set('hero-banner', makeConfig({
    className: 'hero-section',
    defaultPlaceholder: 'placeholder:hero',
    formSchema: { type: 'object', groups: [] },
    sampleData: { title: 'Hero Title' },
  }))

  const getHtml = (id: string) => {
    if (id === 'hero-banner') return '<h1><%= title %></h1>'
    return ''
  }

  it('should render snippets by folder using sampleData', () => {
    const result = renderSnippetsByFolder(['hero-banner'], configs, getHtml)

    expect(result).toHaveLength(1)
    expect(result[0].placeholder).toBe('placeholder:hero')
    expect(result[0].html).toContain('Hero Title')
    expect(result[0].html).toContain('class="hero-section"')
  })

  it('should skip folders with no HTML', () => {
    const result = renderSnippetsByFolder(['non-existent'], configs, getHtml)
    expect(result).toHaveLength(0)
  })

  it('should handle empty folder list', () => {
    expect(renderSnippetsByFolder([], configs, getHtml)).toHaveLength(0)
  })

  it('should use folder name as className when config has none', () => {
    const minimalConfigs = new Map<string, SnippetConfig>()
    minimalConfigs.set('my-folder', makeConfig({
      className: '',
      defaultPlaceholder: '',
      formSchema: { type: 'object', groups: [] },
    }))
    const getHtmlMinimal = () => '<p>test</p>'

    const result = renderSnippetsByFolder(['my-folder'], minimalConfigs, getHtmlMinimal)
    expect(result[0].html).toContain('class="my-folder"')
  })
})
