export interface PreviewImage {
  url: string
  description?: string
  thumbnailUrl?: string
}

export interface TemplateMeta {
  name: string
  version: string
  description: string
  thumbnail: string  // 主缩略图，向后兼容
  previewImages?: PreviewImage[]  // 多预览图支持
  folder: string
  disabled?: boolean  // 是否禁用
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
