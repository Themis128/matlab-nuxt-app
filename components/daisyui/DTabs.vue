<!-- components/daisyui/DTabs.vue -->
<template>
  <div>
    <div class="tabs tabs-boxed mb-4" :class="tabsClass">
      <button
        v-for="(item, index) in items"
        :key="item.key || index"
        :class="[
          'tab',
          {
            'tab-active':
              currentValue === (item.key || item.slot || item.label?.toLowerCase() || index),
          },
        ]"
        @click="handleTabClick(item, index)"
      >
        <Icon v-if="item.icon" :name="item.icon" class="mr-2 h-4 w-4" />
        {{ item.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key?: string;
  label: string;
  icon?: string;
  slot?: string;
}

interface Props {
  modelValue: string | number;
  items: TabItem[];
  variant?: 'boxed' | 'bordered' | 'lifted';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'boxed',
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const currentValue = computed(() => props.modelValue);

const tabsClass = computed(() => {
  return [
    {
      'tabs-boxed': props.variant === 'boxed',
      'tabs-bordered': props.variant === 'bordered',
      'tabs-lifted': props.variant === 'lifted',
    },
  ];
});

const handleTabClick = (item: TabItem, index: number) => {
  const value = item.key || item.slot || item.label?.toLowerCase() || index;
  emit('update:modelValue', value);
};
</script>
