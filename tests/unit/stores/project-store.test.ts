import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock the entire database module before importing store
const mockProjects = new Map<string, Project>()
const mockPreferences = new Map<string, { id: string; mode: string }>()

vi.mock('@/database', () => ({
  getAllProjects: vi.fn(async () => Array.from(mockProjects.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  )),
  getProjectById: vi.fn(async (id: string) => mockProjects.get(id)),
  saveProject: vi.fn(async (project: Project) => {
    const cloned = JSON.parse(JSON.stringify(project))
    mockProjects.set(cloned.id, cloned)
  }),
  deleteProject: vi.fn(async (id: string) => { mockProjects.delete(id) }),
  getThemePreference: vi.fn(async () => {
    const pref = mockPreferences.get('theme')
    return pref?.mode ?? 'dark'
  }),
  saveThemePreference: vi.fn(async (mode: string) => {
    mockPreferences.set('theme', { id: 'theme', mode })
  }),
}))

import { useProjectStore } from '@/stores/project'
import type { Project } from '@/types'
import { createDefaultSeo } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _makeTestProject(overrides: Partial<Project> & { id: string; name: string; templateId: string }): Project {
  return {
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
    ...overrides,
  }
}

describe('useProjectStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    mockProjects.clear()
    mockPreferences.clear()
  })

  describe('createProject', () => {
    it('should create a new project with defaults', () => {
      const store = useProjectStore()
      const project = store.createProject('My Test Project', 'landing-page')
      
      expect(project.name).toBe('My Test Project')
      expect(project.templateId).toBe('landing-page')
      expect(project.status).toBe('draft')
      expect(project.currentStep).toBe(1)
      expect(project.snippetInstances).toHaveLength(0)
      expect(project.id).toBeDefined()
      expect(store.currentProject).toEqual(project)
    })

    it('should add project to projects list', () => {
      const store = useProjectStore()
      store.createProject('Project A', 'template-a')
      store.createProject('Project B', 'template-b')
      
      expect(store.projects).toHaveLength(2)
    })
  })

  describe('updateCurrentProject', () => {
    it('should update currentProject properties', () => {
      const store = useProjectStore()
      store.createProject('Original', 't1')
      
      store.updateCurrentProject({ name: 'Updated Name' })
      
      expect(store.currentProject!.name).toBe('Updated Name')
    })

    it('should not throw when no current project', () => {
      const store = useProjectStore()
      expect(() => store.updateCurrentProject({ name: 'test' })).not.toThrow()
    })
  })

  describe('updateSeo', () => {
    it('should update SEO fields', () => {
      const store = useProjectStore()
      store.createProject('SEO Test', 't1')
      
      store.updateSeo({
        title: 'SEO Title',
        keywords: 'kw1, kw2',
        description: 'Meta description',
      })
      
      expect(store.currentProject!.seo.title).toBe('SEO Title')
      expect(store.currentProject!.seo.keywords).toBe('kw1, kw2')
      expect(store.currentProject!.seo.description).toBe('Meta description')
    })
  })

  describe('addSnippetInstance', () => {
    it('should add a new snippet instance to current project', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      
      const instance = store.addSnippetInstance(
        'hero-banner',
        'hero-banner',
        'hero-section',
      )
      
      expect(instance.id).toBeDefined()
      expect(instance.snippetId).toBe('hero-banner')
      expect(instance.enabled).toBe(true)
      expect(instance.properties.placeholder).toBe('placeholder:hero-section')
      expect(store.currentProject!.snippetInstances).toHaveLength(1)
    })

    it('should increment sortOrder for each new instance', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      
      const inst1 = store.addSnippetInstance('s1', 's1', 'p1')
      const inst2 = store.addSnippetInstance('s2', 's2', 'p2')
      
      expect(inst2.sortOrder).toBeGreaterThan(inst1.sortOrder)
    })

    it('should throw error when no current project', () => {
      const store = useProjectStore()
      expect(() => store.addSnippetInstance('s1', 's1', 'p1')).toThrow('No current project')
    })
  })

  describe('updateSnippetInstance', () => {
    it('should update existing snippet instance properties', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      const instance = store.addSnippetInstance('s1', 's1', 'p1')
      
      store.updateSnippetInstance(instance.id, {
        enabled: false,
        data: { title: 'New Title' },
      })
      
      const updated = store.currentProject!.snippetInstances[0]
      expect(updated.enabled).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((updated.data as any).title).toBe('New Title')
    })
  })

  describe('removeSnippetInstance', () => {
    it('should remove snippet by ID', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      const inst = store.addSnippetInstance('s1', 's1', 'p1')
      
      expect(store.currentProject!.snippetInstances).toHaveLength(1)
      
      store.removeSnippetInstance(inst.id)
      expect(store.currentProject!.snippetInstances).toHaveLength(0)
    })
  })

  describe('reorderSnippetInstances', () => {
    it('should reorder instances and update sortOrder', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      const a = store.addSnippetInstance('a', 'a', 'pa')
      const b = store.addSnippetInstance('b', 'b', 'pb')
      const c = store.addSnippetInstance('c', 'c', 'pc')
      
      // Reverse order: c, b, a
      store.reorderSnippetInstances([c, b, a])
      
      expect(store.currentProject!.snippetInstances[0].id).toBe(c.id)
      expect(store.currentProject!.snippetInstances[0].sortOrder).toBe(0)
      expect(store.currentProject!.snippetInstances[1].sortOrder).toBe(1)
      expect(store.currentProject!.snippetInstances[2].sortOrder).toBe(2)
    })
  })

  describe('duplicateSnippetInstance', () => {
    it('should duplicate a snippet instance with new ID', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      const original = store.addSnippetInstance('s1', 's1', 'p1')
      
      const copy = store.duplicateSnippetInstance(original.id)
      
      expect(copy).not.toBeNull()
      expect(copy!.id).not.toBe(original.id)
      expect(copy!.snippetId).toBe(original.snippetId)
      expect(store.currentProject!.snippetInstances).toHaveLength(2)
    })

    it('should return null for non-existent ID', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      
      const result = store.duplicateSnippetInstance('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('setStep / completeProject', () => {
    it('should change step and mark as completed', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      
      store.setStep(2)
      expect(store.currentProject!.currentStep).toBe(2)
      
      store.completeProject()
      expect(store.currentProject!.status).toBe('completed')
    })
  })

  describe('setCustomCss / setCustomJs', () => {
    it('should set custom CSS and JS', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      
      store.setCustomCss('.test { color: red; }')
      expect(store.currentProject!.customCss).toBe('.test { color: red; }')
      
      store.setCustomJs('console.log(1)')
      expect(store.currentProject!.customJs).toBe('console.log(1)')
    })
  })

  describe('sortedProjects', () => {
    it('should sort projects by updatedAt descending', async () => {
      const store = useProjectStore()
      // Create projects - they will have different timestamps
      const p1 = store.createProject('First', 't1')
      
      // Small delay to ensure timestamp differs
      await new Promise((r) => setTimeout(r, 10))
      
      const p2 = store.createProject('Second', 't2')
      
      const sorted = store.sortedProjects
      expect(sorted[0].id).toBe(p2.id) // newer first
      expect(sorted[1].id).toBe(p1.id)
    })
  })

  describe('completedProjects / draftProjects', () => {
    it('should filter by status correctly', () => {
      const store = useProjectStore()
      store.createProject('Draft 1', 't1')
      const completed = store.createProject('Completed 1', 't2')
      store.completeProject()
      
      expect(store.completedProjects).toHaveLength(1)
      expect(store.draftProjects).toHaveLength(1)
      expect(store.completedProjects[0].id).toBe(completed.id)
    })
  })

  describe('setSelectedSnippet / setSnippetTab', () => {
    it('should set selected snippet and tab', () => {
      const store = useProjectStore()
      store.createProject('Test', 't1')
      store.addSnippetInstance('s1', 's1', 'p1')
      
      store.setSelectedSnippet('s1')
      expect(store.currentProject!.lastSelectedSnippetId).toBe('s1')
      
      store.setSnippetTab('s1', 'data')
      expect(store.currentProject!.snippetTabs['s1']).toBe('data')
    })
  })

  describe('deleteProject', async () => {
    it('should remove project and clear currentProject if active', async () => {
      const store = useProjectStore()
      store.createProject('To Delete', 't1')
      const id = store.currentProject!.id
      
      await store.deleteProject(id)
      
      expect(store.currentProject).toBeNull()
    })
  })
})
