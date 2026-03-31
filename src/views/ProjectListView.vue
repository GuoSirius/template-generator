<template>
  <div class="project-list-view">
    <div class="list-header">
      <h2 class="page-title">我的模板</h2>
      <div class="header-actions">
        <div class="view-switcher">
          <button class="view-btn" :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'" title="卡片模式">
            <LayoutGrid :size="18" />
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'" title="表格模式">
            <List :size="18" />
          </button>
        </div>
        <button class="create-btn" @click="onCreate">
          <PlusCircle :size="18" />
          <span>创建模板</span>
        </button>
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
      <div v-for="project in sortedProjects" :key="project.id" class="project-card">
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
      <el-table :data="sortedProjects" style="width: 100%" :header-cell-style="tableHeaderStyle" row-class-name="table-row">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutGrid, List, PlusCircle, FileCode2, FileText,
  Eye, Edit3, Play, Copy, Trash2,
} from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useTemplateStore } from '@/stores/template'
import { useSnippetStore } from '@/stores/snippet'
import PreviewIframe from '@/components/preview/PreviewIframe.vue'
import { compileTemplate, resolveSnippetData, wrapWithContainer, buildSpacingStyle, replacePlaceholders } from '@/engines/template-engine'
import { buildPreviewHtml } from '@/engines/preview-renderer'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const templateStore = useTemplateStore()
const snippetStore = useSnippetStore()

const loading = ref(false)
const viewMode = ref<'card' | 'table'>('card')
const showPreview = ref(false)
const previewHtml = ref('')

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
  const copy = await projectStore.duplicateProject(project.id)
  if (copy) {
    router.push(`/create/${copy.id}?mode=resume`)
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
    const [templateHtml, snippets] = await Promise.all([
      (await import('@/engines/yaml-parser')).getTemplateHtml(project.templateId),
      Promise.all(project.snippetInstances.map(async (inst) => {
        if (!inst.enabled) return null
        const config = await snippetStore.loadSnippetDetail(inst.snippetId)
        const html = snippetStore.getSnippetHtml(inst.snippetId)
        const data = resolveSnippetData(
          (inst.data && Object.keys(inst.data as object).length > 0) ? inst.data as Record<string, any> : {},
          config?.sampleData || {},
        )
        const compiledHtml = compileTemplate(html, { ...data, features: Array.isArray(data) ? data : [data] })
        const spacingStyle = buildSpacingStyle(inst.properties.spacing)
        const wrapped = wrapWithContainer(compiledHtml, inst.properties.className, spacingStyle)
        return { placeholder: inst.properties.placeholder, html: wrapped }
      })),
    ])
    const validSnippets = snippets.filter(Boolean) as { placeholder: string; html: string }[]
    let finalHtml = replacePlaceholders(templateHtml, validSnippets)
    previewHtml.value = buildPreviewHtml(finalHtml, project.customCss, project.seo.title)
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
