---
name: template-generator-comprehensive-improvement
overview: 完善类型声明消除 any、编写完整单元测试、更新文档、增强 CI/CD 支持双平台部署、编写小白友好的部署引导文档
todos:
  - id: fix-types
    content: 消除所有 any 类型声明：新建 FieldValue/SnippetData 映射类型，级联修复 snippet.ts/project.ts/template-engine.ts/form-engine.ts/use-preview.ts/DynamicForm.vue/CustomJsDialog.vue 共 7 处
    status: pending
  - id: write-tests-engines
    content: 编写引擎和数据库层单元测试：yaml-parser.test.ts + database/index.test.ts，覆盖 YAML 加载/缓存/Dexie CRUD 操作
    status: pending
    dependencies:
      - fix-types
  - id: write-tests-stores
    content: 编写 Pinia Store 单元测试：app-store/test.ts + project-store.test.ts + snippet-store.test.ts + template-store.test.ts，覆盖全部 Store 的状态管理和异步操作
    status: pending
    dependencies:
      - fix-types
  - id: write-tests-composables
    content: 编写 Composable 单元测试：use-auto-save.test.ts + use-fullscreen.test.ts + use-theme.test.ts，覆盖防抖保存/全屏切换/主题持久化
    status: pending
    dependencies:
      - fix-types
  - id: run-tests-fix
    content: 运行全量测试 pnpm test，修复所有失败的测试用例和类型错误，确保 100% 通过
    status: pending
    dependencies:
      - write-tests-engines
      - write-tests-stores
      - write-tests-composables
  - id: update-docs
    content: 全面更新文档：重写 README.md（技术栈/功能/目录结构），新建 DEPLOYMENT.md（小白部署教程），新建 CONTRIBUTING.md（贡献指南）
    status: pending
    dependencies:
      - run-tests-fix
  - id: add-cf-cicd
    content: 新增 Cloudflare Pages 自动部署工作流 .github/workflows/deploy-cloudflare.yml，使用 wrangler-action 实现推送即部署
    status: pending
  - id: final-verify
    content: 最终验证：运行 pnpm type-check + pnpm lint + pnpm test + pnpm build 全流程确认无报错，使用 [skill:github] 验证 CI/CD 工作流配置
    status: pending
    dependencies:
      - run-tests-fix
      - update-docs
      - add-cf-cicd
---

## 产品概述

Template Generator（模板生成器）是一个基于 Vue 3 + TypeScript 的浏览器端模板生成工具。用户可从预置页面模板中选择，通过添加、配置和排序代码片段，结合自定义 CSS/JS，最终生成自定义页面。

## 核心需求

1. **TypeScript 类型完善**：消除所有 `any` 类型使用，建立完整的类型映射体系（FieldDefaultValue、SnippetData 等），确保类型安全
2. **单元测试全覆盖**：为当前缺失的 9 个模块（yaml-parser、4个 store、database、3个 composable）编写完整测试用例，与现有 ~47 用例合并后全部通过；运行中发现代码问题需一并修复
3. **文档全面更新**：更新 README.md 技术栈/功能清单/目录结构为最新状态，补充小白友好的 Fork+部署完整教程（GitHub Pages / Cloudflare Pages / Docker 三种方式），新增 CONTRIBUTING.md 贡献指南
4. **CI/CD 双平台自动部署**：保留现有 GitHub Pages 工作流，新增 Cloudflare Pages 自动部署工作流，推送 main 分支同时触发双平台部署
5. **小白部署引导**：提供从 Fork 到上线的一站式图文式引导文档，覆盖 GitHub Pages 免费托管、Cloudflare Pages 免费托管、Docker 本地部署三种方案

## 功能范围

- 类型定义重构：src/types/*.ts 中 4-7 处 any 消除及其级联修复
- 测试补全：tests/unit/ 下新增约 9 个测试文件，覆盖 engines/stores/composables/database 全部模块
- 文档更新：README.md 重写 + 新增 DEPLOYMENT.md 部署教程 + CONTRIBUTING.md
- CI/CD 增强：新增 .github/workflows/deploy-cloudflare.yml

## Tech Stack

- **前端框架**: Vue 3.5 (Composition API) + TypeScript 5.7
- **构建工具**: Vite 6
- **UI 组件**: Element Plus (自动导入)
- **CSS**: UnoCSS (属性化 + 图标 + 指令)
- **状态管理**: Pinia
- **数据库**: Dexie.js (IndexedDB)
- **测试框架**: Vitest 2.1 + happy-dom + @vue/test-utils
- **CI/CD**: GitHub Actions (GitHub Pages + Cloudflare Pages)
- **容器化**: Docker (多阶段构建) + Nginx

## 实现方案

### 一、类型系统重构（消除 any）

**策略**：建立字段类型 → 默认值类型的映射联合，用 `SnippetData` 统一动态数据结构。

核心变更：

1. **新增 `FieldValue` 类型映射**：

```typescript
// src/types/snippet.ts
export type FieldValue = string | number | boolean
export type FieldDefaultValueMap = {
  text: string; textarea: string; number: number
  select: string; color: string; image: string
}
// FieldDef.default 改为 FieldDefaultValueMap[FieldDef['type']]
```

2. **新增 `SnippetData` 类型**替代 `Record<string, any>`：

```typescript
export type SnippetData = Record<string, FieldValue> | Record<string, FieldValue>[]
```

3. **级联修复链**：snippet.ts → project.ts (SnippetInstance.data) → template-engine.ts (compileTemplate/resolveSnippetData 参数) → form-engine.ts (函数返回值) → use-preview.ts (移除 as any) → DynamicForm.vue / CustomJsDialog.vue

### 二、单元测试全覆盖

**策略**：按模块分层测试，纯函数直接测，Store/Composable 用 Vitest + happy-dom 模拟 DOM 环境。

| 测试文件 | 目标模块 | 核心用例 |
| --- | --- | --- |
| yaml-parser.test.ts | loadYaml/loadHtml/clearCache | 解析成功、网络错误、缓存命中/失效 |
| app-store.test.ts | useAppStore | toggleSidebar、setSidebarCollapsed |
| project-store.test.ts | useProjectStore | CRUD项目、片段增删改查排序复制、SEO更新 |
| snippet-store.test.ts | useSnippetStore | 加载注册表、详情加载、HTML缓存 |
| template-store.test.ts | useTemplateStore | 加载列表、选择模板、清除状态 |
| database.test.ts | Dexie CRUD | 增删改查项目、主题偏好存取 |
| use-auto-save.test.ts | useAutoSave | 防抖保存、组件卸载时立即保存 |
| use-fullscreen.test.ts | useFullscreen | 进入/退出/切换全屏、事件监听 |
| use-theme.test.ts | useTheme | 主题切换循环、system模式跟随 |


**关键决策**：

- Store 测试使用 `createPinia()` + `setActivePinia()` 模拟
- IndexedDB 测试使用 `fake-indexeddb` 或 Dexie 的内存适配
- use-fullscreen/use-theme 需要 `@testing-library/vue` 或手动 mock DOM API（fullscreenElement 等）
- 所有新测试遵循现有测试风格（makeConfig/makeInstance 工厂函数 + describe/it 分组）

### 三、文档体系更新

**策略**：README.md 作为精简入口页，DEPLOYMENT.md 作为详细部署教程，CONTRIBUTING.md 作为贡献指南。

1. **README.md 更新内容**：

- 技术栈版本号对齐 package.json（Vite 6, Node.js 24）
- 补充 JS 编辑器、objectWithList 表单、多预览图等新功能
- 目录结构补充 js/ 目录、_redirects 文件
- CI/CD 章节增加 Cloudflare Pages 说明

2. **DEPLOYMENT.md 新建**（小白友好）：

- 方案一：Fork 项目 → GitHub Pages 自动部署（0 成本）
- 方案二：连接 Cloudflare Pages 自动部署（0 成本）
- 方案三：Docker 本地/服务器部署
- 每种方案包含：前置条件（账号/软件）、操作步骤（命令+截图说明）、验证方法、常见问题

3. **CONTRIBUTING.md 新建**：

- 开发环境搭建步骤
- 代码规范（ESLint + Prettier）
- Git 提交规范
- 测试要求
- PR 流程

### 四、CI/CD 双平台部署增强

**策略**：在现有 deploy.yml 基础上，新增独立的 Cloudflare Pages 部署工作流。

1. **新增 `.github/workflows/deploy-cloudflare.yml`**：

- 触发条件：push to main（同 GitHub Pages）
- Job: lint-test-build（复用逻辑）
- Job: deploy-cloudflare：使用 Cloudflare Wrangler Actions 部署到 Cloudflare Pages
- 使用 `cloudflare/wrangler-action@v3` 进行部署
- 需要 Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

2. **现有 deploy.yml 保持不变**：继续支持 GitHub Pages 部署

### 五、目录结构变更总览

```
template-generator/
├── src/
│   ├── types/
│   │   ├── snippet.ts              # [MODIFY] 消除 any: 新增 FieldValue/SnippetData 类型
│   │   └── project.ts              # [MODIFY] SnippetInstance.data 使用 SnippetData
│   ├── engines/
│   │   ├── template-engine.ts      # [MODIFY] compileTemplate/resolveSnippetData 参数类型化
│   │   └── form-engine.ts          # [MODIFY] 函数返回值类型优化
│   ├── composables/
│   │   └── use-preview.ts          # [MODIFY] 移除 as any 断言
│   ├── components/
│   │   ├── js/CustomJsDialog.vue   # [MODIFY] catch(e: unknown)
│   │   └── snippet/DynamicForm.vue # [MODIFY] handleInput value 参数类型化
├── tests/unit/
│   ├── engines/
│   │   └── yaml-parser.test.ts     # [NEW] YAML解析器测试
│   ├── stores/
│   │   ├── app-store.test.ts       # [NEW] App Store测试
│   │   ├── project-store.test.ts   # [NEW] Project Store测试
│   │   ├── snippet-store.test.ts   # [NEW] Snippet Store测试
│   │   └── template-store.test.ts  # [NEW] Template Store测试
│   ├── database/
│   │   └── index.test.ts           # [NEW] 数据库层测试
│   └── composables/
│       ├── use-auto-save.test.ts   # [NEW] 自动保存测试
│       ├── use-fullscreen.test.ts  # [NEW] 全屏功能测试
│       └── use-theme.test.ts       # [NEW] 主题切换测试
├── .github/workflows/
│   └── deploy-cloudflare.yml      # [NEW] Cloudflare Pages 自动部署
├── DEPLOYMENT.md                   # [NEW] 小白友好部署教程
└── CONTRIBUTING.md                 # [NEW] 贡献指南
```

## 关键实现注意事项

- **性能**：类型变更是零运行时开销的纯 TypeScript 改动；新增测试文件不影响打包产物（vitest.config.ts 已排除 tests/）
- **向后兼容**：`FieldValue` 联合类型完全兼容现有数据结构（string|number|boolean 是 any 的严格子集）；`SnippetData` 与原 `Record<string, any>` 结构一致
- **ESLint 规则**：修改后将 `@typescript-eslint/no-explicit-any` 从 `'warn'` 升级为 `'error'`（可选，建议逐步收紧）
- **测试隔离**：每个测试文件独立创建 pinia 实例和 db 实例，避免跨文件状态污染
- **Cloudflare 兼容性**：wrangler-action v3 需要 Node.js >= 18，当前使用 Node.js 24 无问题；需确认 public/_redirects 已存在（已确认 ✅）

## 架构设计

系统采用经典的 Vue 3 前端架构：

```
Views (页面视图)
  ↓
Stores (Pinia 状态管理 ←→ Dexie.js IndexedDB)
  ↓
Composables (组合式业务逻辑)
  ↓
Engines (纯函数引擎: YAML/模板/CSS/表单/预览)
  ↓
Types (类型定义层)
```

本次改动集中在 Types 层（向上传导）和 Tests 层（全覆盖），不改变架构。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在实现过程中深度探索各模块的具体实现细节，确保类型修改和测试编写的准确性
- Expected outcome: 快速定位所有受类型变更影响的调用点，验证测试覆盖率完整性

### Skill

- **github**
- Purpose: 验证 GitHub Actions 工作流的正确性，确认 CI/CD 配置符合最佳实践
- Expected outcome: 确保 deploy-cloudflare.yml 工作流语法和配置正确