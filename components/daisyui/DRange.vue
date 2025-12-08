<!-- components/daisyui/DRange.vue -->
<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :class="rangeClasses"
      :disabled="disabled"
      @input="handleInput"
    />
    <label v-if="hint || showValues" class="label">
      <span class="label-text-alt">{{ hint || `${min} - ${max}` }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number | number[];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  showValues?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValues: false,
  color: 'primary',
});

const emit = defineEmits<{
  'update:modelValue': [value: number | number[]];
}>();

const rangeClasses = computed(() => [
  'range',
  `range-${props.color}`,
  {
    'range-disabled': props.disabled,
  },
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>
