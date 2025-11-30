<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-primary-500" />
          <h3 class="text-lg font-semibold">User Preferences</h3>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Theme Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-swatch" class="w-5 h-5 text-gray-500" />
            <label class="font-medium">Theme</label>
          </div>
          <USelectMenu
            v-model="localPreferences.theme"
            :options="themeOptions"
            placeholder="Select theme"
            class="w-full"
            @update:model-value="handlePreferenceChange('theme', $event)"
          />
        </div>

        <!-- Animation Toggle -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-play-pause" class="w-5 h-5 text-gray-500" />
            <label class="font-medium">Animations</label>
          </div>
          <div class="flex items-center gap-3">
            <UToggle
              v-model="localPreferences.animations"
              @update:model-value="handlePreferenceChange('animations', $event)"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ localPreferences.animations ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>

        <!-- Compact Mode Toggle -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-gray-500" />
            <label class="font-medium">Compact Mode</label>
          </div>
          <div class="flex items-center gap-3">
            <UToggle
              v-model="localPreferences.compactMode"
              @update:model-value="handlePreferenceChange('compactMode', $event)"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ localPreferences.compactMode ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>

        <!-- Auto Refresh Toggle -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-500" />
            <label class="font-medium">Auto Refresh</label>
          </div>
          <div class="flex items-center gap-3">
            <UToggle
              v-model="localPreferences.autoRefresh"
              @update:model-value="handlePreferenceChange('autoRefresh', $event)"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ localPreferences.autoRefresh ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between gap-3">
          <UButton variant="ghost" color="gray" @click="resetToDefaults">
            Reset to Defaults
          </UButton>
          <UButton @click="closeDialog"> Close </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { preferences, updatePreference, resetPreferences } = useUserPreferences()

// Local state for immediate UI updates
const localPreferences = ref({ ...preferences.value })

// Sync local preferences when props change
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      localPreferences.value = { ...preferences.value }
    }
  }
)

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const themeOptions = [
  { label: 'Light', value: 'light', icon: 'i-heroicons-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-heroicons-moon' },
  { label: 'System', value: 'system', icon: 'i-heroicons-computer-desktop' },
]

// Methods
const handlePreferenceChange = (key: string, value: any) => {
  updatePreference(key as keyof typeof preferences.value, value)
}

const resetToDefaults = () => {
  resetPreferences()
  localPreferences.value = { ...preferences.value }
}

const closeDialog = () => {
  isOpen.value = false
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Close dialog with Escape
  if (event.key === 'Escape' && isOpen.value) {
    closeDialog()
  }
}

// Add keyboard event listener
onMounted(() => {
  if (process.client) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>
