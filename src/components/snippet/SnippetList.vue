<template>
  <div class="snippet-list">
    <div v-if="instances.length === 0" class="list-empty">
      <p class="empty-text">暂无片段</p>
      <p class="empty-hint">点击下方按钮添加片段</p>
    </div>
    <draggable
      v-else
      v-model="localInstances"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost-item"
      animation="200"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div
          class="snippet-item"
          :class="{ disabled: !element.enabled, selected: selectedId === element.id }"
          @click="emit('select', element.id)"
        >
          <div class="item-left">
            <div class="drag-handle" title="拖拽排序">
              <GripVertical :size="16" />
            </div>
            <div class="item-info">
              <span class="item-name">{{ getSnippetName(element.snippetId) }}</span>
              <span class="item-placeholder">{{ element.properties.placeholder }}</span>
            </div>
          </div>
          <div class="item-actions">
            <el-switch
              :model-value="element.enabled"
              size="small"
              @click.stop
              @update:model-value="toggleEnabled(element.id, $event)"
            />
            <button class="icon-btn btn-copy" title="复制" @click.stop="emit('copy', element.id)">
              <Copy :size="14" />
            </button>
            <button class="icon-btn btn-delete" title="删除" @click.stop="emit('delete', element.id)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </template>
    </draggable>
    <button class="add-btn" @click="emit('add')">
      <Plus :size="18" />
      <span>添加片段</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, Copy, Trash2, Plus } from 'lucide-vue-next'
import type { SnippetInstance, SnippetMeta } from '@/types'

const props = defineProps<{
  instances: SnippetInstance[]
  snippets: SnippetMeta[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  add: []
  copy: [id: string]
  delete: [id: string]
  toggle: [id: string, enabled: boolean]
  reorder: [instances: SnippetInstance[]]
}>()

const localInstances = computed({
  get: () => props.instances,
  set: (val: SnippetInstance[]) => {
    emit('reorder', val)
  },
})

function getSnippetName(snippetId: string): string {
  const found = props.snippets.find(s => s.folder === snippetId)
  return found?.name || snippetId
}

function toggleEnabled(id: string, enabled: boolean) {
  emit('toggle', id, enabled)
}

function onDragEnd() {
  emit('reorder', [...localInstances.value])
}
</script>

<style scoped>
.snippet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  flex: 1;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
}

.snippet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}

.snippet-item:hover {
  border-color: var(--primary);
  background: var(--bg-tertiary);
}

.snippet-item.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.snippet-item.disabled {
  opacity: 0.5;
}

.ghost-item {
  opacity: 0.4;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  cursor: grab;
  color: var(--text-muted);
  flex-shrink: 0;
  padding: 2px;
}

.drag-handle:active {
  cursor: grabbing;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-placeholder {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-btn:hover {
  brightness: 1.15;
  transform: scale(1.02);
}
</style>
