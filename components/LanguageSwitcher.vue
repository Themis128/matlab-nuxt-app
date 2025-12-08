<template>
  <div class="language-switcher" data-testid="language-switcher">
    <select
      v-model="selectedLocale"
      class="select select-bordered select-sm"
      :disabled="localeLoading"
      @change="handleLocaleChange(($event.target as HTMLSelectElement).value)"
    >
      <option disabled selected v-if="localeLoading">Loading...</option>
      <option v-for="option in localeOptions" :key="option.code" :value="option.code">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
// Nuxt 4: Auto-imports composables (no explicit import needed)
// Use unified UI composable following Nuxt 4 best practices

interface LocaleOption {
  code: string;
  label: string;
  nativeName: string;
}

// Add proper type guards for component props
interface _LanguageSwitcherProps {
  initialLocale?: string;
  availableLocales?: {
    code: string;
    name: string;
    nativeName: string;
  }[];
  onLocaleChange?: (locale: string) => void;
}

// Use unified UI composable (auto-imported in Nuxt 4)
const {
  currentLocale,
  availableLocales,
  localeLoading,
  setLocale,
  currentLocaleInfo,
  initializeLocale,
} = useUI();

// Selected locale (bound to composable)
const selectedLocale = computed({
  get: () => currentLocale.value,
  set: async (value: string) => {
    if (value && value !== currentLocale.value) {
      await setLocale(value);
    }
  },
});

// Locale options for dropdown
const localeOptions = computed<LocaleOption[]>(() => {
  return availableLocales.value.map(
    (locale: { code: string; name: string; nativeName: string }) => ({
      code: locale.code,
      label: locale.name,
      nativeName: locale.nativeName,
    })
  );
});

// Current locale display name
const _currentLocaleName = computed(() => {
  return currentLocaleInfo.value?.name || 'English';
});

// Current locale code
const _currentLocaleCode = computed(() => {
  return currentLocale.value;
});

// Handle locale change
const handleLocaleChange = async (value: any) => {
  if (!value) return;
  const localeCode = typeof value === 'string' ? value : value.code;
  if (localeCode && localeCode !== currentLocale.value) {
    await setLocale(localeCode);
  }
};

// Initialize locale on mount
onMounted(async () => {
  await initializeLocale();
});
</script>

<style scoped>
.language-switcher {
  min-width: 120px;
}
</style>
