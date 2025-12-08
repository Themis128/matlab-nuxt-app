<template>
  <div class="min-h-screen bg-base-200">
    <!-- Header -->
    <header class="border-b border-base-300 bg-base-100">
      <div class="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:scale"
class="h-6 w-6 text-primary" />
            <div>
              <h1 class="text-xl font-bold text-base-content">Compare Devices</h1>
              <p class="text-sm opacity-70">Side-by-side comparison</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <DButton variant="ghost"
icon="heroicons:arrow-left" @click="navigateTo('/search')">
              Back to Search
            </DButton>
            <DButton
              v-if="hasComparisons"
              variant="outline"
              icon="heroicons:arrow-down-tray"
              @click="exportComparison"
            >
              Export
            </DButton>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Device Selectors -->
      <div class="mb-6">
        <slot name="selectors">
          <!-- Default device selector if none provided -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(slot, index) in comparisonSlots"
:key="index" class="space-y-2">
              <label class="label">
                <span class="label-text">Device {{ index + 1 }}</span>
              </label>
              <DSelect
                :model-value="slot.device?.name || ''"
                placeholder="Select device"
                :options="availableDevices.map((d) => ({ label: d.name, value: d.name }))"
                @update:model-value="
                  (value) => {
                    const device = availableDevices.find((d) => d.name === value);
                    handleDeviceSelect(device || null, index);
                  }
                "
              />
              <DButton v-if="slot.device" size="xs" variant="error" @click="removeDevice(index)">
                Remove
              </DButton>
            </div>
          </div>
        </slot>
      </div>

      <!-- Comparison Table -->
      <div v-if="hasComparisons"
class="overflow-x-auto">
        <div class="min-w-full rounded-lg border border-base-300 bg-base-100 shadow-lg">
          <!-- Sticky Header -->
          <div class="sticky top-0 z-10 border-b border-base-300 bg-base-200">
            <div
              class="grid"
              :style="{
                gridTemplateColumns: `200px repeat(${comparisonSlots.filter((s) => s.device).length}, 1fr)`,
              }"
            >
              <div class="border-r border-base-300 p-4 font-semibold text-base-content">
                Specification
              </div>
              <div
                v-for="(slot, index) in comparisonSlots.filter((s) => s.device)"
                :key="index"
                class="border-r border-base-300 p-4 text-center font-semibold text-base-content last:border-r-0"
              >
                {{ slot.device?.name || `Device ${index + 1}` }}
              </div>
            </div>
          </div>

          <!-- Comparison Content -->
          <slot>
            <!-- Default comparison rows if none provided -->
            <div
              v-for="spec in defaultSpecs"
              :key="spec.key"
              class="grid border-b border-base-300 last:border-b-0"
              :style="{
                gridTemplateColumns: `200px repeat(${comparisonSlots.filter((s) => s.device).length}, 1fr)`,
              }"
            >
              <div class="border-r border-base-300 p-4 font-medium opacity-70">
                {{ spec.label }}
              </div>
              <div
                v-for="(slot, index) in comparisonSlots.filter((s) => s.device)"
                :key="index"
                class="border-r border-base-300 p-4 text-center text-base-content last:border-r-0"
              >
                {{ slot.device?.[spec.key] || '—' }}
              </div>
            </div>
          </slot>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else
class="py-12 text-center">
        <Icon name="heroicons:scale"
class="mx-auto mb-4 h-16 w-16 opacity-40" />
        <h2 class="mb-2 text-xl font-semibold text-base-content">
No devices selected
</h2>
        <p class="mb-6 opacity-70">Select devices above to start comparing</p>
        <DButton
variant="primary" @click="navigateTo('/search')"> Browse Devices </DButton>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Device {
  name: string;
  [key: string]: any;
}

const comparisonSlots = ref<Array<{ device: Device | null }>>([
  { device: null },
  { device: null },
  { device: null },
  { device: null },
]);

const availableDevices = ref<Device[]>([]);

const defaultSpecs = [
  { key: 'price', label: 'Price' },
  { key: 'ram', label: 'RAM' },
  { key: 'battery', label: 'Battery' },
  { key: 'screen_size', label: 'Screen Size' },
  { key: 'company', label: 'Brand' },
];

const hasComparisons = computed(() => {
  return comparisonSlots.value.some((slot) => slot.device !== null);
});

const handleDeviceSelect = (device: any, index: number) => {
  if (index >= 0 && index < comparisonSlots.value.length) {
    comparisonSlots.value[index]!.device = device;
    emit('device-change', comparisonSlots.value);
  }
};

const removeDevice = (index: number) => {
  if (index >= 0 && index < comparisonSlots.value.length) {
    comparisonSlots.value[index]!.device = null;
    emit('device-change', comparisonSlots.value);
  }
};

const exportComparison = () => {
  // Emit export event
  emit('export');
};

const emit = defineEmits<{
  'device-change': [slots: typeof comparisonSlots.value];
  export: [];
}>();

// Load available devices (you can fetch from API)
onMounted(async () => {
  try {
    const response = await $fetch<{
      products: Array<{
        id: number;
        company: string;
        model: string;
        weight: string;
        ram: string;
        front_camera: string;
        back_camera: string;
        processor: string;
        battery: string;
        screen_size: string;
        price_pakistan: number | null;
        price_india: number | null;
        price_china: number | null;
        price_usa: number | null;
        price_dubai: number | null;
        launched_year: number;
        image_url: string;
        created_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>('/api/products', { params: { limit: 100 } });
    availableDevices.value = (response.products || []).map((product: any) => ({
      ...product,
      name: `${product.company} ${product.model}`,
    }));
  } catch (error) {
    console.error('Failed to load devices:', error);
  }
});

defineExpose({
  comparisonSlots,
  availableDevices,
});
</script>
