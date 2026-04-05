import type { SnippetData, Spacing } from './snippet'

// Re-export Spacing and SnippetData for external consumers
export type { Spacing, SnippetData } from './snippet'

export interface SnippetProperties {
  placeholder: string
  className: string
  spacing: Spacing
}

export interface SnippetInstance {
  id: string
  snippetId: string
  enabled: boolean
  properties: SnippetProperties
  data: SnippetData
  sortOrder: number
}

export interface SeoInfo {
  title: string
  keywords: string
  description: string
}

export type ProjectStatus = 'draft' | 'completed'
export type ProjectStep = 1 | 2

export interface Project {
  id: string
  name: string
  templateId: string
  seo: SeoInfo
  status: ProjectStatus
  currentStep: ProjectStep
  snippetInstances: SnippetInstance[]
  lastSelectedSnippetId: string | null
  snippetTabs: Record<string, 'props' | 'data'>
  customCss: string
  customJs: string
  createdAt: number
  updatedAt: number
}

export function createDefaultSpacing(): Spacing {
  return {
    top: { value: 0, unit: 'px' },
    right: { value: 0, unit: 'px' },
    bottom: { value: 0, unit: 'px' },
    left: { value: 0, unit: 'px' },
  }
}

export function createDefaultSeo(): SeoInfo {
  return {
    title: '',
    keywords: '',
    description: '',
  }
}

export function createSnippetProperties(
  snippetFolder: string,
  defaultPlaceholder: string,
): SnippetProperties {
  return {
    placeholder: defaultPlaceholder ? `placeholder:${defaultPlaceholder}` : '',
    className: snippetFolder,
    spacing: createDefaultSpacing(),
  }
}
