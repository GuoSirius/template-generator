<template>
  <div class="save-confirm-dialog">
    <el-dialog v-model="visible" title="保存成功" width="400px" :close-on-click-modal="false" @close="onClose">
      <p class="confirm-text">项目已保存，请选择下一步操作：</p>
      <div class="action-buttons">
        <button class="action-btn btn-goto-list" @click="onGoToList">
          <LayoutGrid :size="18" />
          <span>前往列表页</span>
        </button>
        <button class="action-btn btn-stay" @click="onStay">
          <Edit3 :size="18" />
          <span>继续制作</span>
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Edit3 } from 'lucide-vue-next'

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  gotoList: []
  stay: []
}>()

const onGoToList = () => {
  emit('gotoList')
  visible.value = false
}

const onStay = () => {
  emit('stay')
  visible.value = false
}

const onClose = () => {
  visible.value = false
}
</script>

<style scoped>
.confirm-text {
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.action-btn:hover {
  brightness: 1.15;
  transform: scale(1.02);
}

.btn-goto-list {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
}

.btn-stay {
  background: linear-gradient(135deg, #22C55E, #16A34A);
}
</style>
