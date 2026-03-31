import { describe, it, expect } from 'vitest'
import { getDefaultFormData, getDefaultFormDataList, createEmptyFormData, validateFormData } from '@/engines/form-engine'
import type { FormSchema } from '@/types'

const objectSchema: FormSchema = {
  type: 'object',
  fields: [
    { key: 'title', label: '标题', type: 'text', default: 'Hello' },
    { key: 'count', label: '数量', type: 'number', default: 0 },
    { key: 'color', label: '颜色', type: 'select', default: 'red', options: ['red', 'blue'] },
  ],
}

const arraySchema: FormSchema = {
  type: 'array',
  fields: [
    { key: 'name', label: '名称', type: 'text', default: '' },
    { key: 'desc', label: '描述', type: 'textarea', default: '' },
  ],
}

describe('getDefaultFormData', () => {
  it('should return default values from schema', () => {
    const data = getDefaultFormData(objectSchema)
    expect(data.title).toBe('Hello')
    expect(data.count).toBe(0)
    expect(data.color).toBe('red')
  })
})

describe('getDefaultFormDataList', () => {
  it('should return array with one default item', () => {
    const list = getDefaultFormDataList(arraySchema)
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('')
  })
})

describe('createEmptyFormData', () => {
  it('should create empty form data', () => {
    const data = createEmptyFormData(objectSchema)
    expect(data.title).toBe('')
    expect(data.count).toBe(0)
    expect(data.color).toBe('red')
  })
})

describe('validateFormData', () => {
  it('should return no errors for valid data', () => {
    const data = { title: 'Test', count: 5, color: 'blue' }
    const errors = validateFormData(objectSchema, data)
    expect(errors).toHaveLength(0)
  })

  it('should return errors for missing required fields', () => {
    const schemaWithRequired: FormSchema = {
      type: 'object',
      fields: [
        { key: 'title', label: '标题', type: 'text', default: '', required: true },
      ],
    }
    const errors = validateFormData(schemaWithRequired, { title: '' })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('标题')
  })
})
