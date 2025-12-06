# Recommended Nuxt 4 Modules & Components for Your Mobile Dataset Analytics App

## ✅ Currently Installed

- `@nuxt/ui` - UI component library (110+ components)
- `@pinia/nuxt` - State management

---

## 🎯 Highly Recommended for Your App

### 1. **@nuxt/image** ⭐

**Why**: Optimize images for mobile dataset visualizations

```bash
npx nuxi@latest module add @nuxt/image
```

**Use Cases**:

- Optimize mobile phone images in your dataset
- Lazy load charts and visualizations
- Responsive images for different screen sizes

**Example**:

```vue
<NuxtImg src="/mobile-phones/iphone-15.jpg" width="300" height="400" loading="lazy" />
```

---

### 2. **@nuxt/icon** ⭐

**Why**: Access 200,000+ icons (you're already using UIcon, but this gives more options)

```bash
npx nuxi@latest module add @nuxt/icon
```

**Use Cases**:

- More icon options for mobile brands
- Chart icons, analytics icons
- Status indicators

**Example**:

```vue
<UIcon name="i-logos-apple" />
<UIcon name="i-logos-samsung" />
```

---

### 3. **@formkit/auto-animate** ⭐

**Why**: Smooth animations for data updates and transitions

```bash
npx nuxi@latest module add @formkit/auto-animate
```

**Use Cases**:

- Animate dataset statistics updates
- Smooth transitions when filtering data
- Chart animations

**Example**:

```vue
<div v-auto-animate>
  <UCard v-for="model in models" :key="model.id">
    {{ model.name }}
  </UCard>
</div>
```

---

### 4. **dayjs**

**Why**: Format dates for mobile phone release years

```bash
npx nuxi@latest module add dayjs
```

**Use Cases**:

- Format year ranges in dataset
- Display release dates
- Calculate time differences

**Example**:

```vue
<script setup>
import dayjs from 'dayjs';
const formattedYear = dayjs().year(2024).format('YYYY');
</script>
```

---

### 5. **@nuxt/scripts**

**Why**: Add analytics scripts efficiently

```bash
npx nuxi@latest module add @nuxt/scripts
```

**Use Cases**:

- Google Analytics
- Performance monitoring
- Third-party tracking scripts

**Example**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  scripts: {
    register: [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=GA_ID',
        async: true,
      },
    ],
  },
});
```

---

## 📊 Useful for Data Visualization

### 6. **marquee**

**Why**: Scrolling announcements for dataset updates

```bash
npx nuxi@latest module add marquee
```

**Use Cases**:

- Announce new dataset additions
- Show trending mobile models
- Display statistics

---

### 7. **web-vitals**

**Why**: Monitor performance of your analytics dashboard

```bash
npx nuxi@latest module add web-vitals
```

**Use Cases**:

- Track Core Web Vitals
- Monitor dashboard performance
- Optimize loading times

---

## 🎨 UI Enhancements

### 8. **reka-ui** (Already included with @nuxt/ui)

**Why**: Foundation for Nuxt UI components
**Status**: Already available through @nuxt/ui

---

## 🔍 SEO & Sharing

### 9. **og-image**

**Why**: Generate Open Graph images for sharing dataset insights

```bash
npx nuxi@latest module add og-image
```

**Use Cases**:

- Share dataset statistics on social media
- Generate preview images for blog posts
- Create visual summaries

---

### 10. **schema-org**

**Why**: Structured data for better SEO

```bash
npx nuxi@latest module add schema-org
```

**Use Cases**:

- Markup dataset information
- Improve search engine visibility
- Rich snippets in search results

---

## 🛠️ Development Tools

### 11. **@nuxt/devtools** (Already enabled)

**Why**: Visual debugging tools
**Status**: Already enabled in your config

---

## 📝 Installation Commands

### Quick Install (All Recommended)

```bash
# High Priority
npx nuxi@latest module add @nuxt/image
npx nuxi@latest module add @nuxt/icon
npx nuxi@latest module add @formkit/auto-animate
npx nuxi@latest module add dayjs
npx nuxi@latest module add @nuxt/scripts

# Medium Priority
npx nuxi@latest module add marquee
npx nuxi@latest module add web-vitals

# Optional
npx nuxi@latest module add og-image
npx nuxi@latest module add schema-org
```

---

## 🎯 Component Recommendations

### For Your Dashboard

#### Data Display

- `UTable` - Display mobile dataset in table format
- `UCard` - Show statistics cards (you're already using this)
- `UAccordion` - Collapsible sections for filters
- `UTimeline` - Show mobile phone release timeline
- `UProgress` - Show dataset processing progress

#### Forms & Inputs

- `USelect` - Brand/company selection
- `USlider` - Price range selection
- `UInputNumber` - RAM, Battery, Screen size inputs
- `UCheckboxGroup` - Multi-select filters
- `UForm` - Prediction form with validation

#### Navigation

- `UBreadcrumb` - Dataset navigation
- `UPagination` - Paginate through results
- `UTabs` - Organize different views
- `UCommandPalette` - Quick search (Cmd+K)

#### Overlays

- `UModal` - Show prediction results
- `UTooltip` - Explain dataset fields
- `UToast` - Success/error notifications
- `UDrawer` - Filter panel

#### Dashboard Specific

- `DashboardSidebar` - Your sidebar (already using)
- `DashboardPanel` - Resizable panels for charts
- `DashboardSearch` - Global search

---

## 💡 Implementation Examples

### Example 1: Dataset Table with Filters

```vue
<template>
  <UCard>
    <template #header>
      <h2>Mobile Dataset</h2>
    </template>

    <!-- Filters -->
    <UAccordion>
      <UAccordionItem title="Filters">
        <USelect v-model="selectedBrand" :options="brands" />
        <USlider v-model="priceRange" :min="0" :max="5000" />
      </UAccordionItem>
    </UAccordion>

    <!-- Table -->
    <UTable :rows="filteredData" :columns="columns" />

    <!-- Pagination -->
    <UPagination v-model="page" :total="totalPages" />
  </UCard>
</template>
```

### Example 2: Statistics Cards with Animations

```vue
<template>
  <div v-auto-animate class="grid grid-cols-4 gap-4">
    <UCard v-for="stat in statistics" :key="stat.id">
      <div class="text-2xl font-bold">{{ stat.value }}</div>
      <div class="text-sm text-gray-500">{{ stat.label }}</div>
    </UCard>
  </div>
</template>
```

### Example 3: Prediction Form

```vue
<template>
  <UForm :state="form" @submit="handleSubmit">
    <UFormField label="RAM (GB)" name="ram">
      <UInputNumber v-model="form.ram" :min="2" :max="24" />
    </UFormField>

    <UFormField label="Battery (mAh)" name="battery">
      <UInputNumber v-model="form.battery" :min="2000" :max="6000" />
    </UFormField>

    <UButton type="submit" :loading="isLoading"> Predict Price </UButton>
  </UForm>
</template>
```

---

## 🚀 Next Steps

1. **Install high-priority modules** (image, icon, auto-animate)
2. **Explore unused Nuxt UI components** for your dashboard
3. **Create custom plugins** for dataset-specific functionality
4. **Optimize performance** with image optimization and lazy loading
5. **Add animations** to make data updates smoother

---

## 📚 Resources

- **Nuxt Modules**: https://nuxt.com/modules
- **Nuxt UI Docs**: https://ui.nuxt.com/docs/components
- **Module Search**: Use the search on nuxt.com/modules

---

## ⚠️ Notes

- All modules listed are compatible with Nuxt 4
- Check module documentation for specific configuration
- Some modules may require additional setup
- Test in development before deploying to production
