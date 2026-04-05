<template>
  <div class="dynamic-form">
    <!-- Object type: single form -->
    <template v-if="schema.type === 'object'">
      <el-form label-position="top" size="default">
        <el-form-item
          v-for="field in schema.fields"
          :key="field.key"
          :label="field.label"
          :required="field.required"
        >
          <el-input
            v-if="field.type === 'text'"
            :model-value="objectData[field.key]"
            @update:model-value="objectData[field.key] = handleInput(field, $event)"
            :placeholder="field.placeholder || ''"
            :maxlength="200"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            :model-value="objectData[field.key]"
            @update:model-value="objectData[field.key] = handleInput(field, $event)"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder || ''"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="objectData[field.key]"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="objectData[field.key]"
            style="width: 100%"
          >
            <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-color-picker v-else-if="field.type === 'color'" v-model="objectData[field.key]" />
          <el-input
            v-else-if="field.type === 'image'"
            :model-value="objectData[field.key]"
            @update:model-value="objectData[field.key] = handleInput(field, $event)"
            :placeholder="field.placeholder || '图片 URL'"
          />
        </el-form-item>
      </el-form>
    </template>

    <!-- Array type: list of items -->
    <template v-if="schema.type === 'array'">
      <div class="array-list">
        <div v-for="(item, index) in arrayList" :key="index" class="array-item">
          <div class="array-item-header">
            <span class="array-item-index">条目 {{ index + 1 }}</span>
            <div class="array-item-actions">
              <button class="icon-btn btn-copy" title="复制" @click="copyItem(index)">
                <Copy :size="14" />
              </button>
              <button class="icon-btn btn-delete" title="删除" @click="removeItem(index)">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <el-form label-position="top" size="small">
            <el-form-item
              v-for="field in schema.fields"
              :key="field.key"
              :label="field.label"
              :required="field.required"
            >
              <el-input
                v-if="field.type === 'text'"
                :model-value="item[field.key]"
                @update:model-value="item[field.key] = handleInput(field, $event)"
                :placeholder="field.placeholder || ''"
              />
              <el-input
                v-else-if="field.type === 'textarea'"
                :model-value="item[field.key]"
                @update:model-value="item[field.key] = handleInput(field, $event)"
                type="textarea"
                :rows="2"
                :placeholder="field.placeholder || ''"
              />
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="item[field.key]"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="item[field.key]"
                style="width: 100%"
              >
                <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-color-picker v-else-if="field.type === 'color'" v-model="item[field.key]" />
              <el-input
                v-else-if="field.type === 'image'"
                :model-value="item[field.key]"
                @update:model-value="item[field.key] = handleInput(field, $event)"
                :placeholder="field.placeholder || '图片 URL'"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <button class="add-item-btn" @click="addItem">
        <Plus :size="16" />
        <span>添加条目</span>
      </button>
    </template>

    <!-- ObjectWithList type: object + array -->
    <template v-if="schema.type === 'objectWithList' && formGroups">
      <div class="object-with-list">
        <template v-for="group in formGroups" :key="group.name">
          <!-- Object group -->
          <div v-if="group.type === 'object'" class="form-group-section">
            <h4 class="group-title">{{ group.label }}</h4>
            <el-form label-position="top" size="default">
              <el-form-item
                v-for="field in group.fields"
                :key="field.key"
                :label="field.label"
                :required="field.required"
              >
                <el-input
                  v-if="field.type === 'text'"
                  :model-value="objectData[group.name]?.[field.key]"
                  @update:model-value="
                    objectData[group.name][field.key] = handleInput(field, $event)
                  "
                  :placeholder="field.placeholder || ''"
                  :maxlength="200"
                />
                <el-input
                  v-else-if="field.type === 'textarea'"
                  :model-value="objectData[group.name]?.[field.key]"
                  @update:model-value="
                    objectData[group.name][field.key] = handleInput(field, $event)
                  "
                  type="textarea"
                  :rows="3"
                  :placeholder="field.placeholder || ''"
                />
                <el-input-number
                  v-else-if="field.type === 'number'"
                  v-model="objectData[group.name][field.key]"
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                />
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="objectData[group.name][field.key]"
                  style="width: 100%"
                >
                  <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
                </el-select>
                <el-color-picker
                  v-else-if="field.type === 'color'"
                  v-model="objectData[group.name][field.key]"
                />
                <el-input
                  v-else-if="field.type === 'image'"
                  :model-value="objectData[group.name]?.[field.key]"
                  @update:model-value="
                    objectData[group.name][field.key] = handleInput(field, $event)
                  "
                  :placeholder="field.placeholder || '图片 URL'"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- Array group -->
          <div v-if="group.type === 'array'" class="form-group-section">
            <h4 class="group-title">{{ group.label }}</h4>
            <div class="array-list">
              <div
                v-for="(item, index) in objectData[group.name] || []"
                :key="index"
                class="array-item"
              >
                <div class="array-item-header">
                  <span class="array-item-index"
                    >{{ group.itemLabel || '条目' }} {{ index + 1 }}</span
                  >
                  <div class="array-item-actions">
                    <button
                      class="icon-btn btn-copy"
                      title="复制"
                      @click="copyListItem(group.name, index, group.fields)"
                    >
                      <Copy :size="14" />
                    </button>
                    <button
                      class="icon-btn btn-delete"
                      title="删除"
                      @click="removeListItem(group.name, index)"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>
                <el-form label-position="top" size="small">
                  <el-form-item
                    v-for="field in group.fields"
                    :key="field.key"
                    :label="field.label"
                    :required="field.required"
                  >
                    <el-input
                      v-if="field.type === 'text'"
                      :model-value="item[field.key]"
                      @update:model-value="item[field.key] = handleInput(field, $event)"
                      :placeholder="field.placeholder || ''"
                    />
                    <el-input
                      v-else-if="field.type === 'textarea'"
                      :model-value="item[field.key]"
                      @update:model-value="item[field.key] = handleInput(field, $event)"
                      type="textarea"
                      :rows="2"
                      :placeholder="field.placeholder || ''"
                    />
                    <el-input-number
                      v-else-if="field.type === 'number'"
                      v-model="item[field.key]"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                    />
                    <el-select
                      v-else-if="field.type === 'select'"
                      v-model="item[field.key]"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in field.options"
                        :key="opt"
                        :label="opt"
                        :value="opt"
                      />
                    </el-select>
                    <el-color-picker v-else-if="field.type === 'color'" v-model="item[field.key]" />
                    <el-input
                      v-else-if="field.type === 'image'"
                      :model-value="item[field.key]"
                      @update:model-value="item[field.key] = handleInput(field, $event)"
                      :placeholder="field.placeholder || '图片 URL'"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <button class="add-item-btn" @click="addListItem(group.name, group.fields)">
              <Plus :size="16" />
              <span>添加{{ group.itemLabel || '条目' }}</span>
            </button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, nextTick } from 'vue'
import { Copy, Trash2, Plus } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormSchema, FieldDef } from '@/types'
import {
  getDefaultFormData,
  createEmptyFormData,
  isItemCompleted,
  isListItemCompleted,
  getFormFields,
} from '@/engines/form-engine'

const props = defineProps<{
  schema: FormSchema
  modelValue: Record<string, unknown> | Record<string, unknown>[]
  sampleData?: Record<string, unknown> | Record<string, unknown>[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown> | Record<string, unknown>[]]
}>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const objectData = reactive<Record<string, any>>({})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayList = reactive<Record<string, any>[]>([])
let isInternalUpdate = false

// 获取 formGroups 用于 objectWithList
const formGroups = props.schema.type === 'objectWithList' ? props.schema.groups : undefined

// 获取需要处理的字段列表
function getFieldsForSchema(): FieldDef[] {
  if (props.schema.type === 'objectWithList' && props.schema.groups) {
    // 返回所有 groups 中的字段
    const allFields: FieldDef[] = []
    for (const group of props.schema.groups) {
      if (group.type === 'array') {
        allFields.push(...group.fields)
      }
    }
    return allFields
  }
  return getFormFields(props.schema)
}

// 处理字段值的空格
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processTrim(data: Record<string, any>, fields: FieldDef[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    const value = data[field.key]
    if (typeof value === 'string') {
      if (field.trim === true) {
        result[field.key] = value.trim()
      } else if (field.trim === 'start') {
        result[field.key] = value.trimStart()
      } else if (field.trim === 'end') {
        result[field.key] = value.trimEnd()
      } else {
        result[field.key] = value
      }
    } else {
      result[field.key] = value
    }
  }
  return result
}

// 实时处理输入框的空格
function handleInput(field: FieldDef, value: import('@/types').FieldValue): unknown {
  if (field.trim && typeof value === 'string') {
    if (field.trim === true) {
      return value.trim()
    } else if (field.trim === 'start') {
      return value.trimStart()
    } else if (field.trim === 'end') {
      return value.trimEnd()
    }
  }
  return value
}

function initFromValue() {
  if (isInternalUpdate) return

  // 判断是否有有效的数据
  const hasValidModelValue = () => {
    if (!props.modelValue) return false
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.length > 0
    } else if (typeof props.modelValue === 'object') {
      return Object.keys(props.modelValue).length > 0
    }
    return false
  }

  // 判断是否有示例数据
  const hasSampleData = () => {
    if (!props.sampleData) return false
    if (Array.isArray(props.sampleData)) {
      return props.sampleData.length > 0
    } else if (typeof props.sampleData === 'object') {
      return Object.keys(props.sampleData).length > 0
    }
    return false
  }

  if (props.schema.type === 'objectWithList') {
    // objectWithList 类型
    if (hasValidModelValue()) {
      // 有有效数据，使用 modelValue
      // 确保所有 groups 在 objectData 中都有对应的键
      if (props.schema.groups) {
        for (const group of props.schema.groups) {
          if (!objectData[group.name]) {
            if (group.type === 'object') {
              objectData[group.name] = {}
            } else if (group.type === 'array') {
              objectData[group.name] = []
            }
          }
        }
      }
      Object.assign(objectData, props.modelValue)
    } else if (hasSampleData()) {
      // 没有有效数据，但有示例数据，使用示例数据
      Object.assign(objectData, props.sampleData)
    } else {
      // 都没有，初始化默认值
      if (props.schema.groups) {
        for (const group of props.schema.groups) {
          if (group.type === 'object') {
            const objData: Record<string, unknown> = {}
            for (const field of group.fields) {
              objData[field.key] = field.default ?? ''
            }
            objectData[group.name] = objData
          } else if (group.type === 'array') {
            const arrData: Record<string, unknown>[] = []
            const itemData: Record<string, unknown> = {}
            for (const field of group.fields) {
              itemData[field.key] = field.default ?? ''
            }
            arrData.push(itemData)
            objectData[group.name] = arrData
            // 确保 partners 数组至少有一个空项，避免模板访问 undefined
            if (group.name === 'partners' && arrData.length === 0) {
              const emptyItem: Record<string, unknown> = {}
              for (const field of group.fields) {
                emptyItem[field.key] = field.default ?? ''
              }
              objectData[group.name].push(emptyItem)
            }
          }
        }
      }
    }
  } else if (props.schema.type === 'object') {
    if (hasValidModelValue()) {
      Object.assign(objectData, props.modelValue)
    } else if (hasSampleData()) {
      Object.assign(objectData, props.sampleData)
    } else {
      const defaults = getDefaultFormData(props.schema)
      Object.keys(objectData).forEach((k) => delete objectData[k])
      Object.assign(objectData, defaults)
    }
  } else {
    // array 类型
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
      arrayList.splice(0, arrayList.length, ...JSON.parse(JSON.stringify(props.modelValue)))
    } else if (Array.isArray(props.sampleData) && props.sampleData.length > 0) {
      arrayList.splice(0, arrayList.length, ...JSON.parse(JSON.stringify(props.sampleData)))
    } else {
      // 初始为空，不添加默认项
      arrayList.splice(0, arrayList.length)
    }
  }
}

initFromValue()
watch(() => props.modelValue, initFromValue, { deep: true })
// 监听 schema 变化，当切换不同片段时重新初始化数据
watch(
  () => props.schema,
  () => {
    // 清空现有数据
    if (props.schema.type === 'object' || props.schema.type === 'objectWithList') {
      Object.keys(objectData).forEach((key) => delete objectData[key])
    } else if (props.schema.type === 'array') {
      arrayList.splice(0, arrayList.length)
    }
    // 重新初始化
    initFromValue()
  },
  { deep: true },
)

// 获取所有字段
const allFields = getFieldsForSchema()

// 包装 emit，处理空格
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emitWithTrim(val: Record<string, any>) {
  // 深拷贝
  let processed: Record<string, unknown> | Record<string, unknown>[]
  if (Array.isArray(val)) {
    // 数组类型：处理每一项
    processed = val.map((item) => processTrim(item, allFields))
  } else {
    processed = processTrim(val, allFields)
  }
  isInternalUpdate = true
  emit('update:modelValue', JSON.parse(JSON.stringify(processed)))
  nextTick(() => {
    isInternalUpdate = false
  })
}

// Object/ObjectWithList: watch and emit
if (props.schema.type === 'object' || props.schema.type === 'objectWithList') {
  watch(
    objectData,
    (val) => {
      emitWithTrim(val)
    },
    { deep: true },
  )
}

// Array: watch and emit
watch(
  arrayList,
  (val) => {
    if (props.schema.type === 'array') {
      emitWithTrim(val)
    }
  },
  { deep: true },
)

function addItem() {
  // 检查最后一项是否已填完
  if (arrayList.length > 0) {
    const lastItem = arrayList[arrayList.length - 1]
    if (!isItemCompleted(props.schema, lastItem)) {
      ElMessage.warning('请先填完当前项再添加新项')
      return
    }
  }
  arrayList.push(createEmptyFormData(props.schema))
}

function removeItem(index: number) {
  const item = arrayList[index]
  // 检查是否有数据
  const hasData = Object.values(item).some((v) => v !== '' && v !== null && v !== undefined)
  if (hasData) {
    ElMessageBox.confirm('该数据项存在内容，确认要删除吗？', '确认删除', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        arrayList.splice(index, 1)
      })
      .catch(() => {})
  } else {
    arrayList.splice(index, 1)
  }
}

function copyItem(index: number) {
  // 检查最后一项是否已填完
  if (arrayList.length > 0) {
    const lastItem = arrayList[arrayList.length - 1]
    if (!isItemCompleted(props.schema, lastItem)) {
      ElMessage.warning('请先填完当前项再复制新项')
      return
    }
  }
  const copy = JSON.parse(JSON.stringify(arrayList[index]))
  arrayList.splice(index + 1, 0, copy)
}

// objectWithList 类型的操作
function addListItem(groupName: string, fields: FieldDef[]) {
  // 检查最后一项是否已填完
  const listData = objectData[groupName]
  if (listData.length > 0) {
    const lastItem = listData[listData.length - 1]
    if (!isListItemCompleted(fields, lastItem)) {
      ElMessage.warning('请先填完当前项再添加新项')
      return
    }
  }
  const itemData: Record<string, unknown> = {}
  for (const field of fields) {
    itemData[field.key] = field.default ?? ''
  }
  objectData[groupName].push(itemData)
}

function removeListItem(groupName: string, index: number) {
  const listData = objectData[groupName]
  const item = listData[index]
  // 检查是否有数据
  const hasData = Object.values(item).some((v) => v !== '' && v !== null && v !== undefined)
  if (hasData) {
    ElMessageBox.confirm('该数据项存在内容，确认要删除吗？', '确认删除', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        objectData[groupName].splice(index, 1)
      })
      .catch(() => {})
  } else {
    objectData[groupName].splice(index, 1)
  }
}

function copyListItem(groupName: string, index: number, fields: FieldDef[]) {
  // 检查最后一项是否已填完
  const listData = objectData[groupName]
  if (listData.length > 0) {
    const lastItem = listData[listData.length - 1]
    if (!isListItemCompleted(fields, lastItem)) {
      ElMessage.warning('请先填完当前项再复制新项')
      return
    }
  }
  const copy = JSON.parse(JSON.stringify(objectData[groupName][index]))
  objectData[groupName].splice(index + 1, 0, copy)
}
</script>

<style scoped>
.dynamic-form {
  padding: 8px 0;
}

.array-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.array-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.array-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.array-item-index {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.array-item-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: var(--text-muted);
}

.icon-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-copy:hover {
  color: var(--primary);
}

.btn-delete:hover {
  color: #ef4444;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(56, 189, 248, 0.05);
}

.object-with-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}
</style>
