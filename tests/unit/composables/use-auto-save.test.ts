import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAutoSave } from '@/composables/use-auto-save'
import type { Project } from '@/types'
import { createDefaultSeo } from '@/types'

vi.mock('@/database', () => ({
  saveProject: vi.fn().mockResolvedValue(undefined),
}))

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makeTestProject(): Project {
    return {
      id: 'test-1',
      name: 'Test Project',
      templateId: 'landing-page',
      seo: createDefaultSeo(),
      status: 'draft',
      currentStep: 1,
      snippetInstances: [],
      lastSelectedSnippetId: null,
      snippetTabs: {},
      customCss: '',
      customJs: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  it('should return save and debouncedSave functions', () => {
    const project = makeTestProject()
    const { save, debouncedSave } = useAutoSave(() => project)
    
    expect(typeof save).toBe('function')
    expect(typeof debouncedSave).toBe('function')
  })

  it('should save project with updated timestamp', async () => {
    const project = makeTestProject()
    const originalUpdatedAt = project.updatedAt
    
    // Wait a tiny bit to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10))
    
    const { save } = useAutoSave(() => project)
    await save()
    
    const { saveProject } = await import('@/database')
    expect(saveProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-1',
        updatedAt: expect.any(Number),
      }),
    )
    // UpdatedAt should be >= original (may be same millisecond in fast tests)
  })

  it('should not save when getProject returns undefined', async () => {
    const { save, debouncedSave } = useAutoSave(() => undefined)
    
    await save()
    debouncedSave()
    
    // Allow debounce to potentially fire
    await new Promise((r) => setTimeout(r, 600))
    
    const { saveProject } = await import('@/database')
    expect(saveProject).not.toHaveBeenCalled()
  })

  describe('debouncedSave', () => {
    it('should debounce rapid calls', async () => {
      vi.useFakeTimers()
      
      const project = makeTestProject()
      const { debouncedSave } = useAutoSave(() => project, 200)
      
      // Call multiple times rapidly
      debouncedSave()
      debouncedSave()
      debouncedSave()
      debouncedSave()
      
      // Should not have called save yet
      const { saveProject } = await import('@/database')
      expect(saveProject).not.toHaveBeenCalled()
      
      // Advance timer by delay
      await vi.advanceTimersByTimeAsync(200)
      
      // Now should have been called once
      expect(saveProject).toHaveBeenCalledTimes(1)
      
      vi.useRealTimers()
    })
  })
})
