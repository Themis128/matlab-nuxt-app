# DaisyUI Migration Guide

Complete guide for migrating your Nuxt 4 app from PrimeVue and Nuxt UI to DaisyUI.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Configuration](#installation--configuration)
4. [Component Migration](#component-migration)
5. [Theme Configuration](#theme-configuration)
6. [Step-by-Step Migration Process](#step-by-step-migration-process)
7. [Component Mapping Reference](#component-mapping-reference)
8. [Common Patterns](#common-patterns)
9. [Testing Checklist](#testing-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you migrate from:
- **PrimeVue** (DataTable, Button, Input, etc.)
- **Nuxt UI** (UCard, UButton, UInput, etc.)

To **DaisyUI** - a component library built on Tailwind CSS that provides semantic, accessible components.

### Benefits of DaisyUI

- ✅ **Smaller bundle size** - No JavaScript framework dependencies
- ✅ **Better performance** - Pure CSS components
- ✅ **Full Tailwind integration** - Use all Tailwind utilities
- ✅ **Theme system** - Built-in dark mode and theme switching
- ✅ **Accessibility** - ARIA attributes included by default
- ✅ **Customizable** - Easy to theme and customize

---

## Prerequisites

- ✅ DaisyUI is already installed (`daisyui: ^5.5.8`)
- ✅ Tailwind CSS is configured
- ✅ Nuxt 4 project structure

---

## Installation & Configuration

### 1. Verify DaisyUI Installation

```bash
npm list daisyui
```

If not installed:
```bash
npm install -D daisyui
```

### 2. Update Tailwind Configuration

Your `tailwind.config.js` is already configured with DaisyUI. Verify it includes:

```js
// tailwind.config.js
export default {
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light', 'dark'], // or your custom themes
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  },
}
```

### 3. Remove PrimeVue Dependencies (After Migration)

Once migration is complete, you can remove:

```bash
npm uninstall primevue primeicons
```

And remove the PrimeVue plugin:
- Delete `plugins/primevue.client.ts`
- Remove PrimeVue CSS imports from `nuxt.config.ts`

### 4. Optional: Remove Nuxt UI (After Migration)

If you're fully migrating to DaisyUI:

```bash
npm uninstall @nuxt/ui
```

Remove from `nuxt.config.ts`:
```ts
modules: [
  // '@nuxt/ui', // Remove this
  // ... other modules
]
```

---

## Component Migration

### PrimeVue → DaisyUI Mapping

| PrimeVue Component | DaisyUI Equivalent | Notes |
|-------------------|-------------------|-------|
| `DataTable` | `table` + custom logic | Use HTML table with DaisyUI classes |
| `Button` | `button.btn` | Direct replacement |
| `InputText` | `input.input` | Direct replacement |
| `Dropdown` | `select.select` | Use native select or custom dropdown |
| `MultiSelect` | Custom component | Use checkbox group or custom solution |
| `Calendar` | `input.input[type="date"]` | Or use date picker library |
| `Checkbox` | `input.checkbox` | Direct replacement |
| `RadioButton` | `input.radio` | Direct replacement |
| `Toast` | `div.toast` | Use DaisyUI toast container |
| `Dialog` | `dialog.modal` | Direct replacement |
| `Card` | `div.card` | Direct replacement |
| `Paginator` | Custom pagination | Use DaisyUI pagination classes |

### Nuxt UI → DaisyUI Mapping

| Nuxt UI Component | DaisyUI Equivalent | Notes |
|-----------------|-------------------|-------|
| `UCard` | `div.card` | Direct replacement |
| `UButton` | `button.btn` | Direct replacement |
| `UInput` | `input.input` | Direct replacement |
| `USelectMenu` | `select.select` | Direct replacement |
| `UCheckbox` | `input.checkbox` | Direct replacement |
| `URadio` | `input.radio` | Direct replacement |
| `UAlert` | `div.alert` | Direct replacement |
| `UBadge` | `div.badge` | Direct replacement |
| `UModal` | `dialog.modal` | Direct replacement |

---

## Theme Configuration

### Current Theme Setup

Your `tailwind.config.js` already has custom themes configured. Here's how to use them:

```vue
<!-- Apply theme to root element -->
<html data-theme="light">
  <!-- or -->
<html data-theme="dark">
```

### Theme Switching

DaisyUI themes work with `@nuxtjs/color-mode`:

```vue
<script setup>
const colorMode = useColorMode()

// Switch theme
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div :data-theme="colorMode.value">
    <!-- Your app content -->
  </div>
</template>
```

### Custom Theme Colors

Your themes are already configured. To customize further:

```js
// tailwind.config.js
daisyui: {
  themes: [
    {
      light: {
        primary: '#a855f7',    // Purple
        secondary: '#3b82f6',   // Blue
        accent: '#10b981',      // Green
        neutral: '#1f2937',
        'base-100': '#ffffff',
        // ... more colors
      },
      dark: {
        primary: '#c084fc',
        // ... dark theme colors
      },
    },
  ],
}
```

---

## Step-by-Step Migration Process

### Phase 1: Preparation

1. **Create a backup branch**
   ```bash
   git checkout -b backup-before-daisyui-migration
   git push origin backup-before-daisyui-migration
   ```

2. **Create migration branch**
   ```bash
   git checkout -b migrate-to-daisyui
   ```

3. **Document current components**
   - List all PrimeVue components in use
   - List all Nuxt UI components in use
   - Note any custom styling or behavior

### Phase 2: Create DaisyUI Component Wrappers

Create reusable components in `components/daisyui/`:

#### Button Component

```vue
<!-- components/daisyui/DButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  loading: false,
})

const buttonClasses = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      'btn-disabled': props.disabled,
      'loading': props.loading,
    },
  ]
})
</script>
```

#### Input Component

```vue
<!-- components/daisyui/DInput.vue -->
<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <label v-if="hint" class="label">
      <span class="label-text-alt">{{ hint }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  hint?: string
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputClasses = computed(() => [
  'input',
  'input-bordered',
  'w-full',
  {
    'input-error': props.error,
    'input-disabled': props.disabled,
  },
])
</script>
```

#### Card Component

```vue
<!-- components/daisyui/DCard.vue -->
<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h2 v-if="title" class="card-title">{{ title }}</h2>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  bordered?: boolean
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
})

const cardClasses = computed(() => [
  'card',
  {
    'card-bordered': props.bordered,
    'bg-base-100': true,
    'shadow-xl': true,
  },
])
</script>
```

### Phase 3: Migrate Components One by One

#### Example: Migrating PrimeDataTable

**Before (PrimeVue):**
```vue
<template>
  <DataTable :value="products" :paginator="true" :rows="10">
    <Column field="name" header="Name" />
    <Column field="price" header="Price" />
  </DataTable>
</template>
```

**After (DaisyUI):**
```vue
<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in paginatedProducts" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.price }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <div class="flex justify-center mt-4">
      <div class="join">
        <button
          v-for="page in totalPages"
          :key="page"
          class="join-item btn btn-sm"
          :class="{ 'btn-active': currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentPage = ref(1)
const rowsPerPage = 10

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return products.value.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(products.value.length / rowsPerPage)
})
</script>
```

### Phase 4: Update Global Components

1. **Replace PrimeVue plugin** - Remove `plugins/primevue.client.ts`
2. **Update layouts** - Replace PrimeVue components with DaisyUI
3. **Update pages** - Migrate page by page

### Phase 5: Update Styling

1. **Remove PrimeVue CSS** from `nuxt.config.ts`
2. **Update custom CSS** to use DaisyUI classes
3. **Test theme switching**

---

## Component Mapping Reference

### Buttons

**PrimeVue:**
```vue
<PrimeButton label="Click me" icon="pi pi-check" />
```

**DaisyUI:**
```vue
<button class="btn btn-primary">
  <Icon name="heroicons:check" class="w-5 h-5" />
  Click me
</button>
```

### Inputs

**PrimeVue:**
```vue
<InputText v-model="value" placeholder="Enter text" />
```

**DaisyUI:**
```vue
<input
  v-model="value"
  type="text"
  placeholder="Enter text"
  class="input input-bordered w-full"
/>
```

### Dropdowns

**PrimeVue:**
```vue
<Dropdown v-model="selected" :options="options" optionLabel="name" />
```

**DaisyUI:**
```vue
<select v-model="selected" class="select select-bordered w-full">
  <option disabled selected>Choose option</option>
  <option v-for="option in options" :key="option.value" :value="option.value">
    {{ option.name }}
  </option>
</select>
```

### Checkboxes

**PrimeVue:**
```vue
<Checkbox v-model="checked" />
```

**DaisyUI:**
```vue
<input
  v-model="checked"
  type="checkbox"
  class="checkbox checkbox-primary"
/>
```

### Radio Buttons

**PrimeVue:**
```vue
<RadioButton v-model="selected" value="option1" />
```

**DaisyUI:**
```vue
<input
  v-model="selected"
  type="radio"
  value="option1"
  class="radio radio-primary"
/>
```

### Modals/Dialogs

**PrimeVue:**
```vue
<Dialog v-model:visible="show" header="Title">
  Content
</Dialog>
```

**DaisyUI:**
```vue
<dialog :class="{ 'modal-open': show }" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Title</h3>
    <p>Content</p>
    <div class="modal-action">
      <button class="btn" @click="show = false">Close</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" @click="show = false">
    <button>close</button>
  </form>
</dialog>
```

### Toasts/Notifications

**PrimeVue:**
```vue
<Toast />
<!-- Then use: -->
$toast.add({ severity: 'success', summary: 'Success', detail: 'Message' })
```

**DaisyUI:**
```vue
<!-- In layout or app.vue -->
<div class="toast toast-top toast-end">
  <div
    v-for="toast in toasts"
    :key="toast.id"
    :class="`alert alert-${toast.type}`"
  >
    <span>{{ toast.message }}</span>
  </div>
</div>

<script setup>
const toasts = ref([])

const showToast = (message, type = 'info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}
</script>
```

### Data Tables

See the detailed example in [Step-by-Step Migration Process](#step-by-step-migration-process).

---

## Common Patterns

### Form with Validation

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        v-model="email"
        type="email"
        :class="['input input-bordered', { 'input-error': emailError }]"
        placeholder="email@example.com"
      />
      <label v-if="emailError" class="label">
        <span class="label-text-alt text-error">{{ emailError }}</span>
      </label>
    </div>

    <button type="submit" class="btn btn-primary w-full">
      Submit
    </button>
  </form>
</template>
```

### Loading States

```vue
<template>
  <button :class="['btn btn-primary', { loading: isLoading }]">
    {{ isLoading ? 'Loading...' : 'Submit' }}
  </button>
</template>
```

### Responsive Grid

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="item in items" :key="item.id" class="card bg-base-100 shadow-xl">
      <!-- Card content -->
    </div>
  </div>
</template>
```

### Dark Mode Toggle

```vue
<template>
  <label class="swap swap-rotate">
    <input
      type="checkbox"
      :checked="colorMode.value === 'dark'"
      @change="toggleTheme"
    />
    <Icon name="heroicons:sun" class="swap-on w-6 h-6" />
    <Icon name="heroicons:moon" class="swap-off w-6 h-6" />
  </label>
</template>

<script setup>
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
```

---

## Testing Checklist

### Component Testing

- [ ] All buttons work and have correct styling
- [ ] All inputs are functional and accessible
- [ ] Forms submit correctly
- [ ] Dropdowns/selects work properly
- [ ] Modals open and close correctly
- [ ] Toasts/notifications display
- [ ] Tables display data correctly
- [ ] Pagination works
- [ ] Checkboxes and radios function correctly

### Theme Testing

- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Theme switching works
- [ ] Theme persists across page reloads
- [ ] All components look good in both themes

### Responsive Testing

- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Navigation is responsive
- [ ] Tables are scrollable on mobile

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus states are visible
- [ ] ARIA labels are present
- [ ] Color contrast is sufficient

### Performance Testing

- [ ] Page load time is acceptable
- [ ] Bundle size is reduced
- [ ] No console errors
- [ ] No layout shifts

---

## Troubleshooting

### Theme Not Applying

**Problem:** DaisyUI theme not showing

**Solution:**
1. Ensure `data-theme` attribute is on root element
2. Check `tailwind.config.js` has DaisyUI plugin
3. Verify CSS is being imported

### Components Not Styled

**Problem:** DaisyUI classes not working

**Solution:**
1. Check Tailwind content paths include your files
2. Restart dev server after config changes
3. Clear `.nuxt` cache: `rm -rf .nuxt`

### Dark Mode Not Working

**Problem:** Dark mode toggle doesn't work

**Solution:**
1. Ensure `@nuxtjs/color-mode` is installed
2. Check `data-theme` is updating
3. Verify theme configuration in `tailwind.config.js`

### Bundle Size Increased

**Problem:** Bundle size is larger after migration

**Solution:**
1. Remove unused PrimeVue/Nuxt UI dependencies
2. Use tree-shaking
3. Check for duplicate CSS imports

### TypeScript Errors

**Problem:** Type errors with DaisyUI components

**Solution:**
1. Create TypeScript interfaces for custom components
2. Use `@ts-ignore` sparingly for DaisyUI classes
3. Add type definitions if needed

---

## Migration Timeline

### Recommended Approach

1. **Week 1:** Set up DaisyUI components and wrappers
2. **Week 2:** Migrate core components (buttons, inputs, cards)
3. **Week 3:** Migrate complex components (tables, modals)
4. **Week 4:** Testing and refinement
5. **Week 5:** Remove old dependencies and cleanup

### Incremental Migration

You can migrate incrementally:
- Keep PrimeVue/Nuxt UI for complex components initially
- Migrate simple components first
- Gradually replace as you build confidence

---

## Additional Resources

- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Components](https://daisyui.com/components/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Nuxt 4 Documentation](https://nuxt.com/)

---

## Support

If you encounter issues during migration:

1. Check DaisyUI documentation
2. Review Tailwind CSS configuration
3. Check Nuxt 4 compatibility
4. Review component examples in this guide

---

**Last Updated:** December 2024
**Version:** 1.0.0
