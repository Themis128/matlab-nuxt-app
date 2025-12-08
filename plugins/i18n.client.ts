/**
 * i18n Plugin
 *
 * Initializes i18n on client-side and syncs with locale store
 */
export default defineNuxtPlugin(async (nuxtApp: any) => {
  // Initialize locale store
  const localeStore = useLocaleStore();
  await localeStore.initializeLocale();

  // Wait for i18n to be ready
  if (nuxtApp.$i18n) {
    // Sync locale store with i18n
    watch(
      () => localeStore.currentLocale,
      async (newLocale: string) => {
        try {
          if (nuxtApp.$i18n && nuxtApp.$i18n.locale.value !== newLocale) {
            await nuxtApp.$i18n.setLocale(newLocale);
          }
        } catch (error) {
          console.warn('Failed to sync locale with i18n:', error);
        }
      },
      { immediate: true }
    );

    // Sync i18n with locale store
    watch(
      () => nuxtApp.$i18n?.locale?.value,
      (newLocale: string) => {
        if (newLocale && localeStore.currentLocale !== newLocale) {
          localeStore.setLocale(newLocale);
        }
      }
    );
  }
});
