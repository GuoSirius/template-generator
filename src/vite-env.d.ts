/// <reference types="vite/client" />

// Vue 模块声明 - 允许 TypeScript 识别 .vue 文件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
