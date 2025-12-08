<template>
  <div class="container mx-auto max-w-6xl p-6">
    <!-- Header -->
    <div class="animate-slide-up mb-12">
      <div class="mb-4 flex items-center gap-4">
        <div class="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
          <Icon name="i-heroicons-paint-brush" class="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 class="text-display text-gray-900 dark:text-white">Style Guide</h1>
          <p class="mt-1 text-lg text-gray-600 dark:text-gray-300">
            Comprehensive design system and component showcase
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="mb-8">
      <DTabs v-model="activeSection" :items="sections" class="mb-8">
        <!-- Typography Section -->
        <template #typography>
          <div class="animate-stagger space-y-8">
            <EnhancedCard title="Typography" icon="i-heroicons-document-text" color="blue">
              <div class="space-y-6">
                <div>
                  <h2 class="text-display mb-4">Display Text</h2>
                  <p class="text-gray-600 dark:text-gray-400">
                    Large, attention-grabbing headlines
                  </p>
                </div>

                <div>
                  <h3 class="text-heading mb-2">Heading Text</h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    Section headings and important titles
                  </p>
                </div>

                <div>
                  <h4 class="text-subheading mb-2">Subheading Text</h4>
                  <p class="text-gray-600 dark:text-gray-400">Subsection titles and labels</p>
                </div>

                <div>
                  <p class="mb-2 text-base">Body Text</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Regular content and descriptions
                  </p>
                </div>

                <div class="space-y-2">
                  <p class="text-gradient-purple text-xl font-bold">Gradient Purple Text</p>
                  <p class="text-gradient-blue text-xl font-bold">Gradient Blue Text</p>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </template>

        <!-- Colors Section -->
        <template #colors>
          <div class="animate-stagger space-y-8">
            <EnhancedCard title="Color Palette" icon="i-heroicons-swatch" color="purple">
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div v-for="color in colorPalette" :key="color.name" class="text-center">
                  <div :class="color.bg" class="mb-2 h-20 w-full rounded-lg shadow-sm" />
                  <p class="text-sm font-medium">
                    {{ color.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ color.value }}
                  </p>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard title="Status Colors" icon="i-heroicons-signal" color="green">
              <div class="space-y-4">
                <div class="status-indicator status-success">
                  <Icon name="i-heroicons-check-circle" class="h-4 w-4" />
                  Success Status
                </div>
                <div class="status-indicator status-warning">
                  <Icon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                  Warning Status
                </div>
                <div class="status-indicator status-error">
                  <Icon name="i-heroicons-x-circle" class="h-4 w-4" />
                  Error Status
                </div>
                <div class="status-indicator status-info">
                  <Icon name="i-heroicons-information-circle" class="h-4 w-4" />
                  Info Status
                </div>
              </div>
            </EnhancedCard>
          </div>
        </template>

        <!-- Components Section -->
        <template #components>
          <div class="animate-stagger space-y-8">
            <!-- Cards -->
            <EnhancedCard title="Card Variants" icon="i-heroicons-rectangle-stack" color="blue">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <EnhancedCard variant="default" title="Default Card" subtitle="Standard card style">
                  <p class="text-gray-600 dark:text-gray-400">
                    This is a default card with standard styling.
                  </p>
                </EnhancedCard>

                <EnhancedCard variant="modern" title="Modern Card" subtitle="Enhanced modern style">
                  <p class="text-gray-600 dark:text-gray-400">
                    This is a modern card with enhanced effects.
                  </p>
                </EnhancedCard>

                <EnhancedCard variant="glass" title="Glass Card" subtitle="Glassmorphism effect">
                  <p class="text-gray-600 dark:text-gray-400">
                    This is a glass card with blur effects.
                  </p>
                </EnhancedCard>

                <EnhancedCard
                  variant="gradient"
                  title="Gradient Card"
                  subtitle="Subtle gradient background"
                >
                  <p class="text-gray-600 dark:text-gray-400">
                    This is a gradient card with color effects.
                  </p>
                </EnhancedCard>

                <EnhancedCard
                  variant="bordered"
                  title="Bordered Card"
                  subtitle="Prominent border style"
                >
                  <p class="text-gray-600 dark:text-gray-400">
                    This is a bordered card with thick borders.
                  </p>
                </EnhancedCard>

                <EnhancedCard
                  variant="modern"
                  title="Interactive Card"
                  subtitle="Clickable with hover effects"
                  clickable
                  @click="showToast({ title: 'Card clicked!', color: 'info' })"
                >
                  <p class="text-gray-600 dark:text-gray-400">Click me to see interaction!</p>
                </EnhancedCard>
              </div>
            </EnhancedCard>

            <!-- Buttons -->
            <EnhancedCard title="Button Styles" icon="i-heroicons-cursor-arrow-rays" color="green">
              <div class="space-y-6">
                <div class="flex flex-wrap gap-4">
                  <DButton variant="primary"> Primary Button </DButton>
                  <DButton variant="secondary"> Secondary Button </DButton>
                  <DButton variant="error"> Danger Button </DButton>
                  <DButton variant="outline"> Outline Button </DButton>
                  <DButton variant="ghost"> Ghost Button </DButton>
                </div>

                <div class="flex flex-wrap gap-4">
                  <DButton size="xs"> Extra Small </DButton>
                  <DButton size="sm"> Small </DButton>
                  <DButton size="md"> Medium </DButton>
                  <DButton size="lg"> Large </DButton>
                </div>
              </div>
            </EnhancedCard>

            <!-- Form Elements -->
            <EnhancedCard title="Form Elements" icon="i-heroicons-document-text" color="yellow">
              <div class="space-y-6">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium">Enhanced Input</label>
                    <input type="text" placeholder="Type something..." class="form-input w-full" />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium">Standard Input</label>
                    <DInput placeholder="Standard input" />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium">Textarea</label>
                    <textarea
                      class="textarea textarea-bordered w-full"
                      placeholder="Enter your message..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium">Select</label>
                    <DSelect
                      :options="['Option 1', 'Option 2', 'Option 3']"
                      placeholder="Choose an option"
                    />
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </template>

        <!-- Loading States -->
        <template #loading>
          <div class="animate-stagger space-y-8">
            <EnhancedCard title="Loading Spinners" icon="i-heroicons-arrow-path" color="blue">
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-4 text-center">
                  <h4 class="font-medium">Spinner</h4>
                  <LoadingSpinner type="spinner" size="lg" color="blue" />
                </div>

                <div class="space-y-4 text-center">
                  <h4 class="font-medium">Dots</h4>
                  <LoadingSpinner type="dots" size="lg" color="blue" />
                </div>

                <div class="space-y-4 text-center">
                  <h4 class="font-medium">Pulse</h4>
                  <LoadingSpinner type="pulse" size="lg" color="green" />
                </div>

                <div class="space-y-4 text-center">
                  <h4 class="font-medium">Bars</h4>
                  <LoadingSpinner type="bars" size="lg" color="red" />
                </div>

                <div class="space-y-4 text-center">
                  <h4 class="font-medium">Skeleton</h4>
                  <LoadingSpinner type="skeleton" size="lg" />
                </div>

                <div class="space-y-4 text-center">
                  <h4 class="font-medium">With Text</h4>
                  <LoadingSpinner
                    type="spinner"
                    size="md"
                    color="blue"
                    text="Loading..."
                    show-text
                  />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard
              title="Loading Card Example"
              icon="i-heroicons-clock"
              color="yellow"
              :loading="loadingDemo"
            >
              <div class="space-y-4">
                <p class="text-gray-600 dark:text-gray-400">
                  This card demonstrates the loading state overlay effect.
                </p>
                <DButton :disabled="loadingDemo" @click="toggleLoading" :loading="loadingDemo">
                  Simulate Loading
                </DButton>
              </div>
            </EnhancedCard>
          </div>
        </template>

        <!-- Animations -->
        <template #animations>
          <div class="animate-stagger space-y-8">
            <EnhancedCard title="Animation Examples" icon="i-heroicons-play" color="purple">
              <div class="space-y-8">
                <div>
                  <h4 class="mb-4 font-medium">Entrance Animations</h4>
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div class="card-modern animate-slide-up p-4">
                      <h5 class="mb-2 font-medium">Slide Up</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">animate-slide-up</p>
                    </div>

                    <div class="card-modern animate-slide-right p-4">
                      <h5 class="mb-2 font-medium">Slide Right</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">animate-slide-right</p>
                    </div>

                    <div class="card-modern animate-scale-in p-4">
                      <h5 class="mb-2 font-medium">Scale In</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">animate-scale-in</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="mb-4 font-medium">Hover Effects</h4>
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="card-hover-lift card-modern cursor-pointer p-4">
                      <h5 class="mb-2 font-medium">Lift on Hover</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Hover to see the lift effect
                      </p>
                    </div>

                    <div class="card-hover card-modern cursor-pointer p-4">
                      <h5 class="mb-2 font-medium">Standard Hover</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Standard hover animation
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="mb-4 font-medium">Staggered Animation</h4>
                  <div class="animate-stagger grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div class="card-modern p-4">Item 1</div>
                    <div class="card-modern p-4">Item 2</div>
                    <div class="card-modern p-4">Item 3</div>
                    <div class="card-modern p-4">Item 4</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </template>
      </DTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const toast = useToast();
const showToast = (options: any) => toast.add(options);

// Page setup
useHead({
  title: 'Style Guide - MATLAB Analytics',
  meta: [
    {
      name: 'description',
      content: 'Comprehensive design system and component showcase for MATLAB Analytics',
    },
  ],
});

// Data
const activeSection = ref('typography');
const loadingDemo = ref(false);

const sections = [
  { key: 'typography', label: 'Typography', slot: 'typography' },
  { key: 'colors', label: 'Colors', slot: 'colors' },
  { key: 'components', label: 'Components', slot: 'components' },
  { key: 'loading', label: 'Loading States', slot: 'loading' },
  { key: 'animations', label: 'Animations', slot: 'animations' },
];

const colorPalette = [
  { name: 'Purple 500', value: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Blue 500', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Green 500', value: '#10b981', bg: 'bg-green-500' },
  { name: 'Red 500', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Yellow 500', value: '#f59e0b', bg: 'bg-yellow-500' },
  { name: 'Gray 500', value: '#6b7280', bg: 'bg-gray-500' },
  { name: 'Indigo 500', value: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Pink 500', value: '#ec4899', bg: 'bg-pink-500' },
];

// Methods
const toggleLoading = () => {
  loadingDemo.value = true;
  setTimeout(() => {
    loadingDemo.value = false;
    showToast({
      title: 'Loading Complete!',
      description: 'The loading simulation has finished.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  }, 3000);
};
</script>

<style scoped>
/* Additional component-specific styles */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* Enhanced card hover for demo */
.demo-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
