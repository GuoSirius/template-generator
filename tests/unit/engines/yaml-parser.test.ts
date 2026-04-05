import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadYaml, loadHtml, clearCache } from '@/engines/yaml-parser'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('yaml-parser', () => {
  beforeEach(() => {
    clearCache()
    vi.clearAllMocks()
  })

  describe('loadYaml', () => {
    it('should fetch and parse YAML data', async () => {
      // Note: loadYaml uses js-yaml.load which expects YAML format
      // We need to return valid YAML
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`name: test\nversion: "1.0.0"`),
      })

      const result = await loadYaml<{ name: string; version: string }>('test.yaml')
      expect(result.name).toBe('test')
      expect(result.version).toBe('1.0.0')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should cache results for same URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`name: cached\ntest: value`),
      })

      await loadYaml<{ name: string }>('cached.yaml')
      await loadYaml<{ name: string }>('cached.yaml')

      // Second call should use cache, not fetch
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(loadYaml('missing.yaml')).rejects.toThrow(
        'Failed to load YAML: missing.yaml (404)',
      )
    })

    it('should prepend BASE_URL for relative URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('key: value'),
      })

      await loadYaml('relative/path.yaml')

      const calledUrl = (mockFetch.mock.calls[0] as string[])[0]
      expect(calledUrl).toContain('relative/path.yaml')
    })
  })

  describe('loadHtml', () => {
    it('should fetch HTML content', async () => {
      const html = '<div>test</div>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(html),
      })

      const result = await loadHtml('template.html')
      expect(result).toBe(html)
    })

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(loadHtml('error.html')).rejects.toThrow('Failed to load HTML: error.html (500)')
    })
  })

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('key: value'),
      })

      await loadYaml('to-clear.yaml')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      clearCache()

      await loadYaml('to-clear.yaml')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
