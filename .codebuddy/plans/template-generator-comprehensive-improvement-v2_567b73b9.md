---
name: template-generator-comprehensive-improvement-v2
overview: 完善类型声明消除 any、编写完整单元测试并生成测试覆盖率报告、更新文档（README + DEPLOYMENT）、增强 CI/CD 支持双平台部署、编写小白友好的部署引导文档。不含 CONTRIBUTING.md，最终输出完整测试报告+覆盖率报告。
todos:
  - id: fix-types
    content: 消除所有 any 类型声明：新建 FieldValue/SnippetData 映射类型，级联修复 snippet.ts/project.ts/template-engine.ts/form-engine.ts/use-preview.ts/DynamicForm.vue/CustomJsDialog.vue 共 7 处
    status: completed
  - id: write-tests-engines
    content: 编写引擎和数据库层单元测试：yaml-parser.test.ts + database/index.test.ts，覆盖 YAML 加载/缓存/Dexie CRUD 操作
    status: completed
    dependencies:
      - fix-types
  - id: write-tests-stores
    content: 编写 Pinia Store 单元测试：app-store/test.ts + project-store.test.ts + snippet-store.test.ts + template-store.test.ts，覆盖全部 Store 的状态管理和异步操作
    status: completed
    dependencies:
      - fix-types
  - id: write-tests-composables
    content: 编写 Composable 单元测试：use-auto-save.test.ts + use-fullscreen.test.ts + use-theme.test.ts，覆盖防抖保存/全屏切换/主题持久化
    status: completed
    dependencies:
      - fix-types
  - id: run-tests-fix
    content: 运行全量测试 pnpm test，修复所有失败的测试用例和类型错误，确保 100% 通过
    status: completed
    dependencies:
      - write-tests-engines
      - write-tests-stores
      - write-tests-composables
  - id: update-docs
    content: 全面更新文档：重写 README.md（技术栈/功能/目录结构），新建 DEPLOYMENT.md（小白部署教程），不创建 CONTRIBUTING.md
    status: completed
    dependencies:
      - run-tests-fix
  - id: add-cf-cicd
    content: 新增 Cloudflare Pages 自动部署工作流 .github/workflows/deploy-cloudflare.yml，使用 wrangler-action 实现推送即部署
    status: completed
  - id: generate-test-report
    content: 运行 pnpm test:coverage 并生成 tests/TEST_REPORT.md 合并报告（用例结果 + 覆盖率统计 + 失败详情）
    status: completed
    dependencies:
      - run-tests-fix
  - id: final-verify
    content: 最终验证：运行 pnpm type-check + pnpm lint + pnpm test + pnpm build 全流程无报错，使用 [skill:github] 验证 CI/CD 配置
    status: completed
    dependencies:
      - run-tests-fix
      - update-docs
      - add-cf-cicd
      - generate-test-report
---

## 产品概述

Template Generator（模板生成器）是一个基于 Vue 3 + TypeScript 的浏览器端模板生成工具。用户可从预置页面模板中选择，通过添加、配置和排序代码片段，结合自定义 CSS/JS，最终生成自定义页面。

## 核心需求

1. **TypeScript 类型完善**：消除所有 `any` 类型使用（共 7 处），建立 `FieldValue` / `SnippetData` 类型映射体系
2. **单元测试全覆盖**：为 9 个缺失模块编写完整测试（yaml-parser、4个 store、database、3个 composable），与现有 ~47 用例合并后全部通过
3. **文档全面更新**：重写 README.md（技术栈/功能/目录结构对齐最新），新建 DEPLOYMENT.md（小白友好部署教程）
4. **CI/CD 双平台自动部署**：保留 GitHub Pages 工作流，新增 Cloudflare Pages 自动部署工作流
5. **小白部署引导**：Fork -> 配置 -> 部署一站式完整教程（GitHub Pages / Cloudflare Pages / Docker 三种方式）
6. **测试+覆盖率合并报告**：最终生成 `tests/TEST_REPORT.md`，包含用例执行结果、按模块覆盖率统计、失败详情

### 用户修订确认

- ~~不需要贡献指南~~：不创建 CONTRIBUTING.md
- 测试报告和覆盖率报告合为一个文件输出到 tests/TEST_REPORT.md

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

**策略**：建立字段类型到默认值类型的映射联合类型，用 `SnippetData` 统一动态数据结构。

核心变更：

1. 新增 `FieldValue = string | number | boolean` 和 `FieldDefaultValueMap` 映射类型，替换 `FieldDef.default: any`
2. 新增 `SnippetData = Record<string, FieldValue> | Record<string, FieldValue>[]`，替代所有 `Record<string, any>`
3. 级联修复链：snippet.ts → project.ts → template-engine.ts → form-engine.ts → use-preview.ts → DynamicForm.vue / CustomJsDialog.vue

### 二、单元测试全覆盖

**策略**：按模块分层，纯函数直接测，Store/Composable 用 Vitest + happy-dom。

| 测试文件 | 目标模块 | 核心覆盖 |
| --- | --- | --- |
| yaml-parser.test.ts | loadYaml/loadHtml/clearCache | 解析/缓存/错误 |
| database/index.test.ts | Dexie CRUD | 项目增删改查/主题存取 |
| app-store.test.ts | useAppStore | sidebar/theme 状态管理 |
| project-store.test.ts | useProjectStore | CRUD/片段管理/排序复制 |
| snippet-store.test.ts | useSnippetStore | 加载/缓存/HTML获取 |
| template-store.test.ts | useTemplateStore | 加载/选择/清除 |
| use-auto-save.test.ts | useAutoSave | 防抖保存/卸载保存 |
| use-fullscreen.test.ts | useFullscreen | 进入/退出/切换全屏 |
| use-theme.test.ts | useTheme | 切换循环/system跟随 |


**关键决策**：Store 测试用 createPinia() + setActivePinia()；IndexedDB 测试用 fake-indexeddb；遵循现有 makeConfig/makeInstance 工厂风格。

### 三、文档体系更新

**README.md 重写**：技术栈版本对齐 package.json、补全 JS 编辑器/objectWithList/多预览图等功能、目录树补充 js/ 和 _redirects、CI/CD 增加 Cloudflare 说明。
**DEPLOYMENT.md 新建**：三种部署方式的完整步骤（前置条件 → 操作命令 → 验证方法 → FAQ），不含 CONTRIBUTING.md。

### 四、CI/CD 双平台部署

新增 `.github/workflows/deploy-cloudflare.yml`：push to main 触发 → lint-test-build → cloudflare/wrangler-action@v3 部署。需 Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID。现有 deploy.yml 不变。

### 五、测试+覆盖率合并报告

运行 `pnpm test:coverage` 后生成 `tests/TEST_REPORT.md`：全局统计摘要、按文件覆盖率四维表(Statements/Branches/Functions/Lines)、各模块用例详情、失败堆栈、不足80%的改进建议。

## 目录结构变更总览

```
template-generator/
├── src/types/
│   ├── snippet.ts              # [MODIFY] 新增 FieldValue/SnippetData，消除 any
│   └── project.ts              # [MODIFY] SnippetInstance.data 类型化
├── src/engines/
│   ├── template-engine.ts      # [MODIFY] 参数类型 SnippetData
│   └── form-engine.ts          # [MODIFY] 返回值类型优化
├── src/composables/
│   └── use-preview.ts          # [MODIFY] 移除 as any
├── src/components/
│   ├── js/CustomJsDialog.vue   # [MODIFY] catch(e: unknown)
│   └── snippet/DynamicForm.vue # [MODIFY] handleInput value 类型化
├── tests/unit/engines/
│   └── yaml-parser.test.ts     # [NEW]
├── tests/unit/stores/
│   ├── app-store.test.ts       # [NEW]
│   ├── project-store.test.ts   # [NEW]
│   ├── snippet-store.test.ts   # [NEW]
│   └── template-store.test.ts  # [NEW]
├── tests/unit/database/
│   └── index.test.ts           # [NEW]
├── tests/unit/composables/
│   ├── use-auto-save.test.ts   # [NEW]
│   ├── use-fullscreen.test.ts  # [NEW]
│   └── use-theme.test.ts       # [NEW]
├── tests/TEST_REPORT.md        # [NEW] 测试+覆盖率合并报告
├── .github/workflows/
│   └── deploy-cloudflare.yml   # [NEW]
├── DEPLOYMENT.md               # [NEW] 小白部署教程
└── README.md                   # [MODIFY] 全面更新
```

## 关键注意事项

- **零运行时开销**：类型变更纯 TypeScript，不影响打包产物
- **向后兼容**：FieldValue 是 any 的严格子集，现有数据完全兼容
- **ESLint 收紧**：建议将 no-explicit-any 从 warn 升为 error
- **测试隔离**：每个文件独立创建 pinia/db 实例
- **_redirects 已就绪**：public/_redirects 已存在，Cloudflare SPA 路由无问题

### SubAgent

- **code-explorer**
- Purpose: 实现过程中深度探索各模块细节，确保类型修改和测试编写准确
- Expected outcome: 定位所有受类型变更影响的调用点，验证测试覆盖完整性

### Skill

- **github**
- Purpose: 验证 GitHub Actions 工作流正确性，确认 CI/CD 配置符合最佳实践
- Expected outcome: 确保 deploy-cloudflare.yml 语法和配置正确无误