import Dexie, { type Table } from 'dexie'
import type { Project } from '@/types'

interface ThemePreference {
  id: string
  mode: 'light' | 'dark' | 'system'
}

class TemplateGeneratorDB extends Dexie {
  projects!: Table<Project>
  preferences!: Table<ThemePreference>

  constructor() {
    super('TemplateGeneratorDB')
    this.version(1).stores({
      projects: 'id, name, status, updatedAt, createdAt',
      preferences: 'id',
    })
  }
}

export const db = new TemplateGeneratorDB()

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

export async function saveProject(project: Project): Promise<void> {
  try {
    // 使用 JSON 序列化来深拷贝,避免循环引用
    const cloned = JSON.parse(JSON.stringify(project))
    await db.projects.put(cloned)
  } catch (error) {
    console.error('Failed to save project:', error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id)
}

export async function getThemePreference(): Promise<string> {
  const pref = await db.preferences.get('theme')
  return pref?.mode ?? 'dark'
}

export async function saveThemePreference(mode: 'light' | 'dark' | 'system'): Promise<void> {
  await db.preferences.put({ id: 'theme', mode })
}
