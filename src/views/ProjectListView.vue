<template>
  <div class="project-list-view">
    <div class="list-header">
      <h2 class="page-title">我的模板</h2>
      <div class="header-actions">
        <button
          class="batch-delete-btn"
          :disabled="selectedProjects.length === 0"
          @click="confirmBatchDelete"
        >
          <Trash2 :size="16" />
          <span>删除选中 ({{ selectedProjects.length }})</span>
        </button>
        <button class="create-btn" @click="onCreate">
          <PlusCircle :size="18" />
          <span>创建模板</span>
        </button>
        <div class="view-switcher">
          <button class="view-btn" :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'" title="卡片模式">
            <LayoutGrid :size="18" />
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'" title="表格模式">
            <List :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && sortedProjects.length === 0" class="empty-state">
      <div class="empty-icon">
        <FileCode2 :size="64" />
      </div>
      <h3 class="empty-title">还没有任何模板</h3>
      <p class="empty-desc">开始创建你的第一个页面模板吧</p>
      <button class="create-btn empty-action" @click="onCreate">
        <PlusCircle :size="20" />
        <span>立即创建</span>
      </button>
    </div>

    <!-- 卡片模式 -->
    <div v-if="viewMode === 'card' && sortedProjects.length > 0" class="card-grid">
      <div v-for="project in sortedProjects" :key="project.id" class="project-card" :class="{ selected: selectedProjects.includes(project.id) }">
        <div class="card-checkbox">
          <el-checkbox
            :model-value="selectedProjects.includes(project.id)"
            @change="toggleSelect(project.id)"
          />
        </div>
        <div class="card-preview">
          <div class="card-preview-placeholder">
            <FileText :size="32" />
          </div>
        </div>
        <div class="card-info">
          <div class="card-header">
            <h3 class="card-name">{{ project.name }}</h3>
            <span class="status-badge" :class="project.status">
              {{ project.status === 'completed' ? '已完成' : '制作中' }}
            </span>
          </div>
          <p class="card-meta">{{ formatDate(project.updatedAt) }}</p>
          <div class="card-actions">
            <button class="action-icon-btn btn-preview" title="预览" @click="previewProject(project)">
              <Eye :size="16" />
            </button>
            <button v-if="project.status === 'completed'" class="action-icon-btn btn-edit" title="编辑" @click="editProject(project)">
              <Edit3 :size="16" />
            </button>
            <button v-if="project.status === 'draft'" class="action-icon-btn btn-resume" title="去完成" @click="resumeProject(project)">
              <Play :size="16" />
            </button>
            <button class="action-icon-btn btn-copy" title="复制" @click="copyProject(project)">
              <Copy :size="16" />
            </button>
            <button class="action-icon-btn btn-delete" title="删除" @click="confirmDelete(project)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格模式 -->
    <div v-if="viewMode === 'table' && sortedProjects.length > 0" class="table-wrapper">
      <el-table
        ref="tableRef"
        :data="sortedProjects"
        style="width: 100%"
        :header-cell-style="tableHeaderStyle"
        row-class-name="table-row"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <div class="table-name-cell">
              <span class="table-name">{{ row.name }}</span>
              <span class="status-badge" :class="row.status">{{ row.status === 'completed' ? '已完成' : '制作中' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-badge" :class="row.status">{{ row.status === 'completed' ? '已完成' : '制作中' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="templateId" label="模板" width="120" />
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <button class="action-icon-btn btn-preview" title="预览" @click="previewProject(row)">
                <Eye :size="16" />
              </button>
              <button v-if="row.status === 'completed'" class="action-icon-btn btn-edit" title="编辑" @click="editProject(row)">
                <Edit3 :size="16" />
              </button>
              <button v-if="row.status === 'draft'" class="action-icon-btn btn-resume" title="去完成" @click="resumeProject(row)">
                <Play :size="16" />
              </button>
              <button class="action-icon-btn btn-copy" title="复制" @click="copyProject(row)">
                <Copy :size="16" />
              </button>
              <button class="action-icon-btn btn-delete" title="删除" @click="confirmDelete(row)">
                <Trash2 :size="16" />
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="页面预览" width="80%" top="5vh" destroy-on-close>
      <PreviewIframe v-if="previewHtml" :srcdoc="previewHtml" :show-toolbar="false" style="height: 70vh;" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutGrid, List, PlusCircle, FileCode2, FileText,
  Eye, Edit3, Play, Copy, Trash2,
} from 'lucide-vue-next'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores/project'
import PreviewIframe from '@/components/preview/PreviewIframe.vue'
import { usePreview } from '@/composables/use-preview'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const { generatePreviewHtml } = usePreview()

const loading = ref(false)
const viewMode = ref<'card' | 'table'>('card')
const showPreview = ref(false)
const previewHtml = ref('')
const selectedProjects = ref<string[]>([])
const tableRef = ref<InstanceType<typeof import('element-plus').ElTable> | null>(null)

// 监听视图切换，同步选中状态到表格
watch(() => viewMode.value, (newMode) => {
  if (newMode === 'table' && selectedProjects.value.length > 0) {
    // 使用 requestAnimationFrame 确保 DOM 渲染完成
    requestAnimationFrame(() => {
      if (!tableRef.value) return
      const rows = sortedProjects.value.filter(p => selectedProjects.value.includes(p.id))
      rows.forEach(row => {
        tableRef.value?.toggleRowSelection(row, true)
      })
    })
  }
})

const toggleSelect = (id: string) => {
  const idx = selectedProjects.value.indexOf(id)
  if (idx === -1) {
    selectedProjects.value.push(id)
  } else {
    selectedProjects.value.splice(idx, 1)
  }
}

// 记录切换到表格模式时的选中状态，用于检测取消选中
let tableModePreviousSelected: string[] = []

const handleSelectionChange = (rows: Project[]) => {
  const currentIds = rows.map(r => r.id)

  // 如果之前有记录表格模式的选中状态，说明是从卡片切换过来的
  if (tableModePreviousSelected.length > 0) {
    // 找出被取消选中的项目（之前在选中列表中，现在不在 currentIds 中）
    const deselected = tableModePreviousSelected.filter(
      id => !currentIds.includes(id) && selectedProjects.value.includes(id)
    )
    // 移除被取消选中的
    deselected.forEach(id => {
      const idx = selectedProjects.value.indexOf(id)
      if (idx > -1) selectedProjects.value.splice(idx, 1)
    })
  }

  // 合并新增选中的项目
  currentIds.forEach(id => {
    if (!selectedProjects.value.includes(id)) {
      selectedProjects.value.push(id)
    }
  })

  // 更新记录
  tableModePreviousSelected = currentIds
}

const confirmBatchDelete = () => {
  if (selectedProjects.value.length === 0) return
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedProjects.value.length} 个模板吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    selectedProjects.value.forEach(id => projectStore.deleteProject(id))
    selectedProjects.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const sortedProjects = computed(() => projectStore.sortedProjects)

const tableHeaderStyle = () => ({
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)',
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const onCreate = async () => {
  router.push('/create')
}

const editProject = (project: Project) => {
  router.push(`/create/${project.id}?mode=edit`)
}

const resumeProject = (project: Project) => {
  router.push(`/create/${project.id}?mode=resume`)
}

const copyProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要复制「${project.name}」吗？`,
      '确认复制',
      {
        confirmButtonText: '复制',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    const copy = await projectStore.duplicateProject(project.id)
    if (copy) {
      router.push(`/create/${copy.id}`)
    }
  } catch {
    // 用户取消，不做任何操作
  }
}

const confirmDelete = (project: Project) => {
  ElMessageBox.confirm(`确定要删除「${project.name}」吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    projectStore.deleteProject(project.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const previewProject = async (project: Project) => {
  try {
    previewHtml.value = await generatePreviewHtml(project)
    showPreview.value = true
  } catch (e) {
    console.error('Preview failed:', e)
    ElMessage.error('预览失败')
  }
}

onMounted(async () => {
  loading.value = true
  await projectStore.loadProjects()
  loading.value = false
})
</script>

<style scoped>
.project-list-view {
  max-width: 1400px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-delete-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.batch-delete-btn:disabled:hover {
  filter: none;
  transform: none;
  box-shadow: none;
}

.batch-delete-btn:hover:not(:disabled) {
  filter: brightness(1.15);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.view-switcher {
  display: flex;
  background: var(--bg-tertiary);
  padding: 3px;
  border-radius: 8px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: var(--primary);
  color: white;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #38BDF8, #0284C7);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  brightness: 1.15;
  transform: scale(1.05);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.empty-action {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
  50% { box-shadow: 0 0 20px 6px rgba(56, 189, 248, 0.2); }
}

/* 卡片模式 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.project-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.project-card.selected {
  border-color: var(--primary);
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
}

.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.card-checkbox :deep(.el-checkbox) {
  --el-checkbox-checked-bg-color: var(--primary);
  --el-checkbox-checked-input-border-color: var(--primary);
}

.card-checkbox :deep(.el-checkbox__inner) {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
}

.card-checkbox :deep(.el-checkbox__inner::after) {
  width: 6px;
  height: 10px;
  left: 9px;
  top: 8px;
}

/* 表格模式复选框样式 */
.table-wrapper :deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
}

.table-wrapper :deep(.el-checkbox__inner::after) {
  width: 5px;
  height: 9px;
  left: 8px;
  top: 6px;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

.card-preview {
  height: 160px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-preview-placeholder {
  color: var(--text-muted);
  opacity: 0.4;
}

.card-info {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.status-badge.draft {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 6px;
}

/* 表格模式 */
.table-wrapper {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.table-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-name {
  font-weight: 500;
  color: var(--text-primary);
}

.table-actions {
  display: flex;
  gap: 6px;
}

/* 操作按钮 */
.action-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  flex-shrink: 0;
}

.action-icon-btn:hover {
  brightness: 1.2;
  transform: scale(1.08);
}

.btn-preview { background: #22C55E; }
.btn-edit { background: #38BDF8; }
.btn-resume { background: #0EA5E9; }
.btn-copy { background: #8B5CF6; }
.btn-delete { background: #EF4444; }
</style>
