/**
 * Nuxt 4 plugin for toast notifications
 * Integrates with Nuxt UI toast system
 */
export default defineNuxtPlugin((nuxtApp: any) => {
  const toast = useToast();

  // Provide global toast methods
  nuxtApp.provide('toast', {
    success: (message: string, options?: any) => {
      toast.add({
        title: 'Success',
        description: message,
        color: 'green',
        ...options,
      });
    },
    error: (message: string, options?: any) => {
      toast.add({
        title: 'Error',
        description: message,
        color: 'red',
        ...options,
      });
    },
    warning: (message: string, options?: any) => {
      toast.add({
        title: 'Warning',
        description: message,
        color: 'yellow',
        ...options,
      });
    },
    info: (message: string, options?: any) => {
      toast.add({
        title: 'Info',
        description: message,
        color: 'blue',
        ...options,
      });
    },
  });
});
