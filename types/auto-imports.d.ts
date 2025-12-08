/* eslint-disable @typescript-eslint/no-unused-vars */
// Auto-imported helpers and `#imports` module shims for editor

declare module '#imports' {
  export function useHead(arg?: any): any;
  export function useAsyncData<T = any>(name: string | undefined, handler: any, opts?: any): any;
  export function useFetch<T = any>(url: string | ((...args: any[]) => any), opts?: any): any;
  export function useRoute(): any;
  export function useRouter(): any;
  export function navigateTo(url?: string, options?: any): any;
  export function useLazyAsyncData(name: string | undefined, handler: any, opts?: any): any;
  export function useRuntimeConfig(): AppRuntimeConfig;
  export function useState<T = any>(key: string, factory?: () => T): any;
  export function defineNuxtComponent<T = any>(comp: T): T;
  export function useCookie(key: string, opts?: any): any;
  export function useRequestHeaders(keys?: string | readonly string[]): any;
  export function useRequestEvent(): any;

  // Additional helpers used in this repo
  export const useHeadMeta: any;
  export const useApiConfig: any;
  export const useApiStatus: any;
  export const useUserPreferences: any;
}

// Provide named re-exports for convenience under the global namespace
export {};
