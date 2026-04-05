<template>
  <div class="spacing-editor">
    <div class="spacing-grid">
      <div class="spacing-field">
        <span class="spacing-label">上</span>
        <el-input-number
          :model-value="modelValue.top.value"
          :min="0"
          :max="500"
          size="small"
          controls-position="right"
          @update:model-value="updateField('top', $event)"
        />
        <el-select
          :model-value="modelValue.top.unit"
          size="small"
          style="width: 72px;"
          @update:model-value="updateUnit('top', $event)"
        >
          <el-option label="px" value="px" />
          <el-option label="%" value="%" />
          <el-option label="rem" value="rem" />
        </el-select>
      </div>
      <div class="spacing-field">
        <span class="spacing-label">右</span>
        <el-input-number
          :model-value="modelValue.right.value"
          :min="0"
          :max="500"
          size="small"
          controls-position="right"
          @update:model-value="updateField('right', $event)"
        />
        <el-select
          :model-value="modelValue.right.unit"
          size="small"
          style="width: 72px;"
          @update:model-value="updateUnit('right', $event)"
        >
          <el-option label="px" value="px" />
          <el-option label="%" value="%" />
          <el-option label="rem" value="rem" />
        </el-select>
      </div>
      <div class="spacing-field">
        <span class="spacing-label">下</span>
        <el-input-number
          :model-value="modelValue.bottom.value"
          :min="0"
          :max="500"
          size="small"
          controls-position="right"
          @update:model-value="updateField('bottom', $event)"
        />
        <el-select
          :model-value="modelValue.bottom.unit"
          size="small"
          style="width: 72px;"
          @update:model-value="updateUnit('bottom', $event)"
        >
          <el-option label="px" value="px" />
          <el-option label="%" value="%" />
          <el-option label="rem" value="rem" />
        </el-select>
      </div>
      <div class="spacing-field">
        <span class="spacing-label">左</span>
        <el-input-number
          :model-value="modelValue.left.value"
          :min="0"
          :max="500"
          size="small"
          controls-position="right"
          @update:model-value="updateField('left', $event)"
        />
        <el-select
          :model-value="modelValue.left.unit"
          size="small"
          style="width: 72px;"
          @update:model-value="updateUnit('left', $event)"
        >
          <el-option label="px" value="px" />
          <el-option label="%" value="%" />
          <el-option label="rem" value="rem" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Spacing } from '@/types'

const modelValue = defineModel<Spacing>({ required: true })

const emit = defineEmits<{
  'update:modelValue': [value: Spacing]
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _directions = ['top', 'right', 'bottom', 'left'] as const

function updateField(direction: 'top' | 'right' | 'bottom' | 'left', value: number | undefined) {
  emit('update:modelValue', {
    ...modelValue.value,
    [direction]: { ...modelValue.value[direction], value: value ?? 0 },
  })
}

function updateUnit(direction: 'top' | 'right' | 'bottom' | 'left', unit: string) {
  emit('update:modelValue', {
    ...modelValue.value,
    [direction]: { ...modelValue.value[direction], unit: unit as 'px' | '%' | 'rem' },
  })
}
</script>

<style scoped>
.spacing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.spacing-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spacing-label {
  font-size: 12px;
  color: var(--text-secondary);
  width: 20px;
  flex-shrink: 0;
}
</style>
