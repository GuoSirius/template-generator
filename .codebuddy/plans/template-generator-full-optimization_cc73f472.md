---
name: template-generator-full-optimization
overview: 优化模板生成器列表页和创建页功能，修复预览刷新时序bug，完善片段渲染顺序、CSS/JS注入位置、数据持久化等核心问题
design:
  architecture:
    framework: vue
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#38BDF8"
      - "#0284C7"
      - "#0EA5E9"
    background:
      - "#0F172A"
      - "#1E293B"
      - "#334155"
    text:
      - "#F8FAFC"
      - "#CBD5E1"
      - "#94A3B8"
    functional:
      - "#22C55E"
      - "#EF4444"
      - "#F59E0B"
      - "#10B981"
todos:
  - id: fix-list-page
    content: "完善列表页: 时间格式补全+全选功能+创建页跳转验证"
    status: completed
  - id: fix-preview-bug
    content: "修复预览刷新Bug: 并行化片段加载+调整时序+新增snippetsReady标志"
    status: completed
  - id: fix-css-inject
    content: 修正CSS注入位置到head最后面+验证JS注入位置
    status: completed
  - id: verify-preview-completeness
    content: "验证所有预览入口的完整性: 模板+JS+CSS+片段"
    status: completed
    dependencies:
      - fix-preview-bug
      - fix-css-inject
  - id: verify-persistence
    content: 验证页面刷新数据持久化和步骤恢复逻辑正确性
    status: completed
    dependencies:
      - fix-preview-bug
---

## 产品概述

一个低代码页面模板生成器，包含列表页和创建/编辑页两个核心页面，支持模板选择、片段配置、自定义CSS/JS、实时预览等功能。

## 核心功能

### 1. 列表页面

- **双模式展示**：选项卡(卡片)和表格两种模式，可切换
- **选择功能**：两种模式均支持单选、多选和全选
- **顶部操作栏**：批量删除按钮（确认后删除）、创建模板按钮（跳转干净的创建页）
- **显示字段**：项目名称、状态(已完成/制作中)、**创建时间**(完整年月日时分秒)、**编辑时间**(完整年月日时分秒)，按编辑时间倒序
- **操作按钮**：
- 预览：展示 模板+自定义JS+CSS+所有启用片段 的完整HTML
- 删除：确认后删除
- 复制：确认后复制完整数据跳转到创建页第一步
- 已完成 → 显示"编辑"按钮，跳转到最后一步
- 未完成 → 显示"去完成"按钮，跳转到上次离开时的步骤位置(currentStep)

### 2. 创建/编辑页面

- **两步向导**：Step1 选模板+SEO+实时预览 / Step2 配置片段
- **自定义JS/CSS**：独立对话框编辑，支持随时预览效果
- **预览完整性保障**：所有预览入口必须包含 模板+JS+CSS+片段
- **SEO信息**：仅传入模板HTML，由模板定义者决定渲染方式（支持lodash模板语法）
- **片段渲染顺序**：按占位符配置顺序 → 同占位符按片段列表顺序 → 无/不匹配占位符放最后
- **注入位置**：自定义CSS在head最后面，JS在body最后面
- **数据持久化**：刷新不丢失(IndexedDB)，上一步/下一步切换时右侧预览始终正常
- **关键Bug修复**：
- Bug1: 第一步刷新页面时右侧渲染缺少片段数据，点弹框预览后才正常
- Bug2: 第二步刷新返回第一步，右侧也不能正常渲染

## 技术栈

- 前端框架: Vue 3.5 + TypeScript + Vite 6
- UI 组件库: Element Plus 2.9 + UnoCSS
- 状态管理: Pinia (Composition API)
- 本地持久化: Dexie.js (IndexedDB)
- 模板引擎: lodash template
- 图标库: Lucide Vue Next
- 代码编辑: CodeMirror 6 (CSS/JS编辑器)
- 拖拽排序: vuedraggable

## 实现方案

### 核心策略

#### 1. 预览刷新Bug修复（最关键）

**根因**: `fullPreviewSrcdoc`(use-preview.ts:293)是同步computed,直接从`snippetStore.configs`/`htmlCache`(两个Map)读取片段资源。页面刷新后init()异步加载片段,但加载时序存在问题:

- init()第775-776行先设置`templateLoaded=true`(触发PreviewIframe渲染)
- 第794-796行才**顺序await**加载片段资源
- 导致fullPreviewSrcdoc计算时Map为空→片段被filter(Boolean)过滤→预览缺少片段
- 点击弹框预览走异步路径(ensureSnippetsLoaded)填充缓存→fullPreviewSrcdoc重算→恢复正常

**修复方案**:

- 将片段加载改为`Promise.all`并行加载,并移到`templateLoaded=true`之前完成
- 在use-preview.ts中新增`snippetsReady`响应式标志,fullPreviewSrcdoc依赖它
- ProjectCreateView的init()完成后调用`markSnippetsReady()`标记就绪
- PreviewIframe增加loading状态保护,在未就绪时不渲染空白内容

#### 2. 时间格式修复

formatDate函数当前缺少年份和秒,补全为完整的年月日时分秒格式

#### 3. 全选功能

卡片模式添加全选checkbox;表格模式利用el-table的toggleAllSelection能力

#### 4. CSS注入位置修正

preview-renderer.ts中将CSS注入位置从`</style>`前改为`</head>`前,确保在head最后面

#### 5. 创建页清空验证

确认onCreate()→router.push('/create')路径下init()无projectId分支的数据清空逻辑完整性

### 架构设计

```
用户操作 → View Component
              ↓
         Pinia Store (project/template/snippet)
              ↓                    ↘
    IndexedDB (Dexie)     Computed响应式
              ↓                    ↓
      [持久化]          usePreview composable
                              ↓
                    template-engine (lodash compile)
                              ↓
                    preview-renderer (HTML组装)
                              ↓
                    iframe srcdoc (实时渲染)

预览数据流保证:
  任何预览 = 模板HTML + SEO替换 + 片段渲染(占位符替换) + CSS(head末尾) + JS(body末尾)
```

### 关键执行要点

- **性能**: Promise.all并行加载片段替代顺序await,减少等待时间
- **响应式链路**: snippetsReady标志确保fullPreviewSrcdoc只在资源就绪后计算
- **blast radius控制**: 只修改必要的文件,不重构无关逻辑
- **向后兼容**: 保持所有现有API签名不变,只增加新的可选方法

## 设计风格

采用现代深色主题的管理后台风格,与项目现有的dark主题一致。界面专业简洁,操作直观高效。

## 页面设计

### 页面1: 项目列表页 (ProjectListView)

- **顶部区域**: 页面标题"我的模板"左侧 + 右侧操作栏(批量删除+创建模板+视图切换)
- **主内容区**: 卡片网格/表格两种视图,带全选控制
- **卡片视图**: 缩略图+名称+状态标签+时间信息+操作按钮组
- **表格视图**: el-table多列展示,含复选框列和操作列
- **预览弹窗**: Dialog+iframe展示完整HTML预览

### 页面2: 创建/编辑页 (ProjectCreateView)  

- **头部**: 步骤条(选择模板→配置片段) + JS/CSS/预览工具按钮
- **Step1**: 左右分栏 - 左侧(项目名称+模板选择+SEO折叠面板) + 右侧(实时预览iframe)
- **Step2**: 左右分栏 - 左侧(片段拖拽列表+添加按钮) + 右侧(属性/数据配置Tabs)
- **底部操作栏**: 上一步/下一步/保存并完成
- **各类对话框**: 片段选择/CSS编辑/JS编辑/快速预览/片段预览/保存确认

### 单页面Block设计(列表页为例)

1. **列表头部Block**: 标题+操作按钮组(批量删除/创建/视图切换),水平排列,24px间距
2. **空状态Block**: 居中图标+提示文字+创建按钮,仅在无数据时显示
3. **卡片网格Block**: auto-fill minmax(340px,1fr),每卡包含checkbox/预览区/信息区/操作区
4. **表格Block**: el-table含选择/名称/状态/模板/创建时间/更新时间/操作列
5. **预览弹窗Block**: 80%宽度Dialog内嵌PreviewIframe,70vh高度

## SubAgent

- **code-explorer**
- Purpose: 在实施过程中进行跨文件的代码影响分析和依赖关系验证
- Expected outcome: 确认每个修改点的影响范围,避免遗漏关联调用

## Skill

- **design-to-code-workflows**
- Purpose: 如涉及UI组件的调整或新增,使用此技能确保代码质量
- Expected outcome: 生成符合项目规范的高质量Vue组件代码