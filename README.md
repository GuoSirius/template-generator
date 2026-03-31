# 模板生成器 (Template Generator)

基于浏览器的模板生成器工具，用户可从预置页面模板中选择，通过添加、配置和排序代码片段，结合自定义 CSS，最终生成自定义页面。

## 技术栈

| 领域 | 方案 |
| --- | --- |
| 前端框架 | Vue 3 + TypeScript (Composition API) |
| 构建工具 | Vite 5 |
| UI 组件库 | Element Plus (自动导入) |
| CSS 引擎 | UnoCSS |
| YAML 解析 | js-yaml |
| 模板渲染 | lodash-es |
| 数据持久化 | Dexie.js (IndexedDB) |
| 拖拽排序 | vuedraggable |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| 测试 | Vitest + Vue Test Utils |
| 代码质量 | ESLint + Prettier + husky + lint-staged |
| 包管理器 | pnpm |
| Node.js | 24 |

## 功能特性

- **模板选择**: 从预置页面模板中选择，支持版本/描述/预览图展示
- **片段配置**: 添加、排序、复制、删除、启用/禁用代码片段
- **动态表单**: 根据片段 YAML 配置自动生成 object/array 类型表单
- **实时预览**: iframe 沙箱预览，支持全屏查看
- **定制 CSS**: 内置 CSS 编辑器，实时预览效果
- **SEO 信息**: 支持页面标题、关键词、描述输入
- **数据持久化**: IndexedDB 存储，刷新不丢失
- **主题切换**: 暗色/亮色/跟随系统，默认暗色
- **视图切换**: 卡片模式/表格模式

## 项目结构

```
template-generator/
├── public/
│   ├── 404.html              # GitHub Pages SPA 刷新
│   ├── _redirects            # Cloudflare Pages SPA 刷新
│   └── template/
│       ├── pages/            # 页面模板 (YAML + HTML)
│       └── snippets/         # 代码片段 (YAML + HTML)
├── src/
│   ├── types/                # TypeScript 类型定义
│   ├── database/             # Dexie.js IndexedDB 封装
│   ├── engines/              # 核心引擎 (YAML/模板/表单/预览/CSS)
│   ├── stores/               # Pinia 状态管理
│   ├── composables/          # 组合式函数
│   ├── components/
│   │   ├── layout/           # 布局组件
│   │   ├── template/         # 模板相关组件
│   │   ├── snippet/          # 片段相关组件
│   │   ├── css/              # CSS 编辑器组件
│   │   ├── common/           # 通用对话框组件
│   │   ├── preview/          # 预览组件
│   │   └── project/          # 项目展示组件
│   ├── views/                # 页面视图
│   ├── router/               # 路由配置
│   └── styles/               # 全局样式
├── tests/                    # 测试文件
├── Dockerfile                # Docker 多阶段构建
├── docker-compose.yml        # Docker 编排
├── nginx.conf                # Nginx SPA 配置
└── .github/workflows/        # CI/CD 工作流
```

## 快速开始

### 环境要求

- Node.js >= 24
- pnpm >= 9

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd template-generator

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 查看应用。

### 构建

```bash
# 类型检查
pnpm type-check

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

### 测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

### 代码质量

```bash
# ESLint 检查并修复
pnpm lint

# Prettier 格式化
pnpm format
```

## Docker 部署

### 使用 Docker Compose (推荐)

```bash
# 构建并启动
docker compose up -d

# 访问
# http://localhost:8080

# 停止
docker compose down

# 查看日志
docker compose logs -f
```

### 使用 Docker 直接构建

```bash
# 构建镜像
docker build -t template-generator .

# 运行容器
docker run -d -p 8080:80 --name template-generator template-generator

# 停止并删除
docker stop template-generator && docker rm template-generator
```

### 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3000:80"  # 将 8080 改为 3000
```

## CI/CD

### GitHub Pages

推送至 `main` 分支自动触发构建和部署：

1. 确保仓库 Settings > Pages > Source 选择 "GitHub Actions"
2. 推送代码至 `main` 分支
3. Actions 工作流自动运行：lint → test → build → deploy

### Cloudflare Pages

1. 连接仓库至 Cloudflare Pages
2. 构建命令: `pnpm build`
3. 输出目录: `dist`
4. `_redirects` 文件确保 SPA 路由正常工作

## 自定义模板

### 添加页面模板

在 `public/template/pages/` 下创建新文件夹：

```
public/template/pages/my-template/
├── my-template.html    # 模板 HTML (含 <!-- placeholder:xxx --> 占位符)
└── my-template.yaml    # 模板配置 (占位符列表)
```

在 `pages.yaml` 注册表添加条目：

```yaml
templates:
  - name: "我的模板"
    version: "1.0.0"
    description: "模板描述"
    thumbnail: "my-template/thumbnail.png"
    folder: "my-template"
```

### 添加代码片段

在 `public/template/snippets/` 下创建新文件夹：

```
public/template/snippets/my-snippet/
├── my-snippet.html    # 片段 HTML (lodash 模板语法)
└── my-snippet.yaml    # 片段配置 (表单结构/示例数据)
```

在 `snippets.yaml` 注册表添加条目：

```yaml
snippets:
  - name: "我的片段"
    version: "1.0.0"
    description: "片段描述"
    thumbnail: "my-snippet/thumbnail.png"
    folder: "my-snippet"
    tags: ["tag1", "tag2"]
```

### 片段 YAML 配置示例

```yaml
className: "my-snippet"
defaultPlaceholder: "hero-section"
formSchema:
  type: "object"       # "object" 单表单 | "array" 数据列表
  fields:
    - key: "title"
      label: "标题"
      type: "text"      # text/textarea/number/select/color/image
      default: ""
      required: true
    - key: "items"
      label: "列表项"
      type: "select"
      options: ["选项1", "选项2"]
sampleData:
  title: "示例标题"
  items: "选项1"
```

## 许可证

MIT
