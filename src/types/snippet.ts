export interface SnippetMeta {
  name: string
  version: string
  description: string
  thumbnail: string
  folder: string
  tags: string[]
}

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'image'
  default: any
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface FormSchema {
  type: 'object' | 'array'
  fields: FieldDef[]
}

export interface SnippetConfig {
  className: string
  defaultPlaceholder: string
  defaults: Record<string, any>
  formSchema: FormSchema
  sampleData: Record<string, any> | Record<string, any>[]
}

export interface SnippetsRegistry {
  snippets: SnippetMeta[]
}
