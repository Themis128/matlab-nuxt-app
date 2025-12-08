# DaisyUI Quick Reference

Quick reference guide for common DaisyUI components and patterns.

## Table of Contents

- [Buttons](#buttons)
- [Inputs](#inputs)
- [Forms](#forms)
- [Cards](#cards)
- [Modals](#modals)
- [Tables](#tables)
- [Navigation](#navigation)
- [Alerts](#alerts)
- [Badges](#badges)
- [Loading States](#loading-states)
- [Themes](#themes)

---

## Buttons

### Basic Button

```vue
<button class="btn">Button</button>
```

### Button Variants

```vue
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-link">Link</button>
```

### Button Sizes

```vue
<button class="btn btn-xs">Extra Small</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium</button>
<button class="btn btn-lg">Large</button>
```

### Button States

```vue
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-primary loading">Loading</button>
<button class="btn btn-primary btn-active">Active</button>
```

### Button with Icon

```vue
<button class="btn btn-primary">
  <Icon name="heroicons:plus" class="w-5 h-5" />
  Add Item
</button>
```

---

## Inputs

### Text Input

```vue
<input type="text" placeholder="Type here" class="input input-bordered w-full" />
```

### Input Variants

```vue
<input class="input input-bordered" />
<input class="input input-ghost" />
<input class="input input-primary" />
<input class="input input-secondary" />
<input class="input input-accent" />
<input class="input input-info" />
<input class="input input-success" />
<input class="input input-warning" />
<input class="input input-error" />
```

### Input Sizes

```vue
<input class="input input-xs" />
<input class="input input-sm" />
<input class="input input-md" />
<input class="input input-lg" />
```

### Input with Label

```vue
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" class="input input-bordered w-full" />
</div>
```

### Input with Helper Text

```vue
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Password</span>
  </label>
  <input type="password" class="input input-bordered w-full" />
  <label class="label">
    <span class="label-text-alt">Must be at least 8 characters</span>
  </label>
</div>
```

### Input with Error

```vue
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" class="input input-bordered input-error w-full" />
  <label class="label">
    <span class="label-text-alt text-error">Please enter a valid email</span>
  </label>
</div>
```

---

## Forms

### Complete Form Example

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Name</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        class="input input-bordered w-full"
        required
      />
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        v-model="form.email"
        type="email"
        class="input input-bordered w-full"
        required
      />
    </div>

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

    <button type="submit" class="btn btn-primary w-full">
      Submit
    </button>
  </form>
</template>
```

### Select Dropdown

```vue
<select class="select select-bordered w-full">
  <option disabled selected>Choose option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Textarea

```vue
<textarea
  class="textarea textarea-bordered w-full"
  placeholder="Enter message"
></textarea>
```

### Checkbox

```vue
<input type="checkbox" class="checkbox checkbox-primary" />
```

### Radio Buttons

```vue
<input type="radio" name="radio-1" class="radio radio-primary" checked />
<input type="radio" name="radio-1" class="radio radio-primary" />
```

### Toggle Switch

```vue
<input type="checkbox" class="toggle toggle-primary" />
```

### Range Slider

```vue
<input type="range" min="0" max="100" class="range range-primary" />
```

---

## Cards

### Basic Card

```vue
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content goes here</p>
  </div>
</div>
```

### Card with Image

```vue
<div class="card bg-base-100 shadow-xl">
  <figure>
    <img src="/image.jpg" alt="Image" />
  </figure>
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div>
  </div>
</div>
```

### Card with Header and Footer

```vue
<div class="card bg-base-100 shadow-xl">
  <div class="card-header">
    <h2 class="card-title">Card Title</h2>
  </div>
  <div class="card-body">
    <p>Card content</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

---

## Modals

### Basic Modal

```vue
<template>
  <dialog :class="{ 'modal-open': showModal }" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Hello!</h3>
      <p class="py-4">Press ESC key or click outside to close</p>
      <div class="modal-action">
        <button class="btn" @click="showModal = false">Close</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="showModal = false">
      <button>close</button>
    </form>
  </dialog>
</template>
```

### Modal Sizes

```vue
<!-- Small -->
<div class="modal-box w-11/12 max-w-xs">...</div>

<!-- Medium (default) -->
<div class="modal-box">...</div>

<!-- Large -->
<div class="modal-box w-11/12 max-w-5xl">...</div>
```

---

## Tables

### Basic Table

```vue
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="user in users" :key="user.id">
      <td>{{ user.name }}</td>
      <td>{{ user.email }}</td>
      <td>{{ user.role }}</td>
    </tr>
  </tbody>
</table>
```

### Table Variants

```vue
<!-- Zebra stripes -->
<table class="table table-zebra">...</table>

<!-- With borders -->
<table class="table table-bordered">...</table>

<!-- Hover effect -->
<table class="table table-hover">...</table>
```

### Responsive Table

```vue
<div class="overflow-x-auto">
  <table class="table">
    <!-- Table content -->
  </table>
</div>
```

---

## Navigation

### Navbar

```vue
<div class="navbar bg-base-100">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">Logo</a>
  </div>
  <div class="navbar-center">
    <a class="btn btn-ghost">Home</a>
    <a class="btn btn-ghost">About</a>
    <a class="btn btn-ghost">Contact</a>
  </div>
  <div class="navbar-end">
    <button class="btn btn-primary">Get Started</button>
  </div>
</div>
```

### Dropdown Menu

```vue
<div class="dropdown dropdown-end">
  <div tabindex="0" role="button" class="btn btn-ghost">
    Menu
    <Icon name="heroicons:chevron-down" class="w-4 h-4" />
  </div>
  <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
  </ul>
</div>
```

### Breadcrumbs

```vue
<div class="breadcrumbs">
  <ul>
    <li><a>Home</a></li>
    <li><a>Category</a></li>
    <li>Current Page</li>
  </ul>
</div>
```

---

## Alerts

### Basic Alert

```vue
<div class="alert">
  <Icon name="heroicons:information-circle" class="w-6 h-6" />
  <span>New message arrived.</span>
</div>
```

### Alert Variants

```vue
<div class="alert alert-info">Info message</div>
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-error">Error message</div>
```

### Alert with Actions

```vue
<div class="alert alert-info">
  <span>New software update available.</span>
  <div>
    <button class="btn btn-sm btn-ghost">Dismiss</button>
    <button class="btn btn-sm">Update</button>
  </div>
</div>
```

---

## Badges

### Basic Badge

```vue
<div class="badge">Badge</div>
```

### Badge Variants

```vue
<div class="badge badge-primary">Primary</div>
<div class="badge badge-secondary">Secondary</div>
<div class="badge badge-accent">Accent</div>
<div class="badge badge-ghost">Ghost</div>
```

### Badge Sizes

```vue
<div class="badge badge-lg">Large</div>
<div class="badge badge-md">Medium</div>
<div class="badge badge-sm">Small</div>
<div class="badge badge-xs">Extra Small</div>
```

### Badge with Icon

```vue
<div class="badge badge-primary gap-2">
  <Icon name="heroicons:bell" class="w-4 h-4" />
  Notifications
</div>
```

---

## Loading States

### Loading Button

```vue
<button class="btn btn-primary loading">Loading</button>
```

### Loading Spinner

```vue
<span class="loading loading-spinner loading-md"></span>
```

### Loading Sizes

```vue
<span class="loading loading-spinner loading-xs"></span>
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-spinner loading-md"></span>
<span class="loading loading-spinner loading-lg"></span>
```

### Skeleton Loading

```vue
<div class="skeleton h-4 w-full"></div>
<div class="skeleton h-4 w-5/6"></div>
<div class="skeleton h-4 w-4/6"></div>
```

---

## Themes

### Apply Theme

```vue
<div data-theme="light">
  <!-- Light theme content -->
</div>

<div data-theme="dark">
  <!-- Dark theme content -->
</div>
```

### Theme Toggle

```vue
<template>
  <label class="swap swap-rotate">
    <input
      type="checkbox"
      :checked="isDark"
      @change="toggleTheme"
    />
    <Icon name="heroicons:sun" class="swap-on w-6 h-6" />
    <Icon name="heroicons:moon" class="swap-off w-6 h-6" />
  </label>
</template>

<script setup>
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
```

### Custom Theme Colors

Use your configured theme colors:

```vue
<!-- Primary color -->
<div class="bg-primary text-primary-content">Primary</div>

<!-- Secondary color -->
<div class="bg-secondary text-secondary-content">Secondary</div>

<!-- Accent color -->
<div class="bg-accent text-accent-content">Accent</div>

<!-- Base colors -->
<div class="bg-base-100">Base 100</div>
<div class="bg-base-200">Base 200</div>
<div class="bg-base-300">Base 300</div>
```

---

## Utility Classes

### Spacing

```vue
<div class="space-y-4">Vertical spacing</div>
<div class="space-x-4">Horizontal spacing</div>
```

### Flexbox

```vue
<div class="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Grid

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Grid items -->
</div>
```

### Shadows

```vue
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

---

## Common Patterns

### Card Grid

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div v-for="item in items" :key="item.id" class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ item.title }}</h2>
      <p>{{ item.description }}</p>
    </div>
  </div>
</div>
```

### Form with Validation

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        v-model="email"
        type="email"
        :class="['input input-bordered w-full', { 'input-error': emailError }]"
      />
      <label v-if="emailError" class="label">
        <span class="label-text-alt text-error">{{ emailError }}</span>
      </label>
    </div>
    <button type="submit" class="btn btn-primary w-full">Submit</button>
  </form>
</template>
```

### Toast Container

```vue
<template>
  <div class="toast toast-top toast-end">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="`alert alert-${toast.type}`"
    >
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>
```

---

**Quick Tips:**

- Always use `w-full` for full-width inputs/buttons
- Use `form-control` wrapper for form inputs
- Use `card` classes for card layouts
- Use `modal` for dialogs
- Use `table` classes for data tables
- Use theme colors: `primary`, `secondary`, `accent`, `base-100`, etc.
