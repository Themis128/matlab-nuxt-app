<!-- components/daisyui/DSelect.vue -->
<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="selectClasses"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" disabled :selected="!modelValue">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    <label v-if="hint || error" class="label">
      <span :class="['label-text-alt', { 'text-error': error }]">{{ error || hint }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number | null;
  options: any[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  error?: string | boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  optionLabel?: string | ((option: any) => string);
  optionValue?: string | ((option: any) => string | number);
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  size: 'md',
  optionLabel: 'label',
  optionValue: 'value',
});

defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

const selectClasses = computed(() => [
  'select',
  'select-bordered',
  `select-${props.size}`,
  'w-full',
  {
    'select-error': props.error,
    'select-disabled': props.disabled,
  },
]);

const getOptionLabel = (option: any): string => {
  if (typeof props.optionLabel === 'function') {
    return props.optionLabel(option);
  }
  return option[props.optionLabel] || String(option);
};

const getOptionValue = (option: any): string | number => {
  if (typeof props.optionValue === 'function') {
    return props.optionValue(option);
  }
  return option[props.optionValue] ?? option;
};
</script>
