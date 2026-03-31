<template>
  <div class="placeholder-selector">
    <el-select
      :model-value="modelValue"
      filterable
      allow-create
      default-first-option
      :placeholder="placeholder"
      clearable
      size="default"
      style="width: 100%;"
      @update:model-value="onUpdate"
    >
      <el-option
        v-for="item in options"
        :key="item"
        :label="`placeholder:${item}`"
        :value="`placeholder:${item}`"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  placeholderNames?: string[]
  placeholder?: string
}>(), {
  placeholderNames: () => [],
  placeholder: '选择或输入占位符标识',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const options = computed(() => props.placeholderNames)

function onUpdate(val: string) {
  if (val && !val.startsWith('placeholder:')) {
    emit('update:modelValue', `placeholder:${val}`)
  } else {
    emit('update:modelValue', val)
  }
}
</script>

<style scoped>
.placeholder-selector :deep(.el-input__wrapper) {
  background: var(--bg-primary);
}
</style>
