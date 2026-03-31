<template>
  <div class="seo-form">
    <el-form label-position="top" size="default">
      <el-form-item label="页面标题">
        <el-input
          :model-value="modelValue.title"
          placeholder="输入页面 SEO 标题"
          maxlength="80"
          show-word-limit
          clearable
          @update:model-value="updateField('title', $event)"
        />
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          :model-value="modelValue.keywords"
          placeholder="多个关键词用逗号分隔"
          maxlength="200"
          show-word-limit
          clearable
          @update:model-value="updateField('keywords', $event)"
        />
      </el-form-item>
      <el-form-item label="页面描述">
        <el-input
          :model-value="modelValue.description"
          type="textarea"
          :rows="3"
          placeholder="输入页面描述，建议 100-160 字符"
          maxlength="300"
          show-word-limit
          @update:model-value="updateField('description', $event)"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { SeoInfo } from '@/types'

const modelValue = defineModel<SeoInfo>({ required: true })

const emit = defineEmits<{
  'update:modelValue': [value: SeoInfo]
}>()

function updateField(key: keyof SeoInfo, value: string) {
  emit('update:modelValue', { ...modelValue.value, [key]: value })
}
</script>
