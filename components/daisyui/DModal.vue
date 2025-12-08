<!-- components/daisyui/DModal.vue -->
<template>
  <dialog :class="{ 'modal-open': modelValue }" class="modal">
    <div :class="['modal-box', sizeClass]">
      <form method="dialog">
        <button
          v-if="closable"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="close"
        >
          ✕
        </button>
      </form>
      <h3 v-if="title" class="font-bold text-lg mb-4">
        {{ title }}
      </h3>
      <slot />
      <div v-if="$slots.footer || showActions" class="modal-action">
        <slot name="footer">
          <DButton variant="ghost" @click="close"> Cancel </DButton>
          <DButton variant="primary" @click="confirm"> Confirm </DButton>
        </slot>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="close">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  showActions: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const sizeClass = computed(() => {
  const sizes = {
    xs: 'w-11/12 max-w-xs',
    sm: 'w-11/12 max-w-sm',
    md: 'w-11/12 max-w-md',
    lg: 'w-11/12 max-w-lg',
    xl: 'w-11/12 max-w-5xl',
    full: 'w-11/12 max-w-full',
  };
  return sizes[props.size];
});

const close = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  emit('confirm');
  close();
};
</script>
