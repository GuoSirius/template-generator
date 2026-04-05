# Template Generator (模板生成器)

基于浏览器的可视化页面生成工具。用户可从预置页面模板中选择，通过添加、配置和排序代码片段，结合自定义 CSS/JS，最终一键生成完整 HTML 页面。

## 技术栈

| 领域 | 技术 | 版本 |
| --- | --- | --- |
| 前端框架 | Vue 3 (Composition API) | ^3.5.13 |
| 语言 | TypeScript | ~5.7.2 |
| 构建工具 | Vite 6 | ^6.0.5 |
| UI 组件库 | Element Plus (自动导入) | ^2.9.1 |
| CSS 引擎 | UnoCSS (属性化 + 图标 + 指令) | ^0.65.2 |
| YAML 解析 | js-yaml | ^4.1.0 |
| 模板渲染 | lodash-es (lodash template) | ^4.17.21 |
| 数据持久化 | Dexie.js (IndexedDB) | ^4.0.10 |
| 代码编辑器 | CodeMirror 6 (vue-codemirror) | ^6.0.1 / ^6.1.1 |
| 图标库 | Lucide Vue | ^0.463.0 |
| 拖拽排序 | vuedraggable | ^4.1.0 |
| 路由 | Vue Router 4 | ^4.5.0 |
| 状态管理 | Pinia | ^2.3.0 |
| 测试框架 | Vitest 2 + happy-dom | ^2.1.9 / ^15.12.3 |
| Git Hooks | Husky + lint-staged | ^9.1.7 / ^15.3.0 |
| 包管理器 | pnpm | >= 9 |
| Node.js | - | >= 18 |

## 功能特性

### 核心功能
- **模板选择**: 从预置页面模板中选择，支持版本/描述/多预览图展示
- **片段管理**: 添加、拖拽排序、复制、删除、启用/禁用代码片段
- **动态表单**: 根据片段 YAML 配置自动生成表单（支持 object / array / objectWithList 三种类型）
- **实时预览**: iframe 沙箱预览，支持全屏查看
- **SEO 配置**: 页面标题、关键词、描述输入
- **数据持久化**: IndexedDB 存储，刷新不丢失

### 定制能力
- **CSS 编辑器**: 内置 CodeMirror 6 编辑器，支持语法高亮和实时预览
- **JS 编辑器**: 自定义 JavaScript 注入，带语法校验功能
- **主题切换**: 暗色 / 亮色 / 跟随系统三档切换，默认暗色
- **视图模式**: 卡片模式 / 表格模式双视图

### 开发体验
- TypeScript 严格类型（零 `any`）
- 127 个单元测试用例全覆盖（15 个测试文件）
- ESLint + Prettier + Husky 提交前自动检查
- CI/CD 双平台自动部署（GitHub Pages + Cloudflare Pages）
- Docker 多阶段构建，开箱即用

## 项目结构

```
template-generator/
├── public/
│   ├── 404.html                    # GitHub Pages SPA 路由回退
│   ├── _redirects                  # Cloudflare Pages SPA 路由回退
│   └── template/
│       ├── pages/                  # 页面模板 (YAML + HTML)
│       │   ├── landing-page/       #   落地页模板
│       │   ├── product-page/       #   产品页模板
│       │   └── pages.yaml          #   模板注册表
│       └── snippets/               # 代码片段 (YAML + HTML)
│           ├── hero-banner/        #   英雄区片段
│           ├── feature-card/       #   特性卡片片段
│           ├── ...                 #   更多片段
│           └── snippets.yaml       #   片段注册表
├── src/
│   ├── types/                      # TypeScript 类型定义
│   │   ├── snippet.ts              #   片段相关 (FieldDef, SnippetConfig, FormSchema)
│   │   ├── project.ts              #   项目相关 (Project, SnippetInstance, SeoInfo)
│   │   └── template.ts             #   模板相关 (Template, TemplateMeta)
│   ├── database/                   # Dexie.js IndexedDB 封装
│   │   └── index.ts                #   CRUD + 主题偏好存储
│   ├── engines/                    # 核心引擎
│   │   ├── yaml-parser.ts          #   YAML/HTML 加载与缓存
│   │   ├── template-engine.ts      #   lodash 模板编译与渲染
│   │   ├── form-engine.ts          #   动态表单数据生成
│   │   ├── css-engine.ts           #   CSS 变量构建
│   │   └── preview-renderer.ts     #   预览页 HTML 组装
│   ├── stores/                     # Pinia 状态管理
│   │   ├── app.ts                  #   全局状态 (侧边栏, 主题)
│   │   ├── project.ts              #   项目状态 (CRUD, 片段, 排序)
│   │   ├── snippet.ts              #   片段加载与缓存
│   │   └── template.ts             #   模板选择与配置
│   ├── composables/                # 组合式函数
│   │   ├── use-preview.ts          #   预览逻辑 (HTML 编译, CSS/JS 注入)
│   │   ├── use-class-validator.ts  #   自定义 JS 校验器
│   │   ├── use-auto-save.ts        #   自动保存 (防抖)
│   │   ├── use-fullscreen.ts       #   全屏切换
│   │   └── use-theme.ts            #   主题持久化
│   ├── components/
│   │   ├── layout/                 #   布局组件 (Header, Sidebar)
│   │   ├── template/               #   模板选择卡片
│   │   ├── snippet/                #   片段面板 (DynamicForm, SnippetCard, SortableList)
│   │   ├── css/                    #   CSS 编辑器 (CodeMirror 封装)
│   │   ├── js/                     #   JS 编辑器 (CustomJsDialog)
│   │   ├── common/                 #   通用对话框
│   │   ├── preview/                #   预览区域 (iframe 沙箱)
│   │   └── project/                #   项目列表
│   ├── views/                      # 页面视图
│   ├── router/                     # 路由配置
│   ├── styles/                     # 全局样式
│   ├── App.vue
│   └── main.ts
├── tests/
│   └── unit/
│       ├── engines/                #   yaml-parser / css-engine / form-engine
│       │                           #     / preview-renderer / template-engine
│       ├── stores/                 #   app-store / project-store / snippet-store
│       │                           #     / template-store
│       ├── composables/            #   use-auto-save / use-class-validator
│       │                           #     / use-fullscreen / use-preview / use-theme
│       ├── database/               #   index (Dexie CRUD)
│       └── TEST_REPORT.md          #   测试+覆盖率合并报告
├── .github/workflows/
│   ├── deploy.yml                  # GitHub Pages 自动部署
│   └── deploy-cloudflare.yml       # Cloudflare Pages 自动部署
├── Dockerfile                      # Docker 多阶段构建
├── docker-compose.yml              # Docker Compose 编排
├── nginx.conf                      # Nginx SPA 配置
├── DEPLOYMENT.md                   # 详细部署教程 (小白友好)
└── README.md                       # 本文件
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18 (推荐 LTS 版本)
- [pnpm](https://pnpm.io/installation) >= 9
- [Git](https://git-scm.com/downloads)

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/<your-username>/template-generator.git
cd template-generator

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 即可使用。

### 可用命令

```bash
# 开发
pnpm dev              # 启动开发服务器 (http://localhost:5173)
pnpm preview          # 预览生产构建

# 构建
pnpm build            # 类型检查 + Vite 构建
pnpm type-check       # 仅 TypeScript 类型检查

# 测试
pnpm test             # 运行全部测试 (127 用例)
pnpm test:watch       # 监听模式
pnpm test:coverage    # 带覆盖率报告

# 代码质量
pnpm lint             # ESLint 检查并自动修复
pnpm format           # Prettier 格式化
```

## 测试覆盖

| 模块 | 测试文件 | 用例数 | 覆盖内容 |
| --- | --- | --- | --- |
| YAML 解析引擎 | yaml-parser.test.ts | 7 | loadYaml/loadHtml/clearCache/缓存/错误处理 |
| CSS 引擎 | css-engine.test.ts | 6 | buildCssVariables/CSS 变量拼接 |
| 表单引擎 | form-engine.test.ts | 5 | getDefaultFormData/getDefaultFormDataList |
| 模板引擎 | template-engine.test.ts | 12 | compileTemplate/resolveSnippetData/wrapWithContainer/buildSpacingStyle/replacePlaceholders/renderLodashTemplate |
| 预览渲染器 | preview-renderer.test.ts | 5 | buildPreviewHtml/lodash 模板 SEO 注入 |
| 项目 Store | project-store.test.ts | 19 | createProject/updateSeo/addSnippet/reorder/duplicate/delete/CRUD |
| 片段 Store | snippet-store.test.ts | 8 | loadSnippets/loadSnippetDetail/html缓存/错误处理 |
| 模板 Store | template-store.test.ts | 7 | loadTemplates/selectTemplate/clearCurrent |
| 全局 Store | app-store.test.ts | 4 | sidebarCollapsed/toggleSidebar/themeMode |
| 数据库层 | database/index.test.ts | 10 | saveProject/getAllProjects/getById/delete/主题偏好 |
| 自动保存 | use-auto-save.test.ts | 4 | 防抖保存/卸载时保存/无项目跳过 |
| 全屏功能 | use-fullscreen.test.ts | 7 | enterFullscreen/exitFullscreen/toggle/错误处理 |
| 主题切换 | use-theme.test.ts | 5 | setTheme/toggleTheme/system跟随/持久化 |
| 类名校验 | use-class-validator.test.ts | 7 | validateClassName/规则检查 |
| 预览 Composable | use-preview.test.ts | 15 | compileHtml/compileByType/spacing/SEO/CSS注入 |
| **合计** | **15 文件** | **127** | — |

详细测试报告见 [tests/TEST_REPORT.md](./tests/TEST_REPORT.md)

## CI/CD 双平台部署

### GitHub Pages（免费）

推送至 `main` 分支自动触发：

```
push to main → lint → type-check → test(127用例) → build → deploy to GitHub Pages
```

**配置步骤：**
1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
2. 确保 `main` 分支有推送权限

### Cloudflare Pages（免费，全球 CDN）

推送至 `main` 分支自动触发：

```
push to main → lint → type-check → test(127用例) → build → wrangler-action deploy
```

**配置步骤：**
1. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
2. 选择本仓库
3. 设置 Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. 构建输出: `dist` 目录

> 完整部署教程（含截图指引）请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## Docker 部署

```bash
# 使用 Docker Compose (推荐)
docker compose up -d          # 启动 → http://localhost:8080
docker compose down           # 停止
docker compose logs -f        # 查看日志

# 或直接使用 Docker
docker build -t template-generator .
docker run -d -p 8080:80 --name tg template-generator
```

## 自定义模板

### 添加页面模板

在 `public/template/pages/` 下创建文件夹，包含 `.html` + `.yaml`：

```html
<!-- my-page.html: 含 <!-- placeholder:xxx --> 占位符的 HTML 模板 -->
<!DOCTYPE html>
<html>
<head><title><%= seo.title %></title></head>
<body>
  <!-- placeholder:hero -->
  <!-- placeholder:features -->
  <!-- placeholder:footer -->
</body>
</html>
```

```yaml
# my-page.yaml: 模板元信息和占位符列表
name: "My Page"
version: "1.0.0"
description: "A custom page template"
thumbnail: "my-page/thumb.png"
folder: "my-page"
placeholders:
  - "hero"
  - "features"
  - "footer"
```

在 `pages.yaml` 注册表添加条目。

### 添加代码片段

在 `public/template/snippets/` 下创建文件夹：

```html
<!-- my-snippet.html: lodash 模板语法的片段 HTML -->
<div class="<%= className %>">
  <h2><%= data.title %></h2>
  <p><%= data.description %></p>
</div>
```

```yaml
# my-snippet.yaml: 表单结构和示例数据
className: "my-snippet"
defaultPlaceholder: "my-section"
formSchema:
  type: "object"          # object / array / objectWithList
  fields:
    - key: "title"
      label: "标题"
      type: "text"
      default: ""
      required: true
    - key: "description"
      label: "描述"
      type: "textarea"
      default: ""
sampleData:
  title: "示例标题"
  description: "示例描述"
```

在 `snippets.yaml` 注册表添加条目。

## 许可证

[MIT](./LICENSE)
