import type { FormSchema, FieldDef, FieldGroup } from '@/types'

export function getFormFields(schema: FormSchema): FieldDef[] {
  // objectWithList 类型使用 groups
  if (schema.type === 'objectWithList' && schema.groups) {
    // 返回所有 groups 中的 fields
    const allFields: FieldDef[] = []
    for (const group of schema.groups) {
      allFields.push(...group.fields)
    }
    return allFields
  }
  return schema.fields || []
}

// 获取 objectWithList 的分组信息
export function getFormGroups(schema: FormSchema): FieldGroup[] | undefined {
  if (schema.type === 'objectWithList') {
    return schema.groups
  }
  return undefined
}

export function getDefaultFormData(
  schema: FormSchema,
): Record<string, unknown> | Record<string, unknown>[] {
  // objectWithList 类型需要为每个 group 生成默认值
  if (schema.type === 'objectWithList' && schema.groups) {
    const data: Record<string, unknown> = {}
    for (const group of schema.groups) {
      if (group.type === 'object') {
        // 对象类型
        const objData: Record<string, unknown> = {}
        for (const field of group.fields) {
          objData[field.key] = field.default ?? ''
        }
        data[group.name] = objData
      } else if (group.type === 'array') {
        // 数组类型 - 默认添加一个空项
        const arrData: Record<string, unknown>[] = []
        const itemData: Record<string, unknown> = {}
        for (const field of group.fields) {
          itemData[field.key] = field.default ?? ''
        }
        arrData.push(itemData)
        data[group.name] = arrData
      }
    }
    return data
  }

  // 旧的 object/array 类型 - 根据 type 返回相应结构
  if (schema.type === 'array') {
    // 数组类型：返回一个包含单个默认项的数组
    const itemData: Record<string, unknown> = {}
    const fields = getFormFields(schema)
    for (const field of fields) {
      itemData[field.key] = field.default ?? ''
    }
    return [itemData] // 返回数组
  }

  // object 类型
  const data: Record<string, unknown> = {}
  const fields = getFormFields(schema)
  for (const field of fields) {
    data[field.key] = field.default ?? ''
  }
  return data
}

export function getDefaultFormDataList(schema: FormSchema): Record<string, unknown>[] {
  const result = getDefaultFormData(schema)
  return Array.isArray(result) ? result : [result]
}

export function createEmptyFormData(schema: FormSchema): Record<string, unknown> {
  // objectWithList 类型创建空数据
  if (schema.type === 'objectWithList' && schema.groups) {
    const data: Record<string, unknown> = {}
    for (const group of schema.groups) {
      if (group.type === 'object') {
        const objData: Record<string, unknown> = {}
        for (const field of group.fields) {
          if (field.type === 'number') {
            objData[field.key] = 0
          } else if (field.type === 'select' && field.options && field.options.length > 0) {
            objData[field.key] = field.options[0]
          } else {
            objData[field.key] = ''
          }
        }
        data[group.name] = objData
      } else if (group.type === 'array') {
        data[group.name] = []
      }
    }
    return data
  }

  const data: Record<string, unknown> = {}
  const fields = getFormFields(schema)
  for (const field of fields) {
    if (field.type === 'number') {
      data[field.key] = 0
    } else if (field.type === 'select' && field.options && field.options.length > 0) {
      data[field.key] = field.options[0]
    } else {
      data[field.key] = ''
    }
  }
  return data
}

export function getFieldComponent(field: FieldDef): string {
  const map: Record<string, string> = {
    text: 'el-input',
    textarea: 'el-input',
    number: 'el-input-number',
    select: 'el-select',
    color: 'el-color-picker',
    image: 'el-input',
  }
  return map[field.type] || 'el-input'
}

export function isFieldRequired(field: FieldDef): boolean {
  return field.required ?? false
}

export function validateFormData(schema: FormSchema, data: Record<string, unknown>): string[] {
  const errors: string[] = []
  const fields = getFormFields(schema)
  for (const field of fields) {
    if (field.required && (!data[field.key] || data[field.key] === '')) {
      errors.push(`${field.label} 不能为空`)
    }
  }
  return errors
}

// 检查数组项是否已填完（必填项不为空，或至少有一项有数据）
export function isItemCompleted(schema: FormSchema, data: Record<string, unknown>): boolean {
  const fields = getFormFields(schema)

  // 检查必填项
  const requiredFields = fields.filter((f) => f.required)
  for (const field of requiredFields) {
    const value = data[field.key]
    if (value === undefined || value === null || value === '') {
      return false
    }
  }

  // 如果没有必填项，检查是否至少有一项有数据
  if (requiredFields.length === 0) {
    for (const field of fields) {
      const value = data[field.key]
      if (value !== undefined && value !== null && value !== '') {
        return true
      }
    }
    return false
  }

  return true
}

// 检查 objectWithList 中指定 group 的数组项是否已完成
export function isListItemCompleted(fields: FieldDef[], data: Record<string, unknown>): boolean {
  // 检查必填项
  const requiredFields = fields.filter((f) => f.required)
  for (const field of requiredFields) {
    const value = data[field.key]
    if (value === undefined || value === null || value === '') {
      return false
    }
  }

  // 如果没有必填项，检查是否至少有一项有数据
  if (requiredFields.length === 0) {
    for (const field of fields) {
      const value = data[field.key]
      if (value !== undefined && value !== null && value !== '') {
        return true
      }
    }
    return false
  }

  return true
}
