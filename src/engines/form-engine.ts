import type { FormSchema, FieldDef } from '@/types'

export function getFormFields(schema: FormSchema): FieldDef[] {
  return schema.fields || []
}

export function getDefaultFormData(schema: FormSchema): Record<string, any> {
  const data: Record<string, any> = {}
  for (const field of schema.fields) {
    data[field.key] = field.default ?? ''
  }
  return data
}

export function getDefaultFormDataList(schema: FormSchema): Record<string, any>[] {
  return [getDefaultFormData(schema)]
}

export function createEmptyFormData(schema: FormSchema): Record<string, any> {
  const data: Record<string, any> = {}
  for (const field of schema.fields) {
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

export function validateFormData(schema: FormSchema, data: Record<string, any>): string[] {
  const errors: string[] = []
  for (const field of schema.fields) {
    if (field.required && (!data[field.key] || data[field.key] === '')) {
      errors.push(`${field.label} 不能为空`)
    }
  }
  return errors
}
