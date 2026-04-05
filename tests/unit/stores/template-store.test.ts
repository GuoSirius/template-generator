import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTemplateStore } from '@/stores/template'

// Mock yaml-parser module
vi.mock('@/engines/yaml-parser', () => ({
  getPagesRegistry: vi.fn().mockResolvedValue({
    templates: [
      {
        name: 'Landing Page',
        version: '1.0.0',
        description: 'Modern landing page template',
        thumbnail: 'landing-page/thumbnail.png',
        folder: 'landing-page',
      },
      {
        name: 'Product Page',
        version: '1.0.0',
        description: 'E-commerce product page',
        thumbnail: 'product-page/thumbnail.png',
        folder: 'product-page',
      },
    ],
  }),
  getTemplateConfig: vi.fn().mockImplementation((folder: string) =>
    Promise.resolve({
      name: `${folder} Config`,
      placeholders: [
        { name: 'hero', description: 'Hero section placeholder', default: '' },
        { name: 'footer', description: 'Footer section placeholder', default: '' },
      ],
    }),
  ),
  getTemplateHtml: vi.fn().mockImplementation((folder: string) =>
    Promise.resolve(`<!DOCTYPE html><html><head><title>${folder}</title></head><body><!-- placeholder:hero --><main>Content</main><!-- placeholder:footer --></body></html>`),
  ),
}))

describe('useTemplateStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const store = useTemplateStore()
      expect(store.templates).toHaveLength(0)
      expect(store.currentTemplate).toBeNull()
      expect(store.currentConfig).toBeNull()
      expect(store.currentHtml).toBe('')
      expect(store.loading).toBe(false)
    })
  })

  describe('loadTemplates', () => {
    it('should load templates into state', async () => {
      const store = useTemplateStore()
      await store.loadTemplates()
      
      expect(store.templates).toHaveLength(2)
      expect(store.templates[0].name).toBe('Landing Page')
      expect(store.templates[1].name).toBe('Product Page')
    })

    it('should not reload if already loaded', async () => {
      const store = useTemplateStore()
      await store.loadTemplates()
      await store.loadTemplates() // guarded by length check
      
      expect(store.templates).toHaveLength(2)
    })
  })

  describe('selectTemplate', () => {
    it('should load full template details (config + html)', async () => {
      const store = useTemplateStore()
      await store.loadTemplates()
      
      await store.selectTemplate('landing-page')
      
      expect(store.currentTemplate).not.toBeNull()
      expect(store.currentTemplate!.name).toBe('Landing Page')
      expect(store.currentConfig).not.toBeNull()
      expect(store.currentConfig!.placeholders).toHaveLength(2)
      expect(store.currentHtml).toContain('landing-page')
      expect(store.currentHtml).toContain('<!-- placeholder:hero -->')
    })

    it('should not select non-existent template', async () => {
      const store = useTemplateStore()
      await store.loadTemplates()
      
      await store.selectTemplate('nonexistent')
      expect(store.currentTemplate).toBeNull()
    })
  })

  describe('clearCurrent', () => {
    it('should reset all current selection state', async () => {
      const store = useTemplateStore()
      await store.loadTemplates()
      await store.selectTemplate('landing-page')
      
      expect(store.currentTemplate).not.toBeNull()
      
      store.clearCurrent()
      
      expect(store.currentTemplate).toBeNull()
      expect(store.currentConfig).toBeNull()
      expect(store.currentHtml).toBe('')
    })
  })

  describe('loading state', () => {
    it('should set loading during operations', async () => {
      const store = useTemplateStore()
      
      const loadPromise = store.loadTemplates()
      expect(store.loading).toBe(true) // or check after await
      
      await loadPromise
      expect(store.loading).toBe(false)
    })
  })
})
