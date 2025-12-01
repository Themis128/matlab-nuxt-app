// Generic module shims to silence import-not-found for project-local modules

declare module '~/stores/*' {
  const value: any
  export default value
}

declare module '#components' {
  const value: any
  export default value
}

declare module '#imports' {
  export * from '../types/auto-imports'
  const _default: any
  export default _default
}

declare module '~/components/*' {
  import type { DefineComponent } from 'vue'
  const Comp: DefineComponent<any, any, any>
  export default Comp
}

// Vuetify/3rd party runtime modules
declare module '#app'

export {}
