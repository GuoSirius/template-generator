<template>
  <div class="project-create-view">
    <!-- 步骤指示器 -->
    <div class="create-header">
      <el-steps :active="currentStep - 1" finish-status="success" align-center>
        <el-step title="选择模板" icon="Files" />
        <el-step title="配置片段" icon="Puzzle" />
      </el-steps>
      <div class="header-actions">
        <button class="icon-btn btn-css" title="定制 CSS" @click="showCssDialog = true">
          <Paintbrush :size="16" />
          <span class="btn-label">CSS</span>
        </button>
        <button class="icon-btn btn-preview" title="预览效果" @click="showQuickPreview = true">
          <Eye :size="16" />
          <span class="btn-label">预览</span>
        </button>
      </div>
    </div>

    <!-- 项目名称输入 - 所有步骤可见 -->
    <div class="name-input-inline">
      <span class="name-label">项目名称 <span class="required-mark">*</span></span>
      <el-form :model="nameForm" :rules="nameRules" ref="nameFormRef" class="name-form-inline">
        <el-form-item prop="name">
          <el-input
            v-model="nameForm.name"
            placeholder="请输入项目名称"
            size="default"
            clearable
            @change="onNameChange"
            style="width: 240px;"
          />
        </el-form-item>
      </el-form>
      <el-alert
        v-if="!projectNameValid && currentStep === 1"
        title="请输入项目名称"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <!-- Step 1: 模板选择 -->
    <div v-if="currentStep === 1" class="step-content">

      <div class="step1-layout">
        <!-- 左侧：模板选择 + SEO -->
        <div class="step1-left">
          <div class="section-card">
            <h3 class="section-title">选择模板 <span class="required-mark">*</span></h3>
            <TemplateDropdown
              v-model="templateFolder"
              :templates="templateStore.templates"
            />
            <TemplateInfo
              :template="templateStore.currentTemplate"
              :placeholders="placeholders"
              class="template-info"
            />
          </div>
          <el-collapse class="seo-collapse">
            <el-collapse-item title="SEO 信息" name="seo">
              <SeoForm v-model="seoInfo" />
            </el-collapse-item>
          </el-collapse>
        </div>
        <!-- 右侧：模板预览 -->
        <div class="step1-right">
          <PreviewIframe
            v-if="templatePreviewHtml"
            :srcdoc="templatePreviewHtml"
            class="step-preview"
          >
            <template #toolbar>
              <span class="toolbar-label">模板预览</span>
            </template>
          </PreviewIframe>
          <div v-else class="preview-placeholder">
            <FileCode2 :size="48" />
            <p>选择模板后查看预览</p>
          </div>
        </div>
      </div>
      <div class="step-footer">
        <button class="action-btn btn-primary" :disabled="!templateFolder" @click="goToStep2">
          下一步
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <!-- Step 2: 片段配置 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step2-layout" :class="{ collapsed: previewCollapsed }">
        <!-- 第一列：片段列表 -->
        <div class="col-snippets">
          <h3 class="col-title">片段列表</h3>
          <div class="snippet-list-wrapper">
            <SnippetList
              :instances="snippetInstances"
              :snippets="snippetStore.snippets"
              :selected-id="selectedSnippetId"
              @select="onSelectSnippet"
              @add="showAddDialog = true"
              @copy="onCopySnippet"
              @delete="onDeleteSnippet"
              @toggle="onToggleSnippet"
              @reorder="onReorderSnippets"
            />
          </div>
        </div>

        <!-- 第二列：片段配置 -->
        <div class="col-config">
          <el-tabs v-model="configTab" @tab-change="onTabChange">
            <el-tab-pane label="属性设置" name="props">
              <SnippetConfig
                :snippet-config="selectedSnippetConfig"
                :snippet-meta="selectedSnippetMeta"
                :properties="selectedProperties"
                :placeholder-names="placeholderNames"
                @update:properties="onUpdateProperties"
              />
            </el-tab-pane>
            <el-tab-pane label="数据录入" name="data">
              <DynamicForm
                v-if="selectedSnippetConfig"
                :schema="selectedSnippetConfig.formSchema"
                :model-value="selectedSnippetData"
                @update:model-value="onUpdateSnippetData"
              />
              <div v-else class="config-empty-data">
                <p>请先选择一个片段</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 第三列：完整预览 -->
        <div class="col-preview" :class="{ hidden: previewCollapsed }">
          <div class="preview-header">
            <span class="col-title">完整预览</span>
            <div class="preview-actions">
              <button class="icon-btn btn-preview" title="全屏预览" @click="togglePreviewFullscreen">
                <Maximize2 v-if="!isPreviewFullscreen" :size="14" />
                <Minimize2 v-else :size="14" />
              </button>
              <button class="icon-btn btn-secondary" title="折叠预览" @click="previewCollapsed = true">
                <PanelRightClose :size="14" />
              </button>
            </div>
          </div>
          <div class="preview-body" ref="fullPreviewRef">
            <PreviewIframe
              v-if="fullPreviewHtml"
              :srcdoc="fullPreviewHtml"
              :show-toolbar="false"
            />
          </div>
        </div>
      </div>

      <!-- 折叠预览时的展开按钮 -->
      <button v-if="previewCollapsed" class="expand-preview-btn" @click="previewCollapsed = false">
        <PanelRightOpen :size="16" />
        <span>展开预览</span>
      </button>

      <div class="step-footer">
        <button class="action-btn btn-secondary" @click="goToStep1">
          <ChevronLeft :size="18" />
          上一步
        </button>
        <div class="footer-actions">
          <button class="action-btn btn-apply" @click="onApplyPreview">
            <Play :size="18" />
            应用预览
          </button>
          <button class="action-btn btn-primary" @click="onSaveProject">
            <Save :size="18" />
            保存并完成
          </button>
        </div>
      </div>
    </div>

    <!-- 添加片段对话框 -->
    <SnippetAddDialog
      v-model="showAddDialog"
      :snippets="snippetStore.snippets"
      :existing-ids="existingSnippetIds"
      @add="onAddSnippet"
    />

    <!-- 定制 CSS 对话框 -->
    <CustomCssDialog
      v-model:visible="showCssDialog"
      :model-value="localCustomCss"
      :preview-html="cssPreviewBaseHtml"
      @update:model-value="localCustomCss = $event"
      @save="onSaveCss"
    />

    <!-- 快速预览对话框 -->
    <el-dialog
      v-model="showQuickPreview"
      title="页面预览"
      width="85%"
      top="3vh"
      destroy-on-close
    >
      <PreviewIframe
        v-if="quickPreviewHtml"
        :srcdoc="quickPreviewHtml"
        :show-toolbar="false"
        style="height: 75vh;"
      />
    </el-dialog>

    <!-- 保存确认对话框 -->
    <SaveConfirmDialog
      v-model="showSaveConfirm"
      @goto-list="onGoToList"
      @stay="showSaveConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Files, Puzzle, Paintbrush, Eye, ChevronRight, ChevronLeft,
  Save, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, FileCode2, Play,
} from 'lucide-vue-next'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores/project'
import { useTemplateStore } from '@/stores/template'
import { useSnippetStore } from '@/stores/snippet'
import TemplateDropdown from '@/components/template/TemplateDropdown.vue'
import TemplateInfo from '@/components/template/TemplateInfo.vue'
import SeoForm from '@/components/template/SeoForm.vue'
import SnippetList from '@/components/snippet/SnippetList.vue'
import SnippetConfig from '@/components/snippet/SnippetConfig.vue'
import DynamicForm from '@/components/snippet/DynamicForm.vue'
import SnippetAddDialog from '@/components/snippet/SnippetAddDialog.vue'
import CustomCssDialog from '@/components/css/CustomCssDialog.vue'
import SaveConfirmDialog from '@/components/common/SaveConfirmDialog.vue'
import PreviewIframe from '@/components/preview/PreviewIframe.vue'
import { useFullscreen } from '@/composables/use-fullscreen'
import {
  compileTemplate, resolveSnippetData, wrapWithContainer,
  buildSpacingStyle, replacePlaceholders,
} from '@/engines/template-engine'
import { buildPreviewHtml, buildSnippetPreviewHtml } from '@/engines/preview-renderer'
import type { SnippetConfig as SnippetConfigType, SnippetMeta, Spacing } from '@/types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const templateStore = useTemplateStore()
const snippetStore = useSnippetStore()
const { isFullscreen: isPreviewFullscreen, toggleFullscreen } = useFullscreen()

// State
const currentStep = ref(1)
const templateFolder = ref('')
const seoInfo = ref({ title: '', keywords: '', description: '' })
const selectedSnippetId = ref<string | null>(null)
const configTab = ref('props')
const previewCollapsed = ref(false)
const showAddDialog = ref(false)
const showCssDialog = ref(false)
const showQuickPreview = ref(false)
const showSaveConfirm = ref(false)
const localCustomCss = ref('')
const fullPreviewRef = ref<HTMLElement>()
const nameFormRef = ref()
const nameForm = ref({ name: '' })
const projectNameValid = ref(false)

const nameRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度应为 2-50 个字符', trigger: 'blur' },
  ],
}

// Computed
const project = computed(() => projectStore.currentProject)
const snippetInstances = computed(() => project.value?.snippetInstances || [])
const placeholders = computed(() => templateStore.currentConfig?.placeholders || [])
const placeholderNames = computed(() => placeholders.value.map(p => p.name))
const existingSnippetIds = computed(() => snippetInstances.value.map(s => s.snippetId))
const isSeoFilled = computed(() => {
  return !!(seoInfo.value.title || seoInfo.value.keywords || seoInfo.value.description)
})

const selectedSnippetConfig = computed<SnippetConfigType | null>(() => {
  if (!selectedInstance.value) return null
  return snippetStore.configs.get(selectedInstance.value.snippetId) || null
})

const selectedSnippetMeta = computed<SnippetMeta | null>(() => {
  if (!selectedInstance.value) return null
  return snippetStore.getSnippetMeta(selectedInstance.value.snippetId) || null
})

const selectedInstance = computed(() => {
  if (!selectedSnippetId.value) return null
  return snippetInstances.value.find(s => s.id === selectedSnippetId.value) || null
})

const selectedProperties = computed<{
  spacing: Spacing
  placeholder: string
  className: string
}>({
  get: () => {
    if (!selectedInstance.value) {
      return {
        spacing: {
          top: { value: 0, unit: 'px' as const },
          right: { value: 0, unit: 'px' as const },
          bottom: { value: 0, unit: 'px' as const },
          left: { value: 0, unit: 'px' as const }
        },
        placeholder: '',
        className: ''
      }
    }
    return selectedInstance.value.properties
  },
  set: () => {},
})

const selectedSnippetData = computed(() => {
  if (!selectedInstance.value) return {}
  return selectedInstance.value.data
})

// Step1: template preview
const templatePreviewHtml = computed(() => {
  if (!templateStore.currentHtml) return ''
  return buildPreviewHtml(templateStore.currentHtml, localCustomCss.value)
})

// Step2: full preview (all enabled snippets rendered)
const fullPreviewHtml = computed(() => {
  if (!project.value || !templateStore.currentHtml) return ''
  const enabledInstances = snippetInstances.value.filter(s => s.enabled)
  const renderedSnippets = enabledInstances.map(inst => {
    const config = snippetStore.configs.get(inst.snippetId)
    const html = snippetStore.getSnippetHtml(inst.snippetId)
    if (!html) return null
    const data = resolveSnippetData(inst.data as Record<string, any>, config?.sampleData || {})

    console.log('[Preview] Rendering snippet:', inst.snippetId, 'data:', data)

    let compiled = html
    try {
      if (config?.formSchema.type === 'array') {
        // 数组类型: 将数据作为数组传递
        compiled = compileTemplate(html, { features: Array.isArray(data) ? data : [data] })
      } else {
        compiled = compileTemplate(html, { ...(data as Record<string, any>) })
      }
    } catch (e) {
      console.error('Compile error:', e)
      return null
    }
    const spacingStyle = buildSpacingStyle(inst.properties.spacing)
    const wrapped = wrapWithContainer(compiled, inst.properties.className, spacingStyle)
    return { placeholder: inst.properties.placeholder, html: wrapped }
  }).filter(Boolean) as { placeholder: string; html: string }[]

  console.log('[Preview] Rendered snippets count:', renderedSnippets.length)

  let finalHtml = replacePlaceholders(templateStore.currentHtml, renderedSnippets)
  return buildPreviewHtml(
    finalHtml,
    localCustomCss.value,
    project.value.seo.title,
    project.value.seo.description,
    project.value.seo.keywords,
  )
})

// Quick preview (same as full preview)
const quickPreviewHtml = computed(() => fullPreviewHtml.value)

// CSS dialog preview base
const cssPreviewBaseHtml = computed(() => {
  if (!templateStore.currentHtml) return ''
  return buildPreviewHtml(templateStore.currentHtml, '', project.value?.seo.title)
})

// Watchers
watch(templateFolder, async (folder) => {
  if (folder) {
    await templateStore.selectTemplate(folder)
    // 加载模板后,填充 SEO 默认值
    if (templateStore.currentConfig?.seo && !isSeoFilled.value) {
      seoInfo.value = { ...templateStore.currentConfig.seo }
    }
  }
})

watch(localCustomCss, (val) => {
  if (project.value) {
    try {
      projectStore.setCustomCss(val)
    } catch (e) {
      console.error('Failed to set custom CSS:', e)
    }
  }
})

watch(seoInfo, (val) => {
  if (project.value && isSeoFilled.value) {
    try {
      projectStore.updateSeo(val)
    } catch (e) {
      console.error('Failed to update SEO:', e)
    }
  }
}, { deep: true })

watch(nameForm, (val) => {
  projectNameValid.value = val.name.trim().length >= 2
}, { deep: true })

// Methods
function goToStep1() {
  currentStep.value = 1
  if (project.value) {
    projectStore.setStep(1)
  }
}

function onNameChange() {
  const projectName = nameForm.value.name.trim()
  if (project.value && projectName.length >= 2 && project.value.name !== projectName) {
    projectStore.updateCurrentProject({ name: projectName })
  }
}

async function goToStep2() {
  // 验证项目名称
  if (!nameFormRef.value) return
  try {
    await nameFormRef.value.validate()
  } catch {
    ElMessage.warning('请先输入项目名称')
    return
  }

  // 验证模板选择
  if (!templateFolder.value) {
    ElMessage.warning('请先选择模板')
    return
  }

  // 如果是新项目,创建项目
  if (!project.value) {
    const projectName = nameForm.value.name.trim()
    const newProject = projectStore.createProject(projectName, templateFolder.value)
    await projectStore.loadProject(newProject.id)
  }

  currentStep.value = 2
  if (project.value) {
    projectStore.updateCurrentProject({ templateId: templateFolder.value })
    projectStore.setStep(2)
  }
}

async function onSelectSnippet(id: string) {
  selectedSnippetId.value = id
  // 保存选中的片段ID
  projectStore.setSelectedSnippet(id)
  // 设置tab: 优先使用上次的,否则默认'data'
  const savedTab = project.value?.snippetTabs[id]
  configTab.value = savedTab || 'data'
  // Load snippet detail if not cached
  const instance = snippetInstances.value.find(s => s.id === id)
  if (instance) {
    await snippetStore.loadSnippetDetail(instance.snippetId)
  }
}

function onAddSnippet(folder: string) {
  if (!project.value) return
  const config = snippetStore.configs.get(folder)
  const defaultPlaceholder = config?.defaultPlaceholder || ''
  projectStore.addSnippetInstance(folder, folder, defaultPlaceholder)
}

function onCopySnippet(id: string) {
  projectStore.duplicateSnippetInstance(id)
}

function onDeleteSnippet(id: string) {
  ElMessageBox.confirm('确定要删除此片段吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    projectStore.removeSnippetInstance(id)
    if (selectedSnippetId.value === id) {
      selectedSnippetId.value = null
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

function onToggleSnippet(id: string, enabled: boolean) {
  projectStore.updateSnippetInstance(id, { enabled })
}

function onReorderSnippets(instances: typeof snippetInstances.value) {
  projectStore.reorderSnippetInstances(instances)
}

function onUpdateProperties(props: { spacing: Spacing; placeholder: string; className: string }) {
  if (!selectedInstance.value) return
  projectStore.updateSnippetInstance(selectedInstance.value.id, { properties: props })
}

function onUpdateSnippetData(data: Record<string, any> | Record<string, any>[]) {
  if (!selectedInstance.value) return
  projectStore.updateSnippetInstance(selectedInstance.value.id, { data })
}

function onSaveCss(css: string) {
  localCustomCss.value = css
  if (project.value) {
    projectStore.setCustomCss(css)
  }
  ElMessage.success('CSS 已应用')
}

function togglePreviewFullscreen() {
  if (fullPreviewRef.value) {
    toggleFullscreen(fullPreviewRef.value)
  }
}

function onTabChange(tabName: string | number) {
  if (selectedSnippetId.value && typeof tabName === 'string' && (tabName === 'props' || tabName === 'data')) {
    projectStore.setSnippetTab(selectedSnippetId.value, tabName as 'props' | 'data')
  }
}

async function onApplyPreview() {
  // 应用预览: 强制更新预览HTML
  // fullPreviewHtml 是计算属性,数据变化会自动重新计算
  // 这里只需要确保数据已保存到 store
  if (project.value) {
    await projectStore.saveCurrentProject()
    ElMessage.success('预览已更新')
  }
}

async function onSaveProject() {
  if (!project.value) return
  projectStore.completeProject()
  await projectStore.saveCurrentProject()
  showSaveConfirm.value = true
}

function onGoToList() {
  router.push('/')
}

// Init
async function init() {
  const projectId = route.params.id as string
  const mode = (route.query.mode as string) || 'edit'

  if (projectId) {
    await projectStore.loadProject(projectId)
    if (project.value) {
      templateFolder.value = project.value.templateId
      seoInfo.value = { ...project.value.seo }
      localCustomCss.value = project.value.customCss
      nameForm.value.name = project.value.name
      projectNameValid.value = true
      // 根据项目当前步骤或模式设置步骤
      if (mode === 'resume') {
        currentStep.value = project.value.currentStep
      } else if (mode === 'edit') {
        currentStep.value = 2
      }
    }
  } else {
    // 没有项目ID时,保持在步骤1
    currentStep.value = 1
  }

  // Load templates and snippets
  await Promise.all([
    templateStore.loadTemplates(),
    snippetStore.loadSnippets(),
  ])

  // If we have a template selected, load its config
  if (templateFolder.value) {
    await templateStore.selectTemplate(templateFolder.value)
  }

  // Load all snippet configs for existing instances
  for (const inst of snippetInstances.value) {
    await snippetStore.loadSnippetDetail(inst.snippetId)
  }

  // 初始化选中的片段: 优先使用上次选中的,否则选中第一个
  if (snippetInstances.value.length > 0) {
    if (project.value?.lastSelectedSnippetId) {
      selectedSnippetId.value = project.value.lastSelectedSnippetId
    } else {
      selectedSnippetId.value = snippetInstances.value[0].id
    }
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.project-create-view {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.create-header :deep(.el-steps) {
  flex: 1;
  min-width: 300px;
}

.create-header :deep(.el-step__title) {
  font-size: 13px;
}

.create-header :deep(.el-step__icon) {
  width: 24px;
  height: 24px;
  font-size: 13px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.icon-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.15);
}

.btn-css { background: #F59E0B; }
.btn-preview { background: #22C55E; }
.btn-secondary { background: #475569; }
.btn-apply { background: #10B981; }

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-label {
  font-size: 12px;
}

/* Step content */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.name-input-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  margin-bottom: 8px;
}

.name-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.name-form-inline {
  margin: 0;
}

.name-form-inline :deep(.el-form-item) {
  margin-bottom: 0;
}

/* Step 1 layout */
.step1-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.step1-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.step1-right {
  min-height: 500px;
}

.section-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.required-mark {
  color: #F56C6C;
  margin-left: 4px;
}

.template-info {
  margin-top: 16px;
}

.seo-collapse {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.seo-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  color: var(--text-primary);
  border: none;
  padding: 0 16px;
}

.seo-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.seo-collapse :deep(.el-collapse-item__content) {
  padding: 0 16px 16px;
}

.step-preview {
  height: 100%;
  min-height: 500px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-muted);
  gap: 12px;
  font-size: 14px;
}

/* Step 2 layout */
.step2-layout {
  display: grid;
  grid-template-columns: 280px 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  transition: all 0.3s;
}

.step2-layout.collapsed {
  grid-template-columns: 280px 1fr;
}

.col-snippets {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.col-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.snippet-list-wrapper {
  flex: 1;
  overflow-y: auto;
}

.col-config {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 240px);
}

.col-config :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.col-config :deep(.el-tabs__item) {
  font-weight: 600;
}

.config-empty-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.col-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s;
}

.col-preview.hidden {
  display: none;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.preview-actions {
  display: flex;
  gap: 4px;
}

.preview-body {
  flex: 1;
  overflow: hidden;
}

.expand-preview-btn {
  position: absolute;
  right: 0;
  top: 120px;
  transform: translate(50%, 0);
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  width: 32px;
  height: 80px;
  border: none;
  border-radius: 16px 0 0 16px;
  background: #475569;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.expand-preview-btn:hover {
  background: #64748B;
  width: 48px;
}

.expand-preview-btn svg {
  margin: 0;
}

.expand-preview-btn span {
  display: none;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  white-space: nowrap;
}

.expand-preview-btn:hover span {
  display: block;
}

.step-content {
  position: relative;
}

/* Footer */
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.action-btn:hover {
  transform: scale(1.02);
  filter: brightness(1.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #38BDF8, #0284C7);
}

.btn-secondary {
  background: #475569;
}

.toolbar-label {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
