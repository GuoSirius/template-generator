export interface PreviewImage {
  url: string
  description?: string
  thumbnailUrl?: string
}

export type FieldValue = string | number | boolean

/** 间距值 */
export interface SpacingValue {
  value: number
  unit: 'px' | '%' | 'rem'
}

/** 间距配置 */
export interface Spacing {
  top: SpacingValue
  right: SpacingValue
  bottom: SpacingValue
  left: SpacingValue
}

/** 根据 field.type 映射的默认值类型 */
export type FieldDefaultValueMap = {
  text: string
  textarea: string
  number: number
  select: string
  color: string
  image: string
}

export interface SnippetMeta {
  name: string
  version: string
  description: string
  thumbnail: string // 主缩略图，向后兼容
  previewImages?: PreviewImage[] // 多预览图支持
  folder: string
  tags: string[]
}

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'image'
  default: FieldDefaultValueMap[FieldDef['type']]
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

/** 片段动态数据结构 */
export type SnippetData = Record<string, unknown> | Record<string, unknown>[]

export interface SnippetConfig {
  className: string
  defaultPlaceholder: string
  defaults: Record<string, FieldValue> & { spacing?: Spacing }
  formSchema: FormSchema
  sampleData: SnippetData
}

export interface SnippetsRegistry {
  snippets: SnippetMeta[]
}
