---
name: template-generator-plan-v2
overview: 基于 Vue3+Vite+Element Plus+UnoCSS 的模板生成器项目，新增：模板下拉选择、版本/预览图/占位符 tag 展示、片段启用/禁用机制、片段属性（四方向留白+占位符绑定+class名）、自定义 CSS 弹窗（语法高亮）、列表页编辑/去完成双逻辑、图片点击放大预览、以及 Docker 详尽文档等。
design:
  architecture:
    framework: vue
  styleKeywords:
    - Dark Mode First
    - Glassmorphism
    - Micro-interactions
    - High Contrast Menu
    - Modern Dashboard
    - Clean Layout
  fontSystem:
    fontFamily: system-ui, -apple-system, sans-serif
    heading:
      size: 28px
      weight: 700
    subheading:
      size: 20px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#38BDF8"
      - "#0EA5E9"
      - "#0284C7"
    background:
      - "#0F172A"
      - "#1E293B"
      - "#334155"
    text:
      - "#F8FAFC"
      - "#94A3B8"
      - "#CBD5E1"
    functional:
      - "#22C55E"
      - "#EF4444"
      - "#F59E0B"
      - "#8B5CF6"
todos:
  - id: project-init
    content: 初始化 Vue3+Vite5+TypeScript 项目，安装全部依赖，配置 vite.config.ts、uno.config.ts、tsconfig、ESLint、Prettier、.nvmrc(Node 24)、gitignore
    status: completed
  - id: core-infra
    content: 实现核心基础设施：types/ 类型定义、database/ Dexie数据库层、engines/ 四大引擎（yaml-parser、template-engine、form-engine、preview-renderer、css-engine）
    status: completed
    dependencies:
      - project-init
  - id: template-data
    content: 创建 public/template/ 目录结构，编写示例模板（landing-page）和片段（hero-banner、feature-card）的 HTML 及 YAML 配置，含 pages.yaml 和 snippets.yaml 注册表
    status: completed
    dependencies:
      - project-init
  - id: layout-theme
    content: 实现 AppLayout/AppHeader/AppSidebar 布局组件和 use-theme 主题系统（暗色/亮色/跟随系统，默认暗色），侧边栏高对比度菜单配色 + tooltip
    status: completed
    dependencies:
      - core-infra
  - id: stores
    content: 实现 Pinia Stores（app/template/snippet/project），含 projectStore 自动保存 IndexedDB、use-auto-save 防抖封装
    status: completed
    dependencies:
      - core-infra
  - id: list-page
    content: 实现列表页（ProjectListView），含空状态引导、卡片网格、预览/编辑/去完成/复制/删除操作，区分编辑与去完成路由逻辑
    status: completed
    dependencies:
      - layout-theme
      - stores
      - template-data
  - id: create-page
    content: 实现创建页（ProjectCreateView），含 Step1 下拉选择模板+占位tag+预览，Step2 三列可折叠布局+拖拽+启禁+属性留白/class/占位+动态表单+全屏预览，CustomCssDialog 定制CSS（CodeMirror）
    status: completed
    dependencies:
      - layout-theme
      - stores
      - template-data
  - id: tests-quality
    content: 编写全面测试（引擎/Store/Composable/组件），配置 husky + lint-staged 提交门禁（vue-tsc + vitest 100%通过）
    status: completed
    dependencies:
      - create-page
      - list-page
  - id: ci-cd-docker
    content: 配置 GitHub Actions CI/CD（GitHub Pages + Cloudflare Pages），编写 Dockerfile + docker-compose.yml + nginx.conf，创建 404.html + _redirects 解决 SPA 刷新
    status: completed
    dependencies:
      - tests-quality
  - id: docs
    content: 使用 [skill:docx] 编写 README.md（项目概述/结构/运行/构建/部署/Docker详尽说明），使用 [skill:github] 初始化仓库并推送
    status: completed
    dependencies:
      - ci-cd-docker
---

## 产品概述

基于浏览器的模板生成器工具，用户可从预置页面模板中选择，通过添加、配置和排序代码片段，结合自定义 CSS，最终生成自定义页面。项目通过 IndexedDB 实现数据持久化，支持 GitHub Pages 和 Cloudflare Pages 部署。

## 核心功能

### 模板与片段管理

- 解析 `public/template/pages/` 下 YAML 数据，提供模板浏览、下拉选择和预览功能；模板注册表含名称、版本号、描述、预览图、文件夹名
- 解析 `public/template/snippets/` 下 YAML 数据，支持片段浏览、添加、排序、复制、删除、启用/禁用；片段注册表含名称、版本号、描述、预览图、文件夹名
- 每个模板/片段为独立文件夹（abc-xyz/），含 .html（模板/片段 HTML）和 .yaml（配置：占位符数组、默认属性、示例数据、表单结构、className、defaultPlaceholder）

### 分步创建向导

- **创建流程入口**: 点击创建时先弹出对话框让用户输入**页面名称**（必填，用于列表展示和区分），确认后进入向导
- **Step1 模板选择**: 左侧模板下拉选择（默认选第一个），选中后下方显示版本号、描述介绍、预览图（可点击放大）、支持的占位符 tag 列表；**SEO 信息面板**：可输入页面标题、关键词、描述（用于生成 SEO meta 信息）；右侧 iframe 模板渲染预览（支持全屏）
- **Step2 片段配置**: 三列布局（最右侧可折叠收起）
- 第一列：已添加片段列表，支持拖拽排序、复制、删除（需确认）、启用/禁用（禁用不渲染到模板），底部"添加片段"按钮
- 第二列：选中片段的两个选项卡 -- 属性设置 Tab（显示片段描述/版本/预览图、四方向留白距离含单位选择 %/px/rem 默认 px、占位符标识 placeholder:xxx-yyy 可选可输入、class 名称默认片段路径名需检测合法性）+ 数据录入 Tab（动态表单，支持单个对象或可增删的数据列表）
- 第三列：**所有启用片段渲染后的完整预览**（优先使用用户输入数据 > 示例数据 > 无数据渲染；支持全屏）
- **新增片段对话框**: 展示片段版本、描述、预览图（可放大）、示例数据渲染到模板的预览效果（可全屏），确认后加入片段列表
- **定制 CSS 按钮**: 所有步骤均可点击，弹出对话框支持 CSS 输入（CodeMirror 语法高亮）、保存应用到页面、弹框预览（可全屏）；**CSS 按钮旁附带弹框预览按钮**，点击后直接弹出预览对话框（可全屏）
- **保存确认**: 点击保存后弹出确认对话框，让用户选择"前往列表页"或"继续制作"
- 刷新保持状态；中途退出显示"制作中/待完成"

### 模板列表页

- 默认首页，空列表引导用户创建第一个模板
- 支持**卡片模式与表格模式切换**（右上角切换按钮），卡片模式为响应式两列网格，表格模式为 el-table 数据表格
- 卡片网格展示已完成和制作中项目，每张卡片含模板缩略图预览、项目名称、状态标签、创建时间；表格模式展示名称、状态、模板类型、创建时间、操作列
- 每项支持预览（可全屏）、删除（确认）、编辑（直接进最后一步）、去完成（跳转到中断步骤位置）、复制（复制数据进入对应位置）

### 主题系统

- 亮色、暗色、跟随系统三种模式，默认暗色

### 布局

- 上下结构：上方 logo + 标题，下方左右布局
- 左侧菜单栏：展开时图标 + 菜单名，收起时仅图标（菜单项配色鲜亮、对比度强），鼠标悬浮不展开但优雅展示菜单名（tooltip），默认展开

### CI/CD 与容器化

- GitHub Actions 推送主分支后自动构建部署到 GitHub Pages 和 Cloudflare Pages（刷新不能白屏或 404）
- Docker + docker-compose.yml 运行/构建/部署（含详尽使用说明文档）

### 质量保障

- 全面测试覆盖所有功能，提交前类型检查 + 测试 100% 通过
- 主 README、测试报告、项目结构说明、详细运行/构建/部署文档

## 技术栈选型

| 领域 | 方案 | 说明 |
| --- | --- | --- |
| 前端框架 | Vue 3 + TypeScript | Composition API + `<script setup>` |
| 构建工具 | Vite 5 | 含 Vite 5 指定版本要求 |
| UI 组件库 | Element Plus | 自动导入按需加载 |
| CSS 引擎 | UnoCSS | @unocss/preset-uno + @unocss/preset-attributify + @unocss/preset-icons |
| YAML 解析 | js-yaml | fetch + js-yaml.load() |
| 模板渲染 | lodash-es | `_.template()` 渲染片段/模板 |
| 数据持久化 | Dexie.js | IndexedDB 封装，npm 下载量最高 |
| 拖拽排序 | vuedraggable | 基于 SortableJS |
| CSS 编辑器 | vue-codemirror + @codemirror/lang-css | 语法高亮编辑器 |
| 图片预览 | Element Plus el-image | 内置放大预览 |
| 路由 | Vue Router 4 | History 模式 + base path |
| 状态管理 | Pinia | 含自动持久化到 IndexedDB |
| 测试 | Vitest + @vue/test-utils + happy-dom | 全面覆盖 |
| 代码质量 | ESLint + Prettier + husky + lint-staged | 提交门禁 |
| 包管理器 | pnpm | Node.js 24（.nvmrc） |
| 容器化 | Docker nginx:alpine | 多阶段构建 + docker-compose |
| 图标 | lucide-vue-next | 通用图标 |


## 实现方案

### 整体策略

采用分层架构：核心引擎层（YAML解析、模板渲染、动态表单、预览渲染、CSS编辑引擎） -> 状态管理层（Pinia + Dexie联动） -> 展示层（布局组件 + 页面视图 + 业务组件）。SPA 部署使用相对路径 + 404.html + _redirects 方案确保刷新兼容。

### 关键技术决策

**1. SPA 刷新兼容**

- Vite `base: './'` 相对路径，GitHub Pages 使用 404.html 含 JS 重定向脚本，Cloudflare Pages 使用 `_redirects` 文件
- Vue Router `createWebHistory` 配合 `base: import.meta.env.BASE_URL`

**2. 模板渲染引擎**

- 流程：加载模板HTML -> 各片段YAML配置 -> 动态表单生成 -> 用户填数据 -> lodash `_.template()` 渲染片段HTML -> 按占位符替换到模板 -> 注入自定义CSS -> iframe预览输出
- 占位符格式：`<!-- placeholder:name -->`
- 片段表单：formSchema.type 区分 object（单表单）和 array（可增删数据列表），fields 映射到 el-input/el-input-number/el-select/el-input textarea 等
- **预览数据优先级**：渲染时数据来源优先级为 用户输入数据 > 片段示例数据(sampleData) > 无数据渲染（不替换占位符变量，保留原始模板变量标记）

**3. 定制 CSS 引擎**

- 全局 CustomCssDialog 组件，基于 vue-codemirror 编辑器，支持 CSS 语法高亮
- CSS 存储在 project.customCss 字段中（IndexedDB持久化）
- 渲染时将 customCss 作为 `<style>` 标签注入到 iframe 预览中
- 对话框内嵌预览区（独立 iframe），支持全屏

**4. 片段属性系统**

- 四方向留白：top/right/bottom/left 各有 value + unit(px/%/rem)，包裹为 inline style
- 占位符标识：`placeholder:xxx-yyy` 格式，前缀固定，后缀从模板占位列表选择或手动输入；渲染时找不到则使用默认逻辑（固定位置或忽略）
- class 名称：默认为片段 folder 名称，正则校验 CSS class 合法性（`/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/`）

**5. 片段启用/禁用**

- SnippetInstance 新增 `enabled: boolean` 字段，默认 true
- 禁用片段不参与渲染引擎处理，列表中灰显展示
- 状态持久化到 IndexedDB

**6. 数据持久化**

- Dexie.js 定义 projects 表（含所有项目数据含 customCss）、theme/preferences 表
- 创建向导中 watch 深度监听 + 防抖自动保存；刷新从 IndexedDB 恢复
- 列表页"编辑"按钮跳转 `/create/:id?mode=edit`（直接Step2），"去完成"按钮跳转 `/create/:id?mode=resume`（跳到中断步骤）

**7. 菜单栏高对比度配色**

- 菜单项文字使用亮色（如 `#38BDF8` 天蓝）与深色背景形成强对比
- 悬浮状态使用渐变背景或发光效果增强视觉反馈

### 性能考量

- YAML/HTML 文件在应用启动时批量加载并缓存到 Map 中
- 预览 iframe 使用 srcdoc 注入避免网络请求；防抖渲染（300ms）
- Dexie 查询按 updatedAt 索引排序

## 架构设计

```mermaid
graph TB
    subgraph 展示层
        A[AppLayout] --> B[AppHeader<br/>Logo+标题+主题切换]
        A --> C[AppSidebar<br/>折叠/tooltip/高对比]
        A --> D[主内容区]
        D --> E[ProjectListView]
        D --> F[ProjectCreateView]
        F --> G[Step1: 模板选择<br/>下拉+描述+占位tag+预览]
        F --> H[Step2: 片段配置<br/>三列可折叠]
    end

    subgraph 业务组件层
        G --> G1[TemplateDropdown]
        G --> G2[TemplateInfo<br/>版本/描述/预览图/tag]
        G --> G3[PreviewIframe<br/>全屏预览]
        H --> H1[SnippetList<br/>拖拽/排序/启禁/复制/删除]
        H --> H2[SnippetConfig<br/>留白/占位/class]
        H --> H3[SnippetDataForm<br/>动态表单]
        H --> H4[PreviewIframe<br/>可折叠全屏]
        I1[CustomCssDialog<br/>CodeMirror+预览]
        I2[SnippetAddDialog<br/>选择+预览]
    end

    subgraph 状态管理层
        J[Pinia Stores]
        J --> K[projectStore<br/>CRUD+自动保存]
        J --> L[templateStore<br/>模板缓存]
        J --> M[snippetStore<br/>片段缓存]
        J --> N[appStore<br/>主题/菜单]
    end

    subgraph 核心引擎层
        O[TemplateEngine<br/>lodash渲染+占位替换]
        P[FormEngine<br/>schema解析+控件映射]
        Q[YamlParser<br/>js-yaml解析]
        R[PreviewRenderer<br/>iframe注入]
        S[CssEngine<br/>CSS校验+注入]
    end

    subgraph 持久化层
        T[Dexie.js<br/>IndexedDB]
        U[localStorage<br/>主题偏好]
    end

    J --> T
    N --> U
    L --> Q
    M --> Q
    O --> R
    S --> R
</graph>

## 目录结构

```

template-generator/
├── public/
│   ├── 404.html                            # [NEW] GitHub Pages SPA 刷新重定向
│   └── template/
│       ├── pages/
│       │   ├── pages.yaml                  # [NEW] 页面模板注册表
│       │   └── landing-page/
│       │       ├── landing-page.html        # [NEW] 落地页模板 HTML
│       │       └── landing-page.yaml        # [NEW] 模板配置（占位符数组）
│       └── snippets/
│           ├── snippets.yaml                # [NEW] 代码片段注册表
│           ├── hero-banner/
│           │   ├── hero-banner.html         # [NEW] Hero横幅片段 HTML
│           │   └── hero-banner.yaml         # [NEW] 片段配置（属性/示例数据/表单/className）
│           └── feature-card/
│               ├── feature-card.html        # [NEW] 特性卡片片段 HTML
│               └── feature-card.yaml        # [NEW] 特性卡片配置
├── src/
│   ├── App.vue                             # [NEW] 根组件
│   ├── main.ts                             # [NEW] 入口（注册ElementPlus/Router/Pinia/UnoCSS）
│   ├── types/
│   │   ├── template.ts                     # [NEW] TemplateMeta, Placeholder 等类型
│   │   ├── snippet.ts                      # [NEW] SnippetMeta, FormSchema, FieldDef 等类型
│   │   ├── project.ts                      # [NEW] Project, SnippetInstance, Spacing 等类型
│   │   └── index.ts                        # [NEW] 统一导出
│   ├── database/
│   │   └── index.ts                        # [NEW] Dexie数据库定义（projects表含customCss字段）
│   ├── engines/
│   │   ├── yaml-parser.ts                  # [NEW] YAML加载解析（fetch+js-yaml+缓存）
│   │   ├── template-engine.ts              # [NEW] lodash模板渲染+占位符替换
│   │   ├── form-engine.ts                  # [NEW] 动态表单schema解析与控件映射
│   │   ├── preview-renderer.ts             # [NEW] iframe预览（srcdoc注入HTML/CSS）
│   │   └── css-engine.ts                   # [NEW] CSS校验+注入引擎
│   ├── stores/
│   │   ├── app.ts                          # [NEW] 主题/菜单状态
│   │   ├── template.ts                     # [NEW] 模板数据Store
│   │   ├── snippet.ts                      # [NEW] 片段数据Store
│   │   └── project.ts                      # [NEW] 项目CRUD+自动保存IndexedDB
│   ├── composables/
│   │   ├── use-theme.ts                    # [NEW] 暗色/亮色/跟随系统切换
│   │   ├── use-fullscreen.ts               # [NEW] Fullscreen API封装
│   │   ├── use-auto-save.ts                # [NEW] 防抖自动保存IndexedDB
│   │   └── use-class-validator.ts          # [NEW] CSS class名称合法性校验
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.vue               # [NEW] 整体布局
│   │   │   ├── AppHeader.vue               # [NEW] 顶栏（Logo+标题+主题切换）
│   │   │   └── AppSidebar.vue              # [NEW] 侧边栏（折叠+tooltip+高对比配色）
│   │   ├── project/
│   │   │   ├── ProjectCard.vue             # [NEW] 项目卡片（卡片模式使用）
│   │   │   ├── ProjectTable.vue            # [NEW] 项目表格（表格模式使用）
│   │   │   └── ProjectStatusBadge.vue      # [NEW] 状态标签
│   │   ├── template/
│   │   │   ├── TemplateDropdown.vue        # [NEW] 模板下拉选择
│   │   │   ├── TemplateInfo.vue            # [NEW] 模板描述/版本/预览图/占位tag
│   │   │   ├── TemplatePreview.vue         # [NEW] 模板iframe预览
│   │   │   └── SeoForm.vue                # [NEW] SEO信息表单（标题/关键词/描述）
│   │   ├── snippet/
│   │   │   ├── SnippetList.vue             # [NEW] 片段列表（拖拽/启禁/复制/删除）
│   │   │   ├── SnippetConfig.vue           # [NEW] 片段属性（留白/占位/class）
│   │   │   ├── SnippetDataForm.vue         # [NEW] 片段数据录入
│   │   │   ├── SnippetAddDialog.vue        # [NEW] 新增片段对话框
│   │   │   ├── SpacingEditor.vue           # [NEW] 四方向留白编辑器
│   │   │   ├── PlaceholderSelector.vue     # [NEW] 占位符选择器（可选+可输入）
│   │   │   ├── ClassNameInput.vue          # [NEW] class名输入（带合法性校验）
│   │   │   └── DynamicForm.vue             # [NEW] 通用动态表单（object/array）
│   │   ├── css/
│   │   │   └── CustomCssDialog.vue         # [NEW] 定制CSS对话框（CodeMirror+预览+全屏）
│   │   ├── common/
│   │   │   ├── SaveConfirmDialog.vue       # [NEW] 保存确认对话框（前往列表/继续制作）
│   │   │   └── ProjectNameDialog.vue       # [NEW] 页面名称输入对话框
│   │   └── preview/
│   │       └── PreviewIframe.vue           # [NEW] iframe预览容器（全屏）
│   ├── views/
│   │   ├── ProjectListView.vue             # [NEW] 列表页
│   │   └── ProjectCreateView.vue           # [NEW] 创建页（分步向导）
│   ├── router/
│   │   └── index.ts                        # [NEW] 路由（含edit/resume模式参数）
│   └── styles/
│       ├── variables.css                   # [NEW] CSS变量（亮/暗主题色）
│       ├── theme.css                       # [NEW] dark class覆盖样式
│       └── global.css                      # [NEW] 全局基础样式
├── tests/
│   ├── unit/
│   │   ├── engines/
│   │   │   ├── yaml-parser.test.ts
│   │   │   ├── template-engine.test.ts
│   │   │   ├── form-engine.test.ts
│   │   │   ├── preview-renderer.test.ts
│   │   │   └── css-engine.test.ts
│   │   ├── database/
│   │   │   └── database.test.ts
│   │   ├── stores/
│   │   │   ├── app.test.ts
│   │   │   ├── template.test.ts
│   │   │   ├── snippet.test.ts
│   │   │   └── project.test.ts
│   │   └── composables/
│   │       ├── use-theme.test.ts
│   │       ├── use-fullscreen.test.ts
│   │       ├── use-auto-save.test.ts
│   │       └── use-class-validator.test.ts
│   └── components/
│       ├── layout/AppHeader.test.ts
│       ├── layout/AppSidebar.test.ts
│       ├── template/TemplateDropdown.test.ts
│       ├── snippet/DynamicForm.test.ts
│       ├── snippet/SnippetList.test.ts
│       ├── snippet/SnippetAddDialog.test.ts
│       ├── snippet/SnippetConfig.test.ts
│       ├── snippet/SpacingEditor.test.ts
│       ├── snippet/PlaceholderSelector.test.ts
│       ├── snippet/ClassNameInput.test.ts
│       ├── css/CustomCssDialog.test.ts
│       ├── project/ProjectCard.test.ts
│       └── preview/PreviewIframe.test.ts
├── .github/workflows/deploy.yml            # [NEW] CI/CD
├── Dockerfile                              # [NEW] 多阶段构建
├── docker-compose.yml                      # [NEW] 编排
├── nginx.conf                              # [NEW] nginx SPA配置
├── .dockerignore
├── .nvmrc                                  # [NEW] Node 24
├── 404.html                                # [NEW] Cloudflare重定向（public根）
├── _redirects                              # [NEW] Cloudflare Pages规则
├── index.html / vite.config.ts / uno.config.ts / tsconfig.json / package.json / .prettierrc / .eslintrc.cjs / .gitignore（含Node/IDE/OS/构建产物等常见忽略项） / README.md

```

## 关键代码结构

### YAML 数据结构 - pages.yaml（注册表，不含占位符详情）

```

templates:

- name: "落地页模板"
version: "1.0.0"
description: "适用于产品推广、活动宣传的落地页"
thumbnail: "landing-page/thumbnail.png"
folder: "landing-page"

```

> **注意**: pages.yaml 仅作为模板注册表，不包含占位符列表。占位符信息定义在各模板文件夹下的 .yaml 配置文件中（如 landing-page.yaml），需要展示时根据 folder 名称按需请求。

```

### YAML 数据结构 - landing-page.yaml

```

placeholders:

- name: "hero-section"
description: "顶部横幅区域"
default: '<section class="placeholder-default">请选择 Hero 横幅片段</section>'
- name: "features-section"
description: "特性展示区域"
default: '<section class="placeholder-default">请选择特性卡片片段</section>'
- name: "footer-section"
description: "底部页脚区域"
default: '<footer class="placeholder-default">请选择页脚片段</footer>'

```

### YAML 数据结构 - snippets.yaml

```

snippets:

- name: "Hero 横幅"
version: "1.0.0"
description: "大图横幅，适合产品主视觉展示"
thumbnail: "hero-banner/thumbnail.png"
folder: "hero-banner"
tags: ["banner", "hero"]
- name: "特性卡片"
version: "1.0.0"
description: "多功能特性展示卡片，支持多个条目"
thumbnail: "feature-card/thumbnail.png"
folder: "feature-card"
tags: ["card", "features"]

```

### YAML 数据结构 - hero-banner.yaml

```

className: "hero-banner"
defaultPlaceholder: "hero-section"
defaults:
height: "400px"
bgColor: "#1a1a2e"
formSchema:
type: "object"
fields:

    - key: "title"
label: "标题"
type: "text"
default: "Welcome"
    - key: "subtitle"
label: "副标题"
type: "textarea"
default: "Build something amazing"
    - key: "bgColor"
label: "背景颜色"
type: "select"
default: "#1a1a2e"
options: ["#1a1a2e", "#16213e", "#0f3460"]
    - key: "buttonText"
label: "按钮文字"
type: "text"
default: "Get Started"
sampleData:
title: "Transform Your Ideas"
subtitle: "Into reality with our powerful tools"
bgColor: "#1a1a2e"
buttonText: "Get Started"

```

### TypeScript 关键接口

```

interface Project {
id: string
name: string                   // 用户输入的页面名称（必填）
templateId: string
seo: SeoInfo                   // SEO 信息（标题/关键词/描述）
status: 'draft' | 'completed'
currentStep: 1 | 2
snippetInstances: SnippetInstance[]
customCss: string
createdAt: number
updatedAt: number
}

interface SeoInfo {
title: string                  // 页面 SEO 标题
keywords: string               // 页面 SEO 关键词
description: string            // 页面 SEO 描述
}

interface SnippetInstance {
id: string
snippetId: string
enabled: boolean
properties: SnippetProperties
data: Record<string, any> | Record<string, any>[]
sortOrder: number
}

interface SnippetProperties {
placeholder: string           // "placeholder:xxx-yyy"
className: string             // 默认片段folder名
spacing: Spacing              // 四方向留白
}

interface Spacing {
top: SpacingValue
right: SpacingValue
bottom: SpacingValue
left: SpacingValue
}

interface SpacingValue {
value: number
unit: 'px' | '%' | 'rem'
}
```

## 实施注意事项

- **Element Plus + UnoCSS 冲突**: Element Plus 自动导入按需加载，UnoCSS 使用 safelist 管理自定义类名
- **暗色主题**: html 根元素切换 `dark` class，Element Plus 通过 `el-dark` class 激活暗色变量
- **CSS编辑器**: vue-codemirror 使用 `@codemirror/lang-css` 扩展，编辑和预览双向联动
- **提交门禁**: husky pre-commit 执行 `vue-tsc --noEmit && vitest run`
- **SPA 刷新**: public 根目录放 404.html（GitHub Pages JS重定向），`_redirects`（Cloudflare Pages `/* /index.html 200`）
- **Docker**: 多阶段 Node 24 构建 + nginx:alpine 运行，nginx.conf 配置 try_files SPA fallback
- **路由模式**: edit 跳转直接到 Step2 可编辑，resume 跳转恢复到 currentStep 对应步骤
- **占位符选择器**: Element Plus `el-select` 配 `allow-create` + `filterable`，数据源从模板占位列表获取
- **三列折叠**: Step2 第三列通过 v-show + transition 折叠动画，折叠按钮固定在第二列右侧
- **占位符按需加载**: pages.yaml 注册表不包含占位符列表，占位符数据仅在各模板文件夹的 .yaml 中定义；templateStore 在用户选中模板后，根据 folder 名称 fetch 对应的 .yaml 获取占位符列表并缓存

## 设计风格

采用现代深色主题优先（Dark Mode First）设计，搭配 Glassmorphism 毛玻璃效果和微交互动效。工具类应用风格，整体色调以深色为基底，搭配鲜明天蓝色（#38BDF8）强调色。侧边栏菜单项使用高饱和度配色（天蓝色/翠绿色）与深色背景形成强对比。

### 全局按钮配色规范

所有操作按钮统一遵循"鲜亮背景 + 白色图标/文字"的设计原则，确保与深色背景形成强烈对比：

| 按钮类型 | 背景色 | 图标/文字色 | 用途场景 |
| --- | --- | --- | --- |
| 主操作 | 天蓝渐变 `#38BDF8→#0284C7` | 白色 `#FFFFFF` | 创建、保存、下一步、添加片段 |
| 预览 | 翠绿色 `#22C55E` | 白色 `#FFFFFF` | 全屏预览、项目预览 |
| 编辑 | 天蓝色 `#38BDF8` | 白色 `#FFFFFF` | 编辑项目、去完成 |
| 复制 | 紫色 `#8B5CF6` | 白色 `#FFFFFF` | 复制项目、复制片段 |
| 删除 | 亮红色 `#EF4444` | 白色 `#FFFFFF` | 删除项目、删除片段 |
| 定制CSS | 橙色 `#F59E0B` | 白色 `#FFFFFF` | 定制CSS按钮 |
| 次要/折叠 | 灰蓝 `#475569` | 白色 `#FFFFFF` | 折叠面板、取消 |
| 启用开关 | 翠绿色 `#22C55E` / 灰色 `#475569` | — | 片段启用/禁用 |


- 所有按钮悬浮时亮度提升 + `scale(1.05)` 微缩放动效（transition 200ms）
- 图标按钮统一使用 `rounded-lg` 圆角 + 适当的 padding
- 禁用态使用 `opacity-50 cursor-not-allowed`

## 页面规划

### 1. 列表页（ProjectListView）- 默认首页

- **顶部区域**: 左侧大标题"我的模板"，右侧视图模式切换按钮组（卡片/表格）+ "创建模板"主操作按钮（天蓝色渐变 + 图标）
- **空状态**: 居中展示简约插画 + 引导文案 + 醒目的"立即创建"按钮（带脉冲动画吸引注意）
- **卡片模式**: 响应式两列网格，每张卡片含模板缩略图预览、项目名称、状态标签（已完成=绿色/制作中=橙色）、创建时间；悬浮时微上移 + 阴影加深 + 显示操作按钮组（预览/编辑/去完成/复制/删除）
- **表格模式**: el-table 数据表格，列含名称、状态、模板类型、SEO标题、创建时间、操作；操作列使用鲜亮图标按钮
- **操作按钮**: 所有操作按钮配色鲜亮、对比度高 -- 删除用亮红色(#EF4444)背景+白色图标，编辑/去完成用天蓝色(#38BDF8)背景+白色图标，复制用紫色(#8B5CF6)背景+白色图标，预览用翠绿色(#22C55E)背景+白色图标；悬浮时亮度提升+微缩放动效

### 2. 创建页（ProjectCreateView）- 分步向导

- **步骤指示器**: 顶部水平 Steps 组件，两个步骤带图标
- **操作按钮区（步骤条右侧）**: 定制CSS按钮（橙色#F59E0B背景+白色齿轮图标）+ **弹框预览按钮**（翠绿色#22C55E背景+白色预览图标），两个按钮紧挨排列
- **Step1 模板选择**: 左右两栏（6:6），左侧模板下拉选择器 + 下方信息面板（版本徽章 + 描述文本 + 预览图可放大 + 占位符 tag 列表）+ **SEO 信息面板**（SeoForm 组件：标题/关键词/描述三个输入框，折叠面板默认收起），右侧 iframe 预览 + 全屏按钮（翠绿色#22C55E）
- **Step2 片段配置**: 三列布局（3:5:4），第三列可通过按钮折叠
- 第一列：片段列表（拖拽手柄 + 名称 + 启用开关 + 复制/删除图标按钮，均为鲜亮配色）+ 底部"添加片段"按钮（天蓝色渐变+白色图标）
- 第二列：el-tabs 切换属性/数据，属性Tab含四方向留白编辑器（紧凑的四格布局）+ 占位符选择器 + className输入框，数据Tab含 DynamicForm 动态表单 + "保存"按钮（天蓝色渐变#38BDF8→#0284C7+白色文字）
- 第三列：**所有启用片段渲染后的完整页面预览**（有输入数据用输入数据，无输入数据用示例数据，都没有则无数据渲染）+ 全屏按钮（翠绿色#22C55E）+ 折叠按钮（鲜亮灰色）
- **保存确认**: 点击"保存并完成"后弹出 SaveConfirmDialog，提供"前往列表页"和"继续制作"两个选项

### 3. 布局组件（全局共享）

- **AppHeader**: 固定顶部，高度56px，左侧Logo图标 + 应用名（渐变文字），右侧主题切换按钮组（太阳/月亮/电脑三个图标按钮，选中态鲜亮高亮）
- **AppSidebar**: 左侧固定，宽度220px（展开）/ 64px（收起），过渡动画300ms；菜单项使用天蓝色(#38BDF8)图标 + 白色文字，悬浮时背景半透明发光；收起时仅图标，el-tooltip 弹出显示菜单名（暗色tooltip背景 + 亮色文字）

## Agent Extensions

### Skill

- **github**
- Purpose: 创建 GitHub 仓库、配置 GitHub Pages 部署所需的 Actions workflow 和仓库设置
- Expected outcome: 完成 GitHub 仓库初始化、CI/CD workflow 文件配置、GitHub Pages 部署功能就绪

- **docx**
- Purpose: 辅助编写 README.md 项目文档、部署说明等文档内容
- Expected outcome: 生成结构清晰的项目说明文档（README、Docker使用说明等）