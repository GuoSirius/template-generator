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
            v-model="objectData[field.key]"
            :placeholder="field.placeholder || ''"
            :maxlength="200"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="objectData[field.key]"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder || ''"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="objectData[field.key]"
            :min="0"
            controls-position="right"
            style="width: 100%;"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="objectData[field.key]"
            style="width: 100%;"
          >
            <el-option
              v-for="opt in field.options"
              :key="opt"
              :label="opt"
              :value="opt"
            />
          </el-select>
          <el-color-picker
            v-else-if="field.type === 'color'"
            v-model="objectData[field.key]"
          />
          <el-input
            v-else-if="field.type === 'image'"
            v-model="objectData[field.key]"
            :placeholder="field.placeholder || '图片 URL'"
          />
        </el-form-item>
      </el-form>
    </template>

    <!-- Array type: list of items -->
    <template v-if="schema.type === 'array'">
      <div class="array-list">
        <div
          v-for="(item, index) in arrayList"
          :key="index"
          class="array-item"
        >
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
                v-model="item[field.key]"
                :placeholder="field.placeholder || ''"
              />
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="item[field.key]"
                type="textarea"
                :rows="2"
                :placeholder="field.placeholder || ''"
              />
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="item[field.key]"
                :min="0"
                controls-position="right"
                style="width: 100%;"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="item[field.key]"
                style="width: 100%;"
              >
                <el-option
                  v-for="opt in field.options"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
              <el-color-picker
                v-else-if="field.type === 'color'"
                v-model="item[field.key]"
              />
              <el-input
                v-else-if="field.type === 'image'"
                v-model="item[field.key]"
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
  </div>
</template>

<script setup lang="ts">
import { computed, watch, reactive, nextTick } from 'vue'
import { Plus, Copy, Trash2 } from 'lucide-vue-next'
import type { FormSchema } from '@/types'
import { getDefaultFormData, getDefaultFormDataList, createEmptyFormData } from '@/engines/form-engine'

const props = defineProps<{
  schema: FormSchema
  modelValue: Record<string, any> | Record<string, any>[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any> | Record<string, any>[]]
}>()

const objectData = reactive<Record<string, any>>({})
const arrayList = reactive<Record<string, any>[]>([])
let isInternalUpdate = false

function initFromValue() {
  if (isInternalUpdate) return
  if (props.schema.type === 'object') {
    if (props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue) && Object.keys(props.modelValue).length > 0) {
      Object.assign(objectData, props.modelValue)
    } else {
      const defaults = getDefaultFormData(props.schema)
      Object.keys(objectData).forEach(k => delete objectData[k])
      Object.assign(objectData, defaults)
    }
  } else {
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
      arrayList.splice(0, arrayList.length, ...JSON.parse(JSON.stringify(props.modelValue)))
    } else {
      const defaults = getDefaultFormDataList(props.schema)
      arrayList.splice(0, arrayList.length, ...JSON.parse(JSON.stringify(defaults)))
    }
  }
}

initFromValue()
watch(() => props.modelValue, initFromValue, { deep: true })

// Object: watch and emit
if (props.schema.type === 'object') {
  watch(objectData, (val) => {
    isInternalUpdate = true
    emit('update:modelValue', { ...val })
    nextTick(() => {
      isInternalUpdate = false
    })
  }, { deep: true })
}

// Array: watch and emit
watch(arrayList, (val) => {
  if (props.schema.type === 'array') {
    isInternalUpdate = true
    emit('update:modelValue', JSON.parse(JSON.stringify(val)))
    nextTick(() => {
      isInternalUpdate = false
    })
  }
}, { deep: true })

function addItem() {
  arrayList.push(createEmptyFormData(props.schema))
}

function removeItem(index: number) {
  arrayList.splice(index, 1)
}

function copyItem(index: number) {
  const copy = JSON.parse(JSON.stringify(arrayList[index]))
  arrayList.splice(index + 1, 0, copy)
}
</script>

<style scoped>
.array-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.array-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
}

.array-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
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
  color: white;
}

.icon-btn:hover {
  transform: scale(1.1);
  brightness: 1.2;
}

.btn-copy { background: #8B5CF6; }
.btn-delete { background: #EF4444; }

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(56, 189, 248, 0.05);
}
</style>
