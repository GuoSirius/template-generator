<template>
  <div class="save-confirm-dialog">
    <el-dialog v-model="visible" title="保存成功" width="420px" :close-on-click-modal="false" @close="onClose">
      <p class="confirm-text">项目已保存，请选择下一步操作：</p>
      <div class="action-buttons">
        <button class="action-btn btn-goto-list" @click="onGoToList">
          <LayoutGrid :size="18" />
          <span>前往列表</span>
        </button>
        <button class="action-btn btn-stay" @click="onStay">
          <Edit3 :size="18" />
          <span>继续编辑</span>
        </button>
        <div class="new-create-section">
          <button class="action-btn btn-new" @click="showNewOptions = !showNewOptions">
            <PlusCircle :size="18" />
            <span>继续新建</span>
            <ChevronDown :size="16" :class="{ rotated: showNewOptions }" />
          </button>
          <div v-if="showNewOptions" class="new-options">
            <label class="new-option">
              <el-checkbox v-model="copyCurrentData" size="large" />
              <span>复制当前数据开始新建</span>
            </label>
            <button class="new-option-btn" @click="onNewCreate">
              确认新建
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LayoutGrid, Edit3, PlusCircle, ChevronDown } from 'lucide-vue-next'

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  gotoList: []
  stay: []
  newCreate: [copyData: boolean]
}>()

const showNewOptions = ref(false)
const copyCurrentData = ref(false)

const onGoToList = () => {
  emit('gotoList')
  visible.value = false
  resetState()
}

const onStay = () => {
  emit('stay')
  visible.value = false
  resetState()
}

const onNewCreate = () => {
  emit('newCreate', copyCurrentData.value)
  visible.value = false
  resetState()
}

const resetState = () => {
  showNewOptions.value = false
  copyCurrentData.value = false
}

const onClose = () => {
  resetState()
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
  width: 100%;
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
  background: linear-gradient(135deg, #6366F1, #4F46E5);
}

.btn-stay {
  background: linear-gradient(135deg, #22C55E, #16A34A);
}

.btn-new {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  position: relative;
}

.btn-new .rotated {
  transform: rotate(180deg);
}

.new-create-section {
  position: relative;
}

.new-options {
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.new-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

.new-option-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-option-btn:hover {
  filter: brightness(1.1);
}
</style>