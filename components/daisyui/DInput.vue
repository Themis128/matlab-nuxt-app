<!-- components/daisyui/DInput.vue -->
<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    <div v-if="icon" class="relative">
      <Icon
        :name="icon"
        class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40"
      />
      <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :class="[inputClasses, 'pl-10']"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <input
      v-else
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <label v-if="hint || error" class="label">
      <span :class="['label-text-alt', { 'text-error': error }]">{{ error || hint }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  error?: string | boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  size: 'md',
});

defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputClasses = computed(() => [
  'input',
  'input-bordered',
  `input-${props.size}`,
  'w-full',
  {
    'input-error': props.error,
    'input-disabled': props.disabled,
  },
]);
</script>
