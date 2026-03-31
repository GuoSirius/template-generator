<template>
  <div class="snippet-list">
    <div v-if="instances.length === 0" class="list-empty">
      <p class="empty-text">暂无片段</p>
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
            <el-dropdown trigger="hover" @command="(cmd: string) => handleCommand(cmd, element.id)">
              <button class="more-btn" @click.stop>
                <MoreHorizontal :size="16" />
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">
                    <Copy :size="14" />
                    <span>复制</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <Trash2 :size="14" />
                    <span>删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, MoreHorizontal, Copy, Trash2 } from 'lucide-vue-next'
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

function handleCommand(cmd: string, id: string) {
  if (cmd === 'copy') {
    emit('copy', id)
  } else if (cmd === 'delete') {
    emit('delete', id)
  }
}

function onDragEnd() {
  emit('reorder', [...localInstances.value])
}
</script>

<style scoped>
.snippet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  margin-bottom: 12px;
}

.snippet-item:last-child {
  margin-bottom: 0;
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
  gap: 8px;
  flex-shrink: 0;
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.more-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
