/**
 * Nuxt UI component stubs for Vitest
 * Centralized stubs for Nuxt UI components used in tests
 */

import type { Component } from 'vue';

/**
 * UIcon stub - Simple icon component
 */
export const UIconStub: Component = {
  name: 'UIcon',
  template: '<i data-testid="uicon" :class="name" />',
  props: ['name', 'class'],
};

/**
 * USelectMenu stub - Dropdown/select menu component
 * Supports slots and v-model
 */
export const USelectMenuStub: Component = {
  name: 'USelectMenu',
  template: `
    <div data-testid="uselect-menu">
      <slot name="label" />
      <div v-for="(option, index) in (options || [])" :key="index">
        <slot name="option" :option="option || { label: '', nativeName: '', code: '' }" />
      </div>
    </div>
  `,
  props: [
    'modelValue',
    'options',
    'optionAttribute',
    'valueAttribute',
    'loading',
    'disabled',
    'placeholder',
  ],
  emits: ['update:modelValue', 'change'],
};

/**
 * NuxtImg stub - Optimized image component
 * Supports lazy loading and responsive images
 */
export const NuxtImgStub: Component = {
  name: 'NuxtImg',
  template: '<img :src="src" :alt="alt" :loading="loading" data-testid="nuxt-img" />',
  props: [
    'src',
    'alt',
    'width',
    'height',
    'loading',
    'placeholder',
    'format',
    'quality',
    'sizes',
    'srcset',
  ],
};

/**
 * NuxtLink stub - Router link component
 */
export const NuxtLinkStub: Component = {
  name: 'NuxtLink',
  template: '<a :href="to" data-testid="nuxt-link"><slot /></a>',
  props: ['to', 'href', 'target', 'rel'],
};

/**
 * UButton stub - Button component
 */
export const UButtonStub: Component = {
  name: 'UButton',
  template: '<button data-testid="u-button" :disabled="disabled"><slot /></button>',
  props: ['disabled', 'loading', 'color', 'variant', 'size'],
  emits: ['click'],
};

/**
 * UInput stub - Input component
 */
export const UInputStub: Component = {
  name: 'UInput',
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" data-testid="u-input" />',
  props: ['modelValue', 'placeholder', 'type', 'disabled', 'readonly'],
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
};

/**
 * UCard stub - Card component
 */
export const UCardStub: Component = {
  name: 'UCard',
  template: '<div data-testid="u-card" class="card"><slot /></div>',
  props: ['title', 'description'],
};

/**
 * UModal stub - Modal component
 */
export const UModalStub: Component = {
  name: 'UModal',
  template: `
    <div v-if="modelValue" data-testid="u-modal" class="modal">
      <slot />
    </div>
  `,
  props: ['modelValue', 'title', 'description'],
  emits: ['update:modelValue', 'close'],
};

/**
 * Get all Nuxt UI stubs as an object for use in test global stubs
 */
export const getNuxtUIStubs = () => ({
  UIcon: UIconStub,
  USelectMenu: USelectMenuStub,
  NuxtImg: NuxtImgStub,
  NuxtLink: NuxtLinkStub,
  UButton: UButtonStub,
  UInput: UInputStub,
  UCard: UCardStub,
  UModal: UModalStub,
});

/**
 * Get stubs for mount options (Vue Test Utils format)
 */
export const getMountStubs = () => getNuxtUIStubs();
