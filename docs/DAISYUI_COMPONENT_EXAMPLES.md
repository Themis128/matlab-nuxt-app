# DaisyUI Component Examples

Ready-to-use component examples for your migration.

## Table of Contents

- [Reusable Components](#reusable-components)
- [Form Components](#form-components)
- [Data Display](#data-display)
- [Navigation](#navigation)
- [Feedback](#feedback)
- [Layout](#layout)

---

## Reusable Components

### Button Component

```vue
<!-- components/daisyui/DButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
    <Icon v-if="icon && !loading" :name="icon" class="w-5 h-5" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-disabled': props.disabled,
    'w-full': props.fullWidth,
  },
])
</script>
```

**Usage:**
```vue
<DButton variant="primary" icon="heroicons:plus">Add Item</DButton>
<DButton variant="ghost" size="sm" :loading="isLoading">Submit</DButton>
```

---

### Input Component

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
      :required="required"
      :class="inputClasses"
      @input="handleInput"
      @blur="$emit('blur', $event)"
    />
    <label v-if="hint || error" class="label">
      <span :class="['label-text-alt', { 'text-error': error }]">
        {{ error || hint }}
      </span>
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
  error?: string
  variant?: 'bordered' | 'ghost' | 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  variant: 'bordered',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
}>()

const inputClasses = computed(() => [
  'input',
  `input-${props.variant}`,
  'w-full',
  {
    'input-error': !!props.error,
    'input-disabled': props.disabled,
  },
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
```

**Usage:**
```vue
<DInput
  v-model="email"
  label="Email"
  type="email"
  placeholder="email@example.com"
  required
  :error="emailError"
/>
```

---

### Card Component

```vue
<!-- components/daisyui/DCard.vue -->
<template>
  <div :class="cardClasses">
    <figure v-if="image" class="px-6 pt-6">
      <img :src="image" :alt="imageAlt" class="rounded-xl" />
    </figure>
    <div v-if="$slots.header || title" class="card-header px-6 pt-6">
      <slot name="header">
        <h2 v-if="title" class="card-title">{{ title }}</h2>
        <p v-if="subtitle" class="text-base-content/60">{{ subtitle }}</p>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer || actions" class="card-footer px-6 pb-6">
      <slot name="footer">
        <div v-if="actions" class="flex gap-2">
          <DButton
            v-for="action in actions"
            :key="action.label"
            :variant="action.variant || 'primary'"
            :size="action.size || 'sm'"
            @click="action.onClick"
          >
            {{ action.label }}
          </DButton>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CardAction {
  label: string
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onClick: () => void
}

interface Props {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  bordered?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  actions?: CardAction[]
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  shadow: 'xl',
})

const cardClasses = computed(() => [
  'card',
  'bg-base-100',
  {
    'card-bordered': props.bordered,
    [`shadow-${props.shadow}`]: props.shadow,
  },
])
</script>
```

**Usage:**
```vue
<DCard
  title="Card Title"
  subtitle="Card subtitle"
  image="/image.jpg"
  :actions="[
    { label: 'Cancel', variant: 'ghost', onClick: () => {} },
    { label: 'Save', variant: 'primary', onClick: () => {} },
  ]"
>
  Card content here
</DCard>
```

---

### Modal Component

```vue
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
      <h3 v-if="title" class="font-bold text-lg mb-4">{{ title }}</h3>
      <slot />
      <div v-if="$slots.footer || showActions" class="modal-action">
        <slot name="footer">
          <DButton variant="ghost" @click="close">Cancel</DButton>
          <DButton variant="primary" @click="confirm">Confirm</DButton>
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
  modelValue: boolean
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  showActions: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const sizeClass = computed(() => {
  const sizes = {
    xs: 'w-11/12 max-w-xs',
    sm: 'w-11/12 max-w-sm',
    md: 'w-11/12 max-w-md',
    lg: 'w-11/12 max-w-lg',
    xl: 'w-11/12 max-w-5xl',
    full: 'w-11/12 max-w-full',
  }
  return sizes[props.size]
})

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>
```

**Usage:**
```vue
<DModal v-model="showModal" title="Confirm Action" size="md">
  <p>Are you sure you want to proceed?</p>
  <template #footer>
    <DButton variant="ghost" @click="showModal = false">Cancel</DButton>
    <DButton variant="primary" @click="handleConfirm">Confirm</DButton>
  </template>
</DModal>
```

---

## Form Components

### Form with Validation

```vue
<!-- components/forms/ValidatedForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <DInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="email@example.com"
      required
      :error="errors.email"
      hint="We'll never share your email"
    />

    <DInput
      v-model="form.password"
      label="Password"
      type="password"
      placeholder="Enter password"
      required
      :error="errors.password"
    />

    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Remember me</span>
        <input
          v-model="form.remember"
          type="checkbox"
          class="checkbox checkbox-primary"
        />
      </label>
    </div>

    <DButton
      type="submit"
      variant="primary"
      :loading="isSubmitting"
      full-width
    >
      Submit
    </DButton>
  </form>
</template>

<script setup lang="ts">
const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)

const validate = () => {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    // Submit form
    await submitForm(form)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

---

### Select Dropdown

```vue
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
      :required="required"
      :class="selectClasses"
      @change="handleChange"
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
      <span :class="['label-text-alt', { 'text-error': error }]">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  options: Array<{ label: string; value: string | number }> | string[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  hint?: string
  error?: string
  variant?: 'bordered' | 'ghost' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'bordered',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectClasses = computed(() => [
  'select',
  `select-${props.variant}`,
  'w-full',
  {
    'select-error': !!props.error,
    'select-disabled': props.disabled,
  },
])

const getOptionValue = (option: any) => {
  return typeof option === 'string' ? option : option.value
}

const getOptionLabel = (option: any) => {
  return typeof option === 'string' ? option : option.label
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
```

---

## Data Display

### Data Table

```vue
<!-- components/daisyui/DTable.vue -->
<template>
  <div class="overflow-x-auto">
    <table :class="tableClasses">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="{ 'cursor-pointer': sortable }"
            @click="sortable && handleSort(column.key)"
          >
            <div class="flex items-center gap-2">
              {{ column.label }}
              <Icon
                v-if="sortable && sortKey === column.key"
                :name="sortOrder === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in paginatedData" :key="getRowKey(row, index)">
          <td v-for="column in columns" :key="column.key">
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="paginated" class="flex justify-center mt-4">
      <div class="join">
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          «
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="join-item btn btn-sm"
          :class="{ 'btn-active': currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
}

interface Props {
  data: Record<string, any>[]
  columns: Column[]
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  variant?: 'default' | 'zebra' | 'bordered' | 'hover'
  rowKey?: string | ((row: any) => string | number)
}

const props = withDefaults(defineProps<Props>(), {
  sortable: false,
  paginated: false,
  pageSize: 10,
  variant: 'default',
  rowKey: 'id',
})

const currentPage = ref(1)
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const tableClasses = computed(() => [
  'table',
  {
    'table-zebra': props.variant === 'zebra',
    'table-bordered': props.variant === 'bordered',
    'table-hover': props.variant === 'hover',
  },
])

const sortedData = computed(() => {
  if (!props.sortable || !sortKey.value) return props.data

  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value

  const start = (currentPage.value - 1) * props.pageSize
  return sortedData.value.slice(start, start + props.pageSize)
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / props.pageSize)
})

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const getRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] ?? index
}
</script>
```

**Usage:**
```vue
<DTable
  :data="products"
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
  ]"
  sortable
  paginated
  :page-size="10"
  variant="zebra"
>
  <template #cell-price="{ value }">
    ${{ value.toFixed(2) }}
  </template>
</DTable>
```

---

## Navigation

### Navbar

```vue
<!-- components/navigation/DNavbar.vue -->
<template>
  <div class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <Icon name="heroicons:bars-3" class="w-5 h-5" />
        </div>
        <ul
          class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li v-for="item in menuItems" :key="item.path">
            <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </div>
      <NuxtLink to="/" class="btn btn-ghost text-xl">
        {{ logoText }}
      </NuxtLink>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li v-for="item in menuItems" :key="item.path">
          <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <slot name="actions">
        <DButton variant="primary">Get Started</DButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  path: string
  label: string
}

interface Props {
  logoText?: string
  menuItems?: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  logoText: 'Logo',
  menuItems: () => [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ],
})
</script>
```

---

## Feedback

### Toast System

```vue
<!-- composables/useToast.ts -->
export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration = 3000
  ) => {
    const id = Date.now()
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  return {
    toasts: readonly(toasts),
    showToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
  }
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}
```

```vue
<!-- components/daisyui/DToastContainer.vue -->
<template>
  <div class="toast toast-top toast-end z-50">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="`alert alert-${toast.type}`"
    >
      <Icon :name="getIcon(toast.type)" class="w-5 h-5" />
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
const { toasts } = useToast()

const getIcon = (type: string) => {
  const icons = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    info: 'heroicons:information-circle',
    warning: 'heroicons:exclamation-triangle',
  }
  return icons[type] || icons.info
}
</script>
```

**Usage:**
```vue
<script setup>
const { success, error } = useToast()

const handleSave = async () => {
  try {
    await saveData()
    success('Data saved successfully!')
  } catch (err) {
    error('Failed to save data')
  }
}
</script>
```

---

## Layout

### Page Container

```vue
<!-- components/layout/PageContainer.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="title || $slots.header" class="mb-6">
      <slot name="header">
        <h1 v-if="title" class="text-3xl font-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-base-content/60 mt-2">{{ subtitle }}</p>
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>
```

---

These examples provide a solid foundation for your DaisyUI migration. Customize them to fit your specific needs!
