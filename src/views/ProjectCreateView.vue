<template>
  <div class="project-create-view">
    <!-- 步骤指示器 -->
    <div class="create-header">
      <el-steps :active="currentStep - 1" finish-status="success" align-center>
        <el-step title="选择模板" icon="Files" />
        <el-step title="配置片段" icon="Puzzle" />
      </el-steps>
      <div class="header-actions">
        <button class="icon-btn btn-js" title="定制 JavaScript" @click="showJsDialog = true">
          <Code :size="16" />
          <span class="btn-label">JS</span>
        </button>
        <button class="icon-btn btn-css" title="定制 CSS" @click="showCssDialog = true">
          <Paintbrush :size="16" />
          <span class="btn-label">CSS</span>
        </button>
        <button class="icon-btn btn-preview" title="预览效果" @click="openQuickPreview">
          <Eye :size="16" />
          <span class="btn-label">应用并预览</span>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 - 可滚动 -->
    <div class="main-content">
      <!-- Step 1: 模板选择 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step1-layout">
          <!-- 左侧：模板选择 + SEO -->
          <div class="step1-left">
            <div class="section-card">
              <h3 class="section-title">项目名称 <span class="required-mark">*</span></h3>
              <el-form
                :model="nameForm"
                :rules="nameRules"
                ref="nameFormRef"
                class="name-form-inline"
              >
                <el-form-item prop="name">
                  <el-input
                    v-model="nameForm.name"
                    placeholder="请输入项目名称"
                    size="default"
                    clearable
                    @change="onNameChange"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-form>
            </div>
            <div class="section-card">
              <h3 class="section-title">选择模板 <span class="required-mark">*</span></h3>
              <TemplateDropdown v-model="templateFolder" :templates="validTemplates" />
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
            <!-- 强制追踪 templateStore.currentHtml 的响应式变化 -->
            <PreviewIframe
              v-if="currentStep === 1 && templateStore.currentHtml"
              :srcdoc="forceTrackCurrentHtml()"
              class="step-preview"
            >
              <template #toolbar>
                <span class="toolbar-label">模板预览</span>
              </template>
            </PreviewIframe>
            <div v-else class="preview-placeholder">
              <FileCode2 :size="48" />
              <p v-if="!templateFolder">选择模板后查看预览</p>
              <p v-else>正在加载模板...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: 片段配置 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="step2-layout">
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
                @preview="onPreviewSnippet"
              />
            </div>
            <button class="add-snippet-btn" @click="showAddDialog = true">
              <Plus :size="18" />
              <span>添加片段</span>
            </button>
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
                  :sample-data="selectedSnippetConfig?.sampleData"
                  @update:model-value="onUpdateSnippetData"
                />
                <div v-else class="config-empty-data">
                  <p>请先选择一个片段</p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定底部操作栏 -->
    <div class="bottom-actions">
      <div v-if="currentStep === 1" class="action-left">
        <button class="action-btn btn-primary" :disabled="!templateFolder" @click="goToStep2">
          下一步
          <ChevronRight :size="18" />
        </button>
      </div>
      <div v-else class="action-left">
        <button class="action-btn btn-secondary" @click="goToStep1">
          <ChevronLeft :size="18" />
          上一步
        </button>
      </div>
      <div v-if="currentStep === 2" class="action-right">
        <button class="action-btn btn-primary" @click="onSaveProject">
          <Save :size="18" />
          保存并完成
        </button>
      </div>
    </div>

    <!-- 添加片段对话框 -->
    <SnippetAddDialog
      v-model="showAddDialog"
      :snippets="snippetStore.snippets"
      :existing-ids="existingSnippetIds"
      :template-folder="templateFolder"
      :custom-css="localCustomCss"
      :custom-js="localCustomJs"
      :seo-title="seoInfo.title"
      :seo-description="seoInfo.description"
      :seo-keywords="seoInfo.keywords"
      @add="onAddSnippet"
    />

    <!-- 定制 CSS 对话框 -->
    <CustomCssDialog
      v-model:visible="showCssDialog"
      :model-value="localCustomCss"
      :template-html="templateStore.currentHtml"
      :snippet-instances="snippetInstances"
      :seo-title="project?.seo.title || ''"
      @update:model-value="localCustomCss = $event"
      @save="onSaveCss"
    />

    <!-- 定制 JavaScript 对话框 -->
    <CustomJsDialog
      v-model:visible="showJsDialog"
      :model-value="localCustomJs"
      :template-html="templateStore.currentHtml"
      :snippet-instances="snippetInstances"
      :custom-css="localCustomCss"
      :seo-title="project?.seo.title || ''"
      @update:model-value="localCustomJs = $event"
      @save="onSaveJs"
    />

    <!-- 快速预览对话框 -->
    <PreviewDialog
      v-model="showQuickPreview"
      :srcdoc="quickPreviewHtml"
      title="页面预览"
      :height="'75vh'"
    />

    <!-- 片段预览对话框 -->
    <PreviewDialog
      v-model="showSnippetPreview"
      :srcdoc="snippetPreviewHtml"
      title="片段预览"
      :height="'75vh'"
    />

    <!-- 保存确认对话框 -->
    <SaveConfirmDialog
      v-model="showSaveConfirm"
      @goto-list="onGoToList"
      @stay="showSaveConfirm = false"
      @new-create="onNewCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import {
  Paintbrush,
  Eye,
  ChevronRight,
  ChevronLeft,
  Save,
  FileCode2,
  Code,
  Plus,
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
import CustomJsDialog from '@/components/js/CustomJsDialog.vue'
import SaveConfirmDialog from '@/components/common/SaveConfirmDialog.vue'
import PreviewIframe from '@/components/preview/PreviewIframe.vue'
import PreviewDialog from '@/components/preview/PreviewDialog.vue'
import { usePreview } from '@/composables/use-preview'
import type { SnippetConfig as SnippetConfigType, SnippetMeta, Spacing } from '@/types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const templateStore = useTemplateStore()
const snippetStore = useSnippetStore()
const {
  fullPreviewSrcdoc,
  ensureSnippetResources,
  setLocalCustomCode,
  generateSnippetPreviewHtml,
} = usePreview()

// State
const currentStep = ref(1)
const templateFolder = ref('')
const seoInfo = ref({ title: '', keywords: '', description: '' })
const selectedSnippetId = ref<string | null>(null)
const configTab = ref('props')
const showAddDialog = ref(false)
const showCssDialog = ref(false)
const showJsDialog = ref(false)
const showQuickPreview = ref(false)
const showSnippetPreview = ref(false)
const showSaveConfirm = ref(false)
const localCustomCss = ref('')
const localCustomJs = ref('')
const snippetPreviewHtml = ref('')
// templateLoaded 已移除，改用 templateStore.currentHtml 作为模板加载的唯一真相源
const nameFormRef = ref()
const nameForm = ref({ name: '' })
const projectNameValid = ref(false)

const nameRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度应为 2-50 个字符', trigger: 'blur' },
  ],
}

// 记录初始状态用于检测变动
const initialState = ref('')

// 检测数据是否有变动
function checkDataChanged() {
  if (!project.value) return false
  const currentState = JSON.stringify({
    name: nameForm.value.name,
    templateId: templateFolder.value,
    seo: seoInfo.value,
    customCss: localCustomCss.value,
    customJs: localCustomJs.value,
    snippets: snippetInstances.value.map((s) => ({
      id: s.id,
      snippetId: s.snippetId,
      enabled: s.enabled,
      data: s.data,
      properties: s.properties,
    })),
  })
  return initialState.value !== currentState
}

// Computed
const project = computed(() => projectStore.currentProject)
const snippetInstances = computed(() => project.value?.snippetInstances || [])
const placeholders = computed(() => templateStore.currentConfig?.placeholders || [])
const placeholderNames = computed(() => placeholders.value.map((p) => p.name))
const existingSnippetIds = computed(() => snippetInstances.value.map((s) => s.snippetId))
const isSeoFilled = computed(() => {
  return !!(seoInfo.value.title || seoInfo.value.keywords || seoInfo.value.description)
})

// 只返回有效的模板（排除 disabled: true 的模板）
const validTemplates = computed(() => {
  return templateStore.templates.filter((t) => !t.disabled)
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
  return snippetInstances.value.find((s) => s.id === selectedSnippetId.value) || null
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
          left: { value: 0, unit: 'px' as const },
        },
        placeholder: '',
        className: '',
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

// Quick preview (same as full preview)
const quickPreviewHtml = computed(() => fullPreviewSrcdoc.value)

// 强制追踪 templateStore.currentHtml 的响应式变化，确保 fullPreviewSrcdoc 能正确响应
function forceTrackCurrentHtml(): string {
  // 读取 templateStore.currentHtml 强制建立响应式依赖
  void templateStore.currentHtml
  // 读取 fullPreviewSrcdoc 确保使用最新的计算值
  return fullPreviewSrcdoc.value
}

// 强制追踪 currentHtml 变化，确保预览实时更新
// 使用 watch 显式追踪 currentTemplate 和 currentHtml 的变化
watch(
  () => [templateStore.currentTemplate, templateStore.currentHtml, templateStore.currentConfig],
  () => {
    const html = templateStore.currentHtml
    if (html) {
      void fullPreviewSrcdoc.value
    }
  },
  { immediate: true },
)

// 在 init 完成后强制触发一次追踪，确保响应式正确建立
onMounted(async () => {
  // 调用 init() 完成模板加载
  init()
  // 不 await，让 init 在后台执行，同时让 Vue 正常渲染
  // init() 内部已经 await 了所有必要的异步操作
})

// Watchers
// 监听模板选择变化：确保模板加载完成后更新视图
watch(templateFolder, async (folder, oldFolder) => {
  if (folder === oldFolder) return

  if (!folder) {
    // 清空模板选择
    templateStore.clearCurrent()
    return
  }

  // 等待模板列表加载完成（如果还没加载的话）
  if (templateStore.templates.length === 0) {
    await templateStore.loadTemplates()
    await nextTick()
  }

  // 确保选择的是有效的模板
  const meta = templateStore.templates.find((t) => t.folder === folder)
  if (!meta) {
    return
  }

  await templateStore.selectTemplate(folder)

  // 选择模板后，如果 SEO 尚未编辑过，则自动填充新模板的默认 SEO
  // 已编辑过的 SEO 保持不变，避免用户已填写的内容被覆盖
  await nextTick()
  if (templateStore.currentConfig?.seo && !isSeoFilled.value) {
    seoInfo.value = { ...templateStore.currentConfig.seo }
  }
})

watch([localCustomCss, localCustomJs], () => {
  // 同步本地定制代码到 composable，使预览实时生效
  setLocalCustomCode(localCustomCss.value, localCustomJs.value)
  if (project.value) {
    try {
      projectStore.setCustomCss(localCustomCss.value)
      projectStore.setCustomJs(localCustomJs.value)
    } catch {
      // 忽略同步错误
    }
  }
})

watch(
  seoInfo,
  (val) => {
    if (project.value && isSeoFilled.value) {
      try {
        projectStore.updateSeo(val)
      } catch {
        // 忽略 SEO 更新错误
      }
    }
  },
  { deep: true },
)

watch(
  nameForm,
  (val) => {
    projectNameValid.value = val.name.trim().length >= 2
    // 如果 SEO 标题为空，则和项目名称保持一致
    if (val.name && !seoInfo.value.title) {
      seoInfo.value.title = val.name
    }
  },
  { deep: true },
)

// Methods
async function goToStep1() {
  currentStep.value = 1
  // 返回Step1时更新项目状态
  if (project.value) {
    projectStore.updateCurrentProject({
      name: nameForm.value.name.trim(),
      templateId: templateFolder.value,
      seo: seoInfo.value,
      currentStep: 1,
    })
    projectStore.setStep(1)
  }

  // 模板已在 Step 1 选择时加载完毕（currentHtml 已设置），无需重新加载
  // currentStep 切换后模板预览 v-if="currentStep === 1 && templateStore.currentHtml" 自动显示

  // 静默预加载片段资源（后台填充 htmlCache，previewSrcdoc 会自动热更新）
  if (snippetInstances.value.length > 0) {
    const snippetIds = [...new Set(snippetInstances.value.map((inst) => inst.snippetId))]
    snippetIds.forEach((id) => snippetStore.loadSnippetDetail(id).catch(() => {}))
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

  const projectName = nameForm.value.name.trim()

  // 如果没有项目，先创建
  if (!project.value) {
    const newProject = projectStore.createProject(projectName, templateFolder.value)
    await projectStore.loadProject(newProject.id)
  }

  // 无论新建还是已有，都更新基本信息
  if (project.value) {
    projectStore.updateCurrentProject({
      name: projectName,
      templateId: templateFolder.value,
      seo: seoInfo.value,
      currentStep: 2,
    })
    projectStore.setStep(2)
  }

  currentStep.value = 2
}

async function onSelectSnippet(id: string) {
  selectedSnippetId.value = id
  // 保存选中的片段ID
  projectStore.setSelectedSnippet(id)
  // 设置tab: 优先使用上次的,否则默认'data'
  const savedTab = project.value?.snippetTabs[id]
  configTab.value = savedTab || 'data'
  // Load snippet detail if not cached
  const instance = snippetInstances.value.find((s) => s.id === id)
  if (instance) {
    await snippetStore.loadSnippetDetail(instance.snippetId)
  }
}

function onAddSnippet(folders: string | string[]) {
  if (!project.value) return
  const folderList = Array.isArray(folders) ? folders : [folders]
  let lastInstanceId = ''

  for (const folder of folderList) {
    const config = snippetStore.configs.get(folder)
    const defaultPlaceholder = config?.defaultPlaceholder || ''
    const newInstance = projectStore.addSnippetInstance(folder, folder, defaultPlaceholder)
    // 加载新片段的详细信息
    snippetStore.loadSnippetDetail(folder)
    lastInstanceId = newInstance.id
  }

  // 自动选中最后添加的片段
  selectedSnippetId.value = lastInstanceId
  // 切换到数据录入 tab
  configTab.value = 'data'
}

function onCopySnippet(id: string) {
  const snippet = snippetInstances.value.find((s) => s.id === id)
  const snippetName =
    snippetStore.snippets.find((s) => s.folder === snippet?.snippetId)?.name || '片段'

  ElMessageBox.confirm(`确定要复制「${snippetName}」吗？`, '确认复制', {
    confirmButtonText: '复制',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(() => {
      const copied = projectStore.duplicateSnippetInstance(id)
      if (copied) {
        // 选中新复制的片段
        selectedSnippetId.value = copied.id
        // 切换到数据 tab
        configTab.value = 'data'
      }
    })
    .catch(() => {
      // 用户取消
    })
}

function onDeleteSnippet(id: string) {
  ElMessageBox.confirm('确定要删除此片段吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      projectStore.removeSnippetInstance(id)
      if (selectedSnippetId.value === id) {
        selectedSnippetId.value = null
      }
      ElMessage.success('已删除')
    })
    .catch(() => {})
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

function onUpdateSnippetData(data: Record<string, unknown> | Record<string, unknown>[]) {
  if (!selectedInstance.value) return
  projectStore.updateSnippetInstance(selectedInstance.value.id, { data })
}

async function onPreviewSnippet(id: string) {
  const instance = snippetInstances.value.find((s) => s.id === id)
  if (!instance) return

  try {
    // 确保模板已加载
    if (!templateFolder.value) {
      ElMessage.warning('请先选择模板')
      return
    }

    // 使用 generateSnippetPreviewHtml 生成完整的预览HTML
    // 包含：模板 + 当前片段 + 自定义CSS/JS + SEO
    const previewHtml = await generateSnippetPreviewHtml({
      templateFolder: templateFolder.value,
      snippetFolders: [instance.snippetId],
      customCss: localCustomCss.value,
      customJs: localCustomJs.value,
      seoTitle: seoInfo.value.title,
      seoDescription: seoInfo.value.description,
      seoKeywords: seoInfo.value.keywords,
    })

    snippetPreviewHtml.value = previewHtml
    showSnippetPreview.value = true
  } catch {
    ElMessage.error('生成预览失败')
  }
}

function onSaveCss(css: string) {
  localCustomCss.value = css
  if (project.value) {
    projectStore.setCustomCss(css)
  }
  ElMessage.success('CSS 已应用')
}

function onSaveJs(js: string) {
  localCustomJs.value = js
  if (project.value) {
    projectStore.setCustomJs(js)
  }
  ElMessage.success('JavaScript 已应用')
}

function openQuickPreview() {
  // 确保所有片段资源已加载，然后打开预览
  ensureSnippetResources()
    .then(() => {
      showQuickPreview.value = true
    })
    .catch(() => {
      showQuickPreview.value = true
    })
}

function onTabChange(tabName: string | number) {
  if (
    selectedSnippetId.value &&
    typeof tabName === 'string' &&
    (tabName === 'props' || tabName === 'data')
  ) {
    projectStore.setSnippetTab(selectedSnippetId.value, tabName as 'props' | 'data')
  }
}

async function onSaveProject() {
  if (!project.value) return
  projectStore.completeProject()
  await projectStore.saveCurrentProject()

  // 更新初始状态，防止保存后仍提示离开确认
  initialState.value = JSON.stringify({
    name: nameForm.value.name,
    templateId: templateFolder.value,
    seo: seoInfo.value,
    customCss: localCustomCss.value,
    customJs: localCustomJs.value,
    snippets: snippetInstances.value.map((s) => ({
      id: s.id,
      snippetId: s.snippetId,
      enabled: s.enabled,
      data: s.data,
      properties: s.properties,
    })),
  })

  showSaveConfirm.value = true
}

function onGoToList() {
  router.push('/')
}

async function onNewCreate(copyData: boolean) {
  if (copyData && project.value) {
    // 复制当前数据新建，保留当前数据
    const copy = await projectStore.duplicateProject(project.value.id)
    if (copy) {
      router.push(`/create/${copy.id}?mode=resume`)
      return
    }
  }
  // 清空所有数据新建，跳转到第一步
  // 1. 清除当前项目
  projectStore.currentProject = null
  // 2. 重置所有表单状态
  templateFolder.value = ''
  nameForm.value.name = ''
  seoInfo.value = { title: '', keywords: '', description: '' }
  localCustomCss.value = ''
  localCustomJs.value = ''
  // 3. 同步清空本地定制代码到预览系统
  setLocalCustomCode('', '')
  selectedSnippetId.value = null
  currentStep.value = 1
  projectNameValid.value = false
  // 3.5 重置片段就绪标志（init会重新设置）
  // 4. 重置初始状态
  initialState.value = JSON.stringify({
    name: nameForm.value.name,
    templateId: templateFolder.value,
    seo: seoInfo.value,
    customCss: localCustomCss.value,
    customJs: localCustomJs.value,
    snippets: [],
  })
  // 5. 关闭保存确认对话框
  showSaveConfirm.value = false
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
      localCustomCss.value = project.value.customCss || ''
      localCustomJs.value = project.value.customJs || ''
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
    // 没有项目ID时,清除当前项目,保持在步骤1
    // 这是修复bug的关键：当从模板列表直接点击创建菜单进入时，清除之前的项目数据
    if (projectStore.currentProject) {
      // 清除当前项目，确保预览不会显示上次的代码片段
      projectStore.currentProject = null
    }
    // 重置所有表单状态
    templateFolder.value = ''
    nameForm.value.name = ''
    seoInfo.value = { title: '', keywords: '', description: '' }
    localCustomCss.value = ''
    localCustomJs.value = ''
    // 同步清空本地定制代码到预览系统
    setLocalCustomCode('', '')
    selectedSnippetId.value = null
    currentStep.value = 1
    projectNameValid.value = false
  }

  // Load templates and snippets
  await Promise.all([templateStore.loadTemplates(), snippetStore.loadSnippets()])

  // 等待模板列表渲染完成，确保 validTemplates 计算属性就绪
  await nextTick()

  // 根据是否有项目决定模板加载策略
  if (!templateFolder.value && validTemplates.value.length > 0) {
    // 无项目：自动选择第一个模板（watch 会处理加载）
    const firstTemplate = validTemplates.value[0]
    templateFolder.value = firstTemplate.folder
    // 等待 watch 中的 selectTemplate 完成
    await nextTick()
  }

  // 填充 SEO 默认值
  if (templateStore.currentConfig?.seo && !isSeoFilled.value) {
    seoInfo.value = { ...templateStore.currentConfig.seo }
  }
  if (nameForm.value.name && !seoInfo.value.title) {
    seoInfo.value.title = nameForm.value.name
  }

  // Load all snippet configs for existing instances (并行加载，避免时序问题)
  // 注意：不再等待完成才显示预览，fullPreviewSrcdoc 会立即渲染模板+已有片段
  if (snippetInstances.value.length > 0) {
    const snippetIds = [...new Set(snippetInstances.value.map((inst) => inst.snippetId))]
    // 静默后台加载，不阻塞 init 返回
    snippetIds.forEach((id) => snippetStore.loadSnippetDetail(id).catch(() => {}))
  }

  // 初始化选中的片段: 优先使用上次选中的,否则选中第一个
  if (snippetInstances.value.length > 0) {
    if (project.value?.lastSelectedSnippetId) {
      selectedSnippetId.value = project.value.lastSelectedSnippetId
    } else {
      selectedSnippetId.value = snippetInstances.value[0].id
    }
  }

  // 初始化完成后记录初始状态
  initialState.value = JSON.stringify({
    name: nameForm.value.name,
    templateId: templateFolder.value,
    seo: seoInfo.value,
    customCss: localCustomCss.value,
    customJs: localCustomJs.value,
    snippets: snippetInstances.value.map((s) => ({
      id: s.id,
      snippetId: s.snippetId,
      enabled: s.enabled,
      data: s.data,
      properties: s.properties,
    })),
  })
}

onMounted(() => {
  // 设置离开页面确认
  onBeforeRouteLeave(async () => {
    if (checkDataChanged()) {
      try {
        await ElMessageBox.confirm('您有未保存的更改，确定要离开吗？', '离开确认', {
          confirmButtonText: '离开',
          cancelButtonText: '取消',
          type: 'warning',
        })
        return true
      } catch {
        return false
      }
    }
    return true
  })
})
</script>

<style scoped>
.project-create-view {
  max-width: 100%;
  margin: -20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 56px));
  overflow: hidden;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-primary);
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
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

.btn-js {
  background: #8b5cf6;
}
.btn-css {
  background: #f59e0b;
}
.btn-preview {
  background: #10b981;
}
.btn-secondary {
  background: #475569;
}
.btn-apply {
  background: #10b981;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-label {
  font-size: 12px;
}

/* Step content - 不滚动，由子元素控制 */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.name-input-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.name-form {
  margin: 0;
}

.name-form :deep(.el-form-item) {
  margin-bottom: 0;
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
  overflow: hidden;
}

.step1-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  flex: 1;
}

.step1-right {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
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
  color: #f56c6c;
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
  grid-template-columns: 300px 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.col-snippets {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
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
  min-height: 0;
}

.add-snippet-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  margin-top: 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-snippet-btn:hover {
  filter: brightness(1.15);
  transform: scale(1.02);
}

.col-config {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.col-config :deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.col-config :deep(.el-tabs__header) {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.col-config :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.col-config :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
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
  background: #64748b;
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

/* Footer - 固定底部 */
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-primary);
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 底部操作栏 */
.bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-primary);
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
}

.action-left,
.action-right {
  display: flex;
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
  background: linear-gradient(135deg, #38bdf8, #0284c7);
}

.btn-secondary {
  background: #3b82f6;
}

.toolbar-label {
  font-size: 12px;
  color: var(--text-muted);
}

.preview-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 40px;
}

.preview-dialog-title {
  font-size: 15px;
  font-weight: 600;
}

.preview-dialog-actions {
  display: flex;
  gap: 8px;
}
</style>
