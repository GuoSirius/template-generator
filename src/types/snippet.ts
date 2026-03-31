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
  // 去除空格: true-去除前后, 'start'-去除首部, 'end'-去除尾部
  trim?: boolean | 'start' | 'end'
}

export interface ObjectFieldGroup {
  type: 'object'
  name: string
  label: string
  fields: FieldDef[]
}

export interface ArrayFieldGroup {
  type: 'array'
  name: string
  label: string
  itemLabel?: string
  fields: FieldDef[]
}

export type FieldGroup = ObjectFieldGroup | ArrayFieldGroup

export interface FormSchema {
  type: 'object' | 'array' | 'objectWithList'
  groups?: FieldGroup[]
  // 兼容旧格式
  fields?: FieldDef[]
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
