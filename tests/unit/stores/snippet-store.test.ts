import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSnippetStore } from '@/stores/snippet'

// Mock yaml-parser module - hoisted by vitest
const mockGetSnippetsRegistry = vi.fn()
const mockGetSnippetConfig = vi.fn()
const mockGetSnippetHtml = vi.fn()

vi.mock('@/engines/yaml-parser', () => ({
  getSnippetsRegistry: () => mockGetSnippetsRegistry(),
  getSnippetConfig: (folder: string) => mockGetSnippetConfig(folder),
  getSnippetHtml: (folder: string) => mockGetSnippetHtml(folder),
}))

// Default successful implementations
function setupDefaultMocks() {
  mockGetSnippetsRegistry.mockResolvedValue({
    snippets: [
      {
        name: 'Hero Banner',
        version: '1.0.0',
        description: 'Hero section banner',
        thumbnail: 'hero-banner/thumbnail.png',
        folder: 'hero-banner',
        tags: ['hero', 'banner'],
      },
      {
        name: 'Feature Card',
        version: '1.0.0',
        description: 'Feature showcase card',
        thumbnail: 'feature-card/thumbnail.png',
        folder: 'feature-card',
        tags: ['feature', 'card'],
      },
    ],
  })
  mockGetSnippetConfig.mockImplementation((folder: string) =>
    Promise.resolve({
      className: folder,
      defaultPlaceholder: `placeholder:${folder}`,
      formSchema: { type: 'object', fields: [] },
      sampleData: { title: `${folder} Sample` },
      defaults: {},
    }),
  )
  mockGetSnippetHtml.mockImplementation((folder: string) =>
    Promise.resolve(`<div class="${folder}">Sample ${folder} HTML</div>`),
  )
}

describe('useSnippetStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    setupDefaultMocks()
  })

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const store = useSnippetStore()
      expect(store.snippets).toHaveLength(0)
      expect(store.configs.size).toBe(0)
      expect(store.htmlCache.size).toBe(0)
      expect(store.loading).toBe(false)
    })
  })

  describe('loadSnippets', () => {
    it('should load snippets registry into state', async () => {
      const store = useSnippetStore()
      await store.loadSnippets()

      expect(store.snippets).toHaveLength(2)
      expect(store.snippets[0].name).toBe('Hero Banner')
      expect(store.snippets[1].name).toBe('Feature Card')
    })

    it('should not reload if already loaded', async () => {
      const store = useSnippetStore()
      
      // First call loads data
      await store.loadSnippets()
      expect(store.snippets).toHaveLength(2)
      
      // Second call should be a no-op (guard: snippets.length > 0)
      // Note: the guard prevents re-fetching, so data stays unchanged
      const snapshot = [...store.snippets]
      await store.loadSnippets()
      expect(store.snippets.length).toBe(snapshot.length)
      expect(store.snippets[0].id).toBe(snapshot[0].id)
    })

    it('should handle loading errors gracefully', () => {
      mockGetSnippetsRegistry.mockRejectedValueOnce(new Error('Network error'))

      const store = useSnippetStore()
      return expect(store.loadSnippets()).resolves.toBeUndefined()
    })
  })

  describe('getSnippetMeta', () => {
    it('should find meta by folder name', async () => {
      const store = useSnippetStore()
      await store.loadSnippets()

      const meta = store.getSnippetMeta('hero-banner')
      expect(meta).toBeDefined()
      expect(meta!.name).toBe('Hero Banner')
    })

    it('should return undefined for unknown folder', async () => {
      const store = useSnippetStore()
      await store.loadSnippets()

      const meta = store.getSnippetMeta('nonexistent')
      expect(meta).toBeUndefined()
    })
  })

  describe('loadSnippetDetail', () => {
    it('should load both config and HTML for a folder', async () => {
      const store = useSnippetStore()

      const config = await store.loadSnippetDetail('hero-banner')

      expect(config).not.toBeNull()
      expect(config!.className).toBe('hero-banner')
      expect(config!.formSchema.type).toBe('object')
      expect(store.configs.has('hero-banner')).toBe(true)
      expect(store.getSnippetHtml('hero-banner')).toContain('hero-banner HTML')
    })

    it('should return cached config on subsequent calls', async () => {
      const store = useSnippetStore()

      const first = await store.loadSnippetDetail('hero-banner')
      const second = await store.loadSnippetDetail('hero-banner')

      expect(first).toEqual(second)
    })

    it('should return null on error loading config', async () => {
      mockGetSnippetConfig.mockRejectedValueOnce(new Error('Load failed'))

      const store = useSnippetStore()
      const result = await store.loadSnippetDetail('error-snippet')
      expect(result).toBeNull()
    })
  })

  describe('getCachedSnippetHtml (getSnippetHtml)', () => {
    it('should return empty string for uncached HTML', () => {
      const store = useSnippetStore()

      const html = store.getSnippetHtml('never-loaded')
      expect(html).toBe('')
    })

    it('should return cached HTML after loading detail', async () => {
      const store = useSnippetStore()
      await store.loadSnippetDetail('hero-banner')

      const html = store.getSnippetHtml('hero-banner')
      expect(html).toContain('hero-banner HTML')
    })
  })
})
