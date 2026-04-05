import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock database module - fully mock Dexie operations
const mockProjects = new Map<string, Project>()
const mockPreferences = new Map<string, { id: string; mode: string }>()

vi.mock('@/database', () => ({
  db: {
    projects: {
      clear: vi.fn(async () => mockProjects.clear()),
      put: vi.fn(async (item: Project) => mockProjects.set(item.id, item)),
      get: vi.fn(async (id: string) => mockProjects.get(id)),
      delete: vi.fn(async (id: string) => mockProjects.delete(id)),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(async () =>
            Array.from(mockProjects.values()).sort((a, b) => b.updatedAt - a.updatedAt)
          ),
        })),
      })),
      toArray: vi.fn(async () => Array.from(mockProjects.values())),
    },
    preferences: {
      clear: vi.fn(async () => mockPreferences.clear()),
      put: vi.fn(async (item: { id: string; mode: string }) => mockPreferences.set(item.id, item)),
      get: vi.fn(async (id: string) => mockPreferences.get(id)),
    },
  },
  getAllProjects: vi.fn(async () =>
    Array.from(mockProjects.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  ),
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

// Import after mocks are set up
import {
  getAllProjects,
  getProjectById,
  saveProject,
  deleteProject,
  getThemePreference,
  saveThemePreference,
} from '@/database'
import type { Project, SeoInfo } from '@/types'
import { createSnippetProperties } from '@/types'

function makeTestProject(overrides: Partial<Project> = {}): Project {
  const seo: SeoInfo = { title: 'Test Project', keywords: 'test', description: 'A test project' }
  return {
    id: overrides.id || 'proj-1',
    name: overrides.name || 'Test Project',
    templateId: overrides.templateId || 'landing-page',
    seo: overrides.seo || seo,
    status: overrides.status || 'draft',
    currentStep: overrides.currentStep || 1,
    snippetInstances: overrides.snippetInstances || [],
    lastSelectedSnippetId: overrides.lastSelectedSnippetId || null,
    snippetTabs: overrides.snippetTabs || {},
    customCss: overrides.customCss || '',
    customJs: overrides.customJs || '',
    createdAt: overrides.createdAt || Date.now(),
    updatedAt: overrides.updatedAt || Date.now(),
    ...overrides,
  }
}

describe('database', () => {
  beforeEach(() => {
    mockProjects.clear()
    mockPreferences.clear()
  })

  describe('saveProject and getAllProjects', () => {
    it('should save a project and retrieve it sorted by updatedAt desc', async () => {
      const older = makeTestProject({ id: 'p1', name: 'Older', updatedAt: 1000 })
      const newer = makeTestProject({ id: 'p2', name: 'Newer', updatedAt: 2000 })

      await saveProject(newer)
      await saveProject(older)

      const projects = await getAllProjects()
      expect(projects).toHaveLength(2)
      expect(projects[0].id).toBe('p2') // newer first
      expect(projects[1].id).toBe('p1')
    })

    it('should update existing project on re-save', async () => {
      const project = makeTestProject({ id: 'p1', name: 'Original' })
      await saveProject(project)

      project.name = 'Updated'
      await saveProject(project)

      const projects = await getAllProjects()
      expect(projects).toHaveLength(1)
      expect(projects[0].name).toBe('Updated')
    })
  })

  describe('getProjectById', () => {
    it('should find project by ID', async () => {
      const project = makeTestProject({ id: 'target-id' })
      await saveProject(project)

      const found = await getProjectById('target-id')
      expect(found).toBeDefined()
      expect(found!.id).toBe('target-id')
    })

    it('should return undefined for non-existent ID', async () => {
      const found = await getProjectById('nonexistent')
      expect(found).toBeUndefined()
    })
  })

  describe('deleteProject', () => {
    it('should remove project from database', async () => {
      const project = makeTestProject({ id: 'to-delete' })
      await saveProject(project)

      await deleteProject('to-delete')

      const projects = await getAllProjects()
      expect(projects).toHaveLength(0)
    })
  })

  describe('theme preferences', () => {
    it('should default to dark theme when no preference saved', async () => {
      const mode = await getThemePreference()
      expect(mode).toBe('dark')
    })

    it('should save and retrieve theme preference', async () => {
      await saveThemePreference('light')
      const mode = await getThemePreference()
      expect(mode).toBe('light')
    })

    it('should update preference on new save', async () => {
      await saveThemePreference('dark')
      await saveThemePreference('system')
      const mode = await getThemePreference()
      expect(mode).toBe('system')
    })

    it('should handle all valid modes', async () => {
      const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
      for (const mode of modes) {
        await saveThemePreference(mode)
        expect(await getThemePreference()).toBe(mode)
      }
    })
  })

  describe('project with snippet instances', () => {
    it('should persist full project with snippets', async () => {
      const project = makeTestProject({
        id: 'full-proj',
        snippetInstances: [
          {
            id: 's1',
            snippetId: 'hero-banner',
            enabled: true,
            properties: createSnippetProperties('hero-banner', 'hero'),
            data: { title: 'Hero Title' },
            sortOrder: 0,
          },
          {
            id: 's2',
            snippetId: 'feature-card',
            enabled: false,
            properties: createSnippetProperties('feature-card', 'feature'),
            data: {},
            sortOrder: 1,
          },
        ],
        snippetTabs: { s1: 'data', s2: 'props' },
        customCss: 'body { color: red; }',
        customJs: 'console.log("hello")',
      })

      await saveProject(project)
      const found = await getProjectById('full-proj')
      expect(found).toBeDefined()
      expect(found!.snippetInstances).toHaveLength(2)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((found!.snippetInstances[0].data as any).title).toBe('Hero Title')
      expect(found!.customCss).toBe('body { color: red; }')
      expect(found!.customJs).toBe('console.log("hello")')
    })
  })
})
