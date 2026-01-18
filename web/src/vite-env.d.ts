/// <reference types="vite/client" />

/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  /** API 基础 URL */
  readonly VITE_API_BASE_URL?: string

  /** WebSocket URL */
  readonly VITE_WS_URL?: string

  /** 应用名称 */
  readonly VITE_APP_TITLE?: string

  /** 是否启用调试模式 */
  readonly VITE_DEBUG?: string

  /** 环境标识 */
  readonly MODE: string

  /** 是否为开发环境 */
  readonly DEV: boolean

  /** 是否为生产环境 */
  readonly PROD: boolean

  /** 是否为 SSR */
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Vue 组件类型声明
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

/**
 * 静态资源类型声明
 */
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

/**
 * 全局类型扩展
 */
declare global {
  /**
   * Window 扩展
   */
  interface Window {
    /** 应用版本 */
    __APP_VERSION__?: string
    /** 构建时间 */
    __BUILD_TIME__?: string
  }
}

export {}
