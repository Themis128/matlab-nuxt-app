/* eslint-disable @typescript-eslint/no-unused-vars */
/* Nuxt/Vue helper shims - provides basic ambient declarations to reduce editor noise.
 * These intentionally use `any` types to limit friction in large monorepos.
 * Later you can replace `any` with strict types from `@nuxt/schema` and `vue`.
 */

declare function ref<T = any>(value?: T): any
declare function computed<T = any>(fn: any): any
declare function reactive<T = any>(obj: T): T
declare function watch(...args: any[]): any
declare function onMounted(fn: () => void): void
// Common Vue Composition API
declare global {
  // basic global shims (use 'any' for now to reduce editor noise)
  function ref<T = any>(value?: T): any
  function computed<T = any>(fn: any): any
  function reactive<T = any>(obj: any): any
  function watch(...args: any[]): any
  function onMounted(fn: any): any
  function onUnmounted(fn: any): any
  function defineAppConfig<T = any>(cfg: T): any
  function defineNuxtConfig<T = any>(cfg: T): any
  function watchEffect(fn: any): any
  const watchEffect: any
  const readonly: any
  const nextTick: any
  const useColorMode: any
  const useKeyboardShortcuts: any
  const useApiConfig: any
  const useApiStatus: any
  const useMobileImage: any
  const useUserPreferences: any
  function useAsyncData<T = any>(name: string | undefined, handler: any, opts?: any): any
  function useFetch<T = any>(url: string | ((...args: any[]) => any), opts?: any): any
  function useLazyAsyncData(name: string | undefined, handler: any, opts?: any): any
  function useState<T = any>(key: string, factory?: () => T): any
  const onUnmounted: any
  function useHead(arg?: any): any
  function navigateTo(url?: string, options?: any): any
  function useRoute(): any
  function useRouter(): any
  function defineNuxtPlugin(fn: any): any
  const useRoute: any
  const useRouter: any
  const defineNuxtPlugin: any
  function defineEventHandler(fn: any): any
  function readBody<T = any>(event: any): Promise<T>
  function createError(opts?: any): any
  function getQuery(event: any): any
  const getRequestProtocol: any
  const getRequestHost: any
  const getRouterParam: any
  function setHeader(event: any, name: string, value: string): any
  function getMethod(event: any): string

  // Also export as `const` globals to help template and SFC scope
  declare const useRuntimeConfig: () => AppRuntimeConfig
  declare const navigateTo: any
  declare const useHead: any
  declare const useRoute: any
  declare const useRouter: any
  declare const useApiConfig: any
  declare const useApiStatus: any
  declare const useMobileImage: any
  declare const useUserPreferences: any
}

// Nuxt helpers
declare function defineNuxtPlugin(fn: any): any
declare function useRuntimeConfig(): AppRuntimeConfig
declare function useHead(arg?: any): any
declare function navigateTo(url?: string, options?: any): any
declare function useRoute(): any
declare function useRouter(): any

// Nitro server helpers (h3 / Nitro runtime)
declare function defineEventHandler(fn: any): any
declare function getQuery(event: any): any
declare function getRequestHeader(event: any, name: string): any
declare function getRequestHost(event: any): any
declare function getRequestProtocol(event: any): any
declare function getRouterParam(event: any, name: string): any
declare function setHeader(event: any, name: string, value: string): any
declare function readBody<T = any>(event: any): Promise<T>
declare function createError(opts: any): any

// Other common helpers used in the repo
declare function useHeadMeta(): any

// Make sure this file is included by tsconfig.* to help editor & tsc
export {}

// Augment component instance with runtime helpers used in templates
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    navigateTo?: any
    nextTick?: any
    $nuxt?: any
  }
}
