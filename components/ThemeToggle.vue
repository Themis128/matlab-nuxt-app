<template>
  <div class="flex items-center gap-3">
    <UIcon name="i-heroicons-sun" class="w-5 h-5 text-yellow-500" />
    <UToggle
      aria-label="theme toggle"
      :model-value="isDarkMode"
      @update:model-value="toggleTheme"
      class="bg-green-500 data-[state=on]:bg-purple-600"
    />
    <UIcon name="i-heroicons-moon" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
    <UBadge
      v-if="currentTheme !== 'system'"
      :color="currentTheme === 'dark' ? 'purple' : 'yellow'"
      variant="soft"
      size="xs"
    >
      {{ currentTheme }}
    </UBadge>
    <span v-else class="text-xs text-gray-500">system</span>
  </div>
</template>

<script setup lang="ts">
  // Completely isolate theme state from store during SSR
  const currentTheme = ref('system')
  const isDarkMode = ref(false)

  // Helper functions
  const applyThemeToDocument = (theme: string) => {
    if (typeof window === 'undefined') return // Skip on server

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Optional: Update custom CSS variables
    document.documentElement.style.setProperty(
      '--theme-color',
      theme === 'dark' ? '#8b5cf6' : '#fbbf24'
    )
  }

  // Initialize theme on client-side only
  const initializeTheme = async () => {
    if (typeof window === 'undefined') return

    // Import store only on client side to avoid SSR issues
    const { useUserPreferencesStore } = await import('~/stores/userPreferencesStore')
    const userPreferencesStore = useUserPreferencesStore()

    const storeTheme = userPreferencesStore.theme
    const resolvedTheme = userPreferencesStore.getResolvedTheme

    currentTheme.value = storeTheme
    isDarkMode.value = resolvedTheme === 'dark'
    applyThemeToDocument(resolvedTheme)

    // Watch for theme changes
    watchEffect(() => {
      const newStoreTheme = userPreferencesStore.theme
      const newResolvedTheme = userPreferencesStore.getResolvedTheme

      currentTheme.value = newStoreTheme
      isDarkMode.value = newResolvedTheme === 'dark'
      applyThemeToDocument(newResolvedTheme)
    })
  }

  // Methods
  const toggleTheme = async (_enabled: boolean) => {
    // Import store dynamically to avoid SSR issues
    const { useUserPreferencesStore } = await import('~/stores/userPreferencesStore')
    const userPreferencesStore = useUserPreferencesStore()

    // Cycle through: light -> dark -> system -> light...
    const themes = ['light', 'dark', 'system'] as const
    const currentThemeValue = currentTheme.value || 'system'

    // Ensure currentThemeValue is one of the valid themes
    let currentIndex = themes.indexOf(currentThemeValue as any)
    if (currentIndex === -1) {
      currentIndex = 2 // Default to system if not found
    }

    const nextIndex = (currentIndex + 1) % themes.length

    userPreferencesStore.setTheme(themes[nextIndex]!)
  }

  // Initialize on client-side only
  onMounted(() => {
    initializeTheme()
  })
</script>
