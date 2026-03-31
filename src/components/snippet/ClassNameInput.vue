<template>
  <div class="class-name-input">
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      clearable
      @update:model-value="onInput"
    >
      <template #suffix>
        <Check v-if="isValid" :size="16" style="color: #22C55E;" />
        <AlertCircle v-else-if="modelValue" :size="16" style="color: #EF4444;" />
      </template>
    </el-input>
    <p v-if="modelValue && !isValid" class="error-msg">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, AlertCircle } from 'lucide-vue-next'
import { useClassValidator } from '@/composables/use-class-validator'

const modelValue = defineModel<string>({ default: '' })

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: 'CSS 类名',
})

const { validateClassName } = useClassValidator()

const validation = computed(() => validateClassName(modelValue.value))
const isValid = computed(() => !modelValue.value || validation.value.valid)
const errorMsg = computed(() => validation.value.error)

function onInput(val: string) {
  modelValue.value = val
}
</script>

<style scoped>
.error-msg {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}
</style>
