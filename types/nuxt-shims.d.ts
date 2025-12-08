/* eslint-disable @typescript-eslint/no-unused-vars */
/* Nuxt/Vue helper shims - provides basic ambient declarations to reduce editor noise.
 * These intentionally use `any` types to limit friction in large monorepos.
 * Later you can replace `any` with strict types from `@nuxt/schema` and `vue`.
 */

declare function ref<T = any>(value?: T): any;
declare function computed<T = any>(fn: any): any;
declare function reactive<T = any>(obj: T): T;
declare function watch(...args: any[]): any;
declare function onMounted(fn: () => void): void;
// Common Vue Composition API
declare global {
  // basic global shims (use 'any' for now to reduce editor noise)
  function ref<T = any>(value?: T): any;
  function computed<T = any>(fn: any): any;
  function reactive<T = any>(obj: any): any;
  function watch(...args: any[]): any;
  function onMounted(fn: any): any;
  function onUnmounted(fn: any): any;
  function defineAppConfig<T = any>(cfg: T): any;
  function defineNuxtConfig<T = any>(cfg: T): any;
  function watchEffect(fn: any): any;
  const watchEffect: any;
  const readonly: any;
  const nextTick: any;
  const useColorMode: any;
  const useKeyboardShortcuts: any;
  const useApiConfig: any;
  const useApiStatus: any;
  const useUserPreferences: any;
  function useAsyncData<T = any>(name: string | undefined, handler: any, opts?: any): any;
  function useFetch<T = any>(url: string | ((...args: any[]) => any), opts?: any): any;
  function useLazyAsyncData(name: string | undefined, handler: any, opts?: any): any;
  function useState<T = any>(key: string, factory?: () => T): any;
  const onUnmounted: any;
  function useHead(arg?: any): any;
  function navigateTo(url?: string, options?: any): any;
  function useRoute(): any;
  function useRouter(): any;
  function defineNuxtPlugin(fn: any): any;
  const useRoute: any;
  const useRouter: any;
  const defineNuxtPlugin: any;
  function defineEventHandler(fn: any): any;
  function readBody<T = any>(event: any): Promise<T>;
  function createError(opts?: any): any;
  function getQuery(event: any): any;
  const getRequestProtocol: any;
  const getRequestHost: any;
  const getRouterParam: any;
  function setHeader(event: any, name: string, value: string): any;
  function getMethod(event: any): string;
  function getCookie(event: any, name: string): string | undefined;
  function useStorage(key: string): any;
  function getRequestURL(event: any): URL;
  function getHeader(event: any, name: string): string | undefined;
  function defineNitroPlugin(fn: any): any;

  // Also export as `const` globals to help template and SFC scope
  declare const useRuntimeConfig: () => AppRuntimeConfig;
  declare const navigateTo: any;
  declare const useHead: any;
  declare const useRoute: any;
  declare const useRouter: any;
  declare const useApiConfig: any;
  declare const useApiStatus: any;
  declare const useUserPreferences: any;
  declare const useCookie: any;
  declare const getCookie: any;
  declare const useStorage: any;
  declare const getRequestURL: any;
  declare const getHeader: any;
  declare const defineNitroPlugin: any;
  declare const useImageCacheStore: any;
  declare const useSentryLogger: any;
  declare const useSentryErrorFilter: any;
  declare const useSentryMetrics: any;
  declare const useAlgoliaImage: any;
  declare const usePerformance: any;
  declare const useAnalytics: any;
  declare const useToast: any;
  declare const useLocaleStore: any;
  declare const useUserPreferencesStore: any;
  declare const useNuxtApp: any;
  declare const useI18n: any;
  declare const onBeforeUnmount: any;
  declare const $fetch: any;
  function useCookie<T = any>(name: string, opts?: any): any;
  function useImageCacheStore(): any;
  function useSentryLogger(): any;
  function useSentryErrorFilter(): any;
  function useSentryMetrics(): any;
  function useAlgoliaImage(): any;
  function usePerformance(): any;
  function useAnalytics(): any;
  function useToast(): any;
  function useLocaleStore(): any;
  function useUserPreferencesStore(): any;
  function useNuxtApp(): any;
  function useI18n(): any;
  function onBeforeUnmount(fn: any): any;
  function getHeaders(event: any): any;
  function defineI18nConfig(fn: any): any;
}

// Nuxt helpers
declare function defineNuxtPlugin(fn: any): any;
declare function useRuntimeConfig(): AppRuntimeConfig;
declare function useHead(arg?: any): any;
declare function navigateTo(url?: string, options?: any): any;
declare function useRoute(): any;
declare function useRouter(): any;

// Nitro server helpers (h3 / Nitro runtime)
declare function defineEventHandler(fn: any): any;
declare function getQuery(event: any): any;
declare function getRequestHeader(event: any, name: string): any;
declare function getHeaders(event: any): any;
declare function getRequestHost(event: any): any;
declare function getRequestProtocol(event: any): any;
declare function getRouterParam(event: any, name: string): any;
declare function setHeader(event: any, name: string, value: string): any;
declare function readBody<T = any>(event: any): Promise<T>;
declare function createError(opts: any): any;
declare function useCookie<T = any>(name: string, opts?: any): any;
declare function getCookie(event: any, name: string): string | undefined;
declare function useStorage(key: string): any;
declare function getValidatedQuery<T = any>(event: any, schema: any): T;
declare function getValidatedBody<T = any>(event: any, schema: any): T;
declare function getRequestURL(event: any): URL;
declare function getHeader(event: any, name: string): string | undefined;
declare function setResponseStatus(event: any, status: number, statusMessage?: string): void;
declare function defineNitroPlugin(fn: any): any;
declare function getMethod(event: any): string;
declare function useImageCacheStore(): any;
declare function useSentryLogger(): any;
declare function useSentryErrorFilter(): any;
declare function useSentryMetrics(): any;
declare function useAlgoliaImage(): any;
declare function usePerformance(): any;
declare function useAnalytics(): any;
declare function useToast(): any;
declare function useLocaleStore(): any;
declare function useUserPreferencesStore(): any;
declare function useNuxtApp(): any;
declare function useI18n(): any;
declare function onBeforeUnmount(fn: any): any;
declare function defineI18nConfig(fn: any): any;
declare const $fetch: any;

// Other common helpers used in the repo
declare function useHeadMeta(): any;

// Make sure this file is included by tsconfig.* to help editor & tsc
export {};

// Augment component instance with runtime helpers used in templates
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    navigateTo?: any;
    nextTick?: any;
    $nuxt?: any;
  }
}
