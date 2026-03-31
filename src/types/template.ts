export interface TemplateMeta {
  name: string
  version: string
  description: string
  thumbnail: string
  folder: string
}

export interface Placeholder {
  name: string
  description: string
  default: string
}

export interface TemplateSeo {
  title: string
  keywords: string
  description: string
}

export interface TemplateConfig {
  name?: string
  description?: string
  seo?: TemplateSeo
  placeholders: Placeholder[]
}

export interface PagesRegistry {
  templates: TemplateMeta[]
}
