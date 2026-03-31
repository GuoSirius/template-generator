import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, SnippetInstance, SeoInfo } from '@/types'
import { createDefaultSpacing, createDefaultSeo, createSnippetProperties } from '@/types'
import {
  getAllProjects,
  getProjectById,
  saveProject as dbSaveProject,
  deleteProject as dbDeleteProject,
} from '@/database'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)

  const sortedProjects = computed(() => {
    return [...projects.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const completedProjects = computed(() => sortedProjects.value.filter((p) => p.status === 'completed'))
  const draftProjects = computed(() => sortedProjects.value.filter((p) => p.status === 'draft'))

  const loadProjects = async () => {
    loading.value = true
    try {
      projects.value = await getAllProjects()
    } catch (e) {
      console.error('Failed to load projects:', e)
    } finally {
      loading.value = false
    }
  }

  const loadProject = async (id: string) => {
    loading.value = true
    try {
      const project = await getProjectById(id)
      if (project) {
        currentProject.value = project
      }
      return project
    } catch (e) {
      console.error('Failed to load project:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const createProject = (name: string, templateId: string): Project => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      templateId,
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
    currentProject.value = project
    projects.value.push(project)
    // 异步保存,不阻塞返回
    dbSaveProject(project).catch((e) => {
      console.error('Failed to save new project:', e)
    })
    return project
  }

  const updateCurrentProject = (updates: Partial<Project>) => {
    if (!currentProject.value) return
    Object.assign(currentProject.value, updates, { updatedAt: Date.now() })
    // 异步保存,不阻塞返回
    dbSaveProject(currentProject.value).catch((e) => {
      console.error('Failed to update project:', e)
    })
    const idx = projects.value.findIndex((p) => p.id === currentProject.value!.id)
    if (idx >= 0) {
      projects.value[idx] = { ...currentProject.value }
    }
  }

  const updateSeo = (seo: Partial<SeoInfo>) => {
    if (!currentProject.value) return
    currentProject.value.seo = { ...currentProject.value.seo, ...seo }
    updateCurrentProject({ seo: currentProject.value.seo })
  }

  const addSnippetInstance = (
    snippetId: string,
    snippetFolder: string,
    defaultPlaceholder: string,
  ): SnippetInstance => {
    if (!currentProject.value) throw new Error('No current project')
    const instance: SnippetInstance = {
      id: crypto.randomUUID(),
      snippetId,
      enabled: true,
      properties: createSnippetProperties(snippetFolder, defaultPlaceholder),
      data: {},
      sortOrder: currentProject.value.snippetInstances.length,
    }
    currentProject.value.snippetInstances.push(instance)
    updateCurrentProject({ snippetInstances: currentProject.value.snippetInstances })
    return instance
  }

  const updateSnippetInstance = (instanceId: string, updates: Partial<SnippetInstance>) => {
    if (!currentProject.value) return
    const idx = currentProject.value.snippetInstances.findIndex((s) => s.id === instanceId)
    if (idx >= 0) {
      Object.assign(currentProject.value.snippetInstances[idx], updates)
      updateCurrentProject({ snippetInstances: currentProject.value.snippetInstances })
    }
  }

  const removeSnippetInstance = (instanceId: string) => {
    if (!currentProject.value) return
    currentProject.value.snippetInstances = currentProject.value.snippetInstances.filter(
      (s) => s.id !== instanceId,
    )
    updateCurrentProject({ snippetInstances: currentProject.value.snippetInstances })
  }

  const reorderSnippetInstances = (instances: SnippetInstance[]) => {
    if (!currentProject.value) return
    currentProject.value.snippetInstances = instances.map((inst, idx) => ({
      ...inst,
      sortOrder: idx,
    }))
    updateCurrentProject({ snippetInstances: currentProject.value.snippetInstances })
  }

  const duplicateSnippetInstance = (instanceId: string): SnippetInstance | null => {
    if (!currentProject.value) return null
    const sourceIndex = currentProject.value.snippetInstances.findIndex((s) => s.id === instanceId)
    if (sourceIndex === -1) return null
    const source = currentProject.value.snippetInstances[sourceIndex]
    const copy: SnippetInstance = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      sortOrder: source.sortOrder + 0.5, // 放在原项后面
    }
    // 在源项后面插入
    currentProject.value.snippetInstances.splice(sourceIndex + 1, 0, copy)
    // 重新排序 sortOrder
    currentProject.value.snippetInstances.forEach((inst, idx) => {
      inst.sortOrder = idx
    })
    updateCurrentProject({ snippetInstances: currentProject.value.snippetInstances })
    return copy
  }

  const setSelectedSnippet = (snippetId: string | null) => {
    if (!currentProject.value) return
    currentProject.value.lastSelectedSnippetId = snippetId
    updateCurrentProject({ lastSelectedSnippetId: snippetId })
  }

  const setSnippetTab = (snippetId: string, tab: 'props' | 'data') => {
    if (!currentProject.value) return
    currentProject.value.snippetTabs[snippetId] = tab
    updateCurrentProject({ snippetTabs: { ...currentProject.value.snippetTabs } })
  }

  const setStep = (step: 1 | 2) => {
    if (!currentProject.value) return
    currentProject.value.currentStep = step
    updateCurrentProject({ currentStep: step })
  }

  const setCustomCss = (css: string) => {
    updateCurrentProject({ customCss: css })
  }

  const setCustomJs = (js: string) => {
    updateCurrentProject({ customJs: js })
  }

  const completeProject = () => {
    if (!currentProject.value) return
    updateCurrentProject({ status: 'completed' })
  }

  const deleteProject = async (id: string) => {
    await dbDeleteProject(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    if (currentProject.value?.id === id) {
      currentProject.value = null
    }
  }

  const duplicateProject = async (id: string): Promise<Project | null> => {
    const source = projects.value.find((p) => p.id === id)
    if (!source) return null
    const copy: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      name: `${source.name} (副本)`,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await dbSaveProject(copy)
    projects.value.push(copy)
    currentProject.value = copy
    return copy
  }

  const saveCurrentProject = async () => {
    if (!currentProject.value) return
    currentProject.value.updatedAt = Date.now()
    await dbSaveProject(currentProject.value)
    const idx = projects.value.findIndex((p) => p.id === currentProject.value!.id)
    if (idx >= 0) {
      projects.value[idx] = { ...currentProject.value }
    }
  }

  return {
    projects,
    currentProject,
    loading,
    sortedProjects,
    completedProjects,
    draftProjects,
    loadProjects,
    loadProject,
    createProject,
    updateCurrentProject,
    updateSeo,
    addSnippetInstance,
    updateSnippetInstance,
    removeSnippetInstance,
    reorderSnippetInstances,
    duplicateSnippetInstance,
    setSelectedSnippet,
    setSnippetTab,
    setStep,
    setCustomCss,
    setCustomJs,
    completeProject,
    deleteProject,
    duplicateProject,
    saveCurrentProject,
  }
})
