# Nuxt 4 Components & Plugins Reference

## 📦 Official Nuxt Modules (303+ Available)

### Core Official Modules

#### 1. **@nuxt/ui** ⭐ (You already have this!)

- **Description**: The Intuitive UI Library powered by Reka UI and Tailwind CSS
- **Downloads**: 603K/week
- **Stars**: 5.9K
- **Installation**: Already installed in your project
- **Components**: 110+ components (see below for full list)

#### 2. **@nuxt/devtools**

- **Description**: Visual tools to help you know your Nuxt application better
- **Downloads**: 3.7M/week
- **Installation**: `npx nuxi@latest module add @nuxt/devtools`
- **Usage**: Automatically available in dev mode

#### 3. **@nuxt/image**

- **Description**: Add images with progressive processing, lazy-loading, resizing
- **Downloads**: 1.1M/week
- **Installation**: `npx nuxi@latest module add @nuxt/image`
- **Usage**: `<NuxtImg src="/image.jpg" />`

#### 4. **@nuxt/icon**

- **Description**: Icon module with 200,000+ ready-to-use icons from Iconify
- **Downloads**: 921.9K/week
- **Installation**: `npx nuxi@latest module add @nuxt/icon`
- **Usage**: `<UIcon name="i-heroicons-home" />`

#### 5. **@nuxt/fonts**

- **Description**: Add custom web fonts with performance in mind
- **Downloads**: 799.2K/week
- **Installation**: `npx nuxi@latest module add @nuxt/fonts`
- **Usage**: Auto-optimized font loading

#### 6. **@nuxt/scripts**

- **Description**: Add 3rd-party scripts without sacrificing performance
- **Downloads**: 450.7K/week
- **Installation**: `npx nuxi@latest module add @nuxt/scripts`
- **Usage**: Configure in `nuxt.config.ts`

#### 7. **@nuxt/content**

- **Description**: File-based CMS with Markdown, YAML, JSON support
- **Downloads**: 330.2K/week
- **Installation**: `npx nuxi@latest module add @nuxt/content`
- **Usage**: Create content in `content/` directory

---

## 🎨 Nuxt UI Components (110+ Components)

### Layout Components

- `App` - Wraps your app with global configurations
- `Container` - Centers and constrains content width
- `Error` - Pre-built error component with NuxtError support
- `Footer` - Responsive footer component
- `Header` - Responsive header component
- `Main` - Main element that fills viewport height

### Element Components

- `Alert` - Callout to draw user's attention
- `Avatar` / `AvatarGroup` - Image with fallback and Nuxt Image support
- `Badge` - Short text for status or category
- `Banner` - Display banner at top of website
- `Button` - Button element (link or action)
- `Calendar` - Date selection (single, multiple, ranges)
- `Card` - Display content with header, body, footer
- `Chip` - Indicator of numeric value or state
- `Collapsible` - Toggle visibility of content
- `FieldGroup` - Group button-like elements
- `Icon` - Display icons from Iconify
- `Kbd` - Display keyboard key
- `Progress` - Progress indicator
- `Separator` - Horizontal/vertical separator
- `Skeleton` - Placeholder while content loads

### Form Components

- `Checkbox` / `CheckboxGroup` - Toggle checked/unchecked states
- `ColorPicker` - Select a color
- `FileUpload` - Upload files
- `Form` / `FormField` - Form with validation
- `Input` - Text input
- `InputDate` - Date selection input
- `InputMenu` - Autocomplete with suggestions
- `InputNumber` - Numerical input with range
- `InputTags` - Interactive tags input
- `InputTime` - Time selection input
- `PinInput` - PIN entry input
- `RadioGroup` - Radio button group
- `Select` / `SelectMenu` - Select from list (searchable)
- `Slider` - Numeric value within range
- `Switch` - Toggle between two states
- `Textarea` - Multi-line text input

### Data Display Components

- `Accordion` - Stacked collapsible panels
- `Carousel` - Carousel with motion and swipe (Embla)
- `Empty` - Empty state display
- `Marquee` - Infinite scrolling content
- `Table` - Responsive table element
- `Timeline` - Sequence of events with dates
- `Tree` - Hierarchical data structures
- `User` - User information display

### Navigation Components

- `Breadcrumb` - Hierarchy of links
- `CommandPalette` - Command palette with full-text search (Fuse.js)
- `FooterColumns` - List of links as columns
- `Link` - Wrapper around NuxtLink with extra props
- `NavigationMenu` - List of links (horizontal/vertical)
- `Pagination` - Navigate through pages
- `Stepper` - Multi-step process indicator
- `Tabs` - Tab panels (one at a time)

### Overlay Components

- `ContextMenu` - Right-click menu
- `Drawer` - Slides in/out of screen
- `DropdownMenu` - Click menu
- `Modal` - Dialog window
- `Popover` - Non-modal floating dialog
- `Slideover` - Slides from any side
- `Toast` - Succinct message/feedback
- `Tooltip` - Hover information popup

### Page Components (Marketing)

- `AuthForm` - Login/register/password reset forms
- `BlogPost` / `BlogPosts` - Blog article display
- `ChangelogVersion` / `ChangelogVersions` - Changelog display
- `Page` - Grid layout with columns
- `PageAnchors` - List of anchors
- `PageAside` - Sticky aside navigation
- `PageBody` - Main page content
- `PageCard` - Pre-styled card (title, description, link)
- `PageColumns` - Multi-column layout
- `PageCTA` - Call to action section
- `PageFeature` - Showcase key features
- `PageGrid` - Responsive grid system
- `PageHeader` - Responsive page header
- `PageHero` - Responsive hero section
- `PageLinks` - List of links
- `PageList` - Vertical list layout
- `PageLogos` - List of logos/images
- `PageSection` - Responsive section
- `PricingPlan` / `PricingPlans` / `PricingTable` - Pricing displays

### Dashboard Components

- `DashboardGroup` - Fixed layout with sidebar state
- `DashboardNavbar` - Responsive dashboard navbar
- `DashboardPanel` - Resizable panel
- `DashboardResizeHandle` - Resize sidebar/panel handle
- `DashboardSearch` - CommandPalette for dashboard
- `DashboardSearchButton` - Button to open search
- `DashboardSidebar` - Resizable, collapsible sidebar
- `DashboardSidebarCollapse` - Collapse button (desktop)
- `DashboardSidebarToggle` - Toggle button (mobile)
- `DashboardToolbar` - Toolbar under navbar

### AI Chat Components

- `ChatMessage` - Display chat message
- `ChatMessages` - List of chat messages (Vercel AI SDK)
- `ChatPalette` - Chatbot interface overlay
- `ChatPrompt` - Enhanced Textarea for prompts
- `ChatPromptSubmit` - Submit button with status

### Editor Components (TipTap)

- `Editor` - Rich text editor (Markdown, HTML, JSON)
- `EditorDragHandle` - Draggable handle for blocks
- `EditorEmojiMenu` - Emoji picker (type `:`)
- `EditorMentionMenu` - User mentions (type `@`)
- `EditorSuggestionMenu` - Formatting suggestions (type `/`)
- `EditorToolbar` - Customizable toolbar

### Content Components (Nuxt Content Integration)

- `ContentNavigation` - Accordion-style navigation
- `ContentSearch` - CommandPalette for docs
- `ContentSearchButton` - Button to open search
- `ContentSurround` - Prev/next page links
- `ContentToc` - Sticky Table of Contents

### Color Mode Components

- `ColorModeAvatar` - Avatar with light/dark sources
- `ColorModeButton` - Toggle light/dark mode
- `ColorModeImage` - Image with light/dark sources
- `ColorModeSelect` - Select system/dark/light
- `ColorModeSwitch` - Switch to toggle mode

### i18n Components

- `LocaleSelect` - Select to switch locales

---

## 🔌 Popular Community Modules

### State Management

- `@pinia/nuxt` - Vue Store (2.1M downloads/week) ⭐ You have this!
- `pinia-plugin-persistedstate` - Persist Pinia stores

### UI Libraries

- `reka-ui` - Vue port of Radix UI Primitives (2M downloads/week)
- `vuestic` - Vue 3 UI Framework
- `quasar` - Vue.js framework
- `shuimo-ui` - Modern UI library

### Forms

- `vueform` - Form builder
- `nuxt-formisch` - Form handling
- `form-actions` - Form actions

### Animations

- `@formkit/auto-animate` - Automatic animations (1.6M downloads/week)
- `nuxt-anime` - Animation library
- `marquee` - Infinite scrolling

### Analytics & Monitoring

- `sentry` - Error tracking ⭐ You have this!
- `web-vitals` - Web Vitals tracking
- `umami` - Privacy-focused analytics

### SEO & Performance

- `og-image` - Open Graph image generation
- `schema-org` - Structured data
- `unlazy` - Lazy loading images
- `twicpics` - Image optimization

### Utilities

- `dayjs` - Date manipulation
- `radash` - Utility library
- `icon` - Icon management
- `fonts` - Font optimization

### Database & CMS

- `kql` - Kirby Query Language
- `content-island` - Content islands

### Authentication

- `@logto/nuxt` - Authentication
- `@nuxtjs/kinde` - Kinde authentication

### Other

- `nuxt-cookie-consent` - Cookie consent
- `turnstile` - Cloudflare Turnstile
- `scripts` - Third-party scripts
- `xstate` - State machines
- `graphql-request` - GraphQL client
- `pdfeasy` - PDF generation
- `vue-email` - Email templates
- `nuxt-file-storage` - File storage
- `nuxt-viewport` - Viewport utilities
- `nuxt-fontawesome` - Font Awesome icons

---

## 🛠️ Creating Custom Plugins (Nuxt 4)

### Plugin Structure

```typescript
// plugins/my-plugin.client.ts (client-only)
export default defineNuxtPlugin({
  name: 'my-plugin',
  setup(nuxtApp) {
    // Plugin logic here
  },
});
```

```typescript
// plugins/my-plugin.server.ts (server-only)
export default defineNuxtPlugin({
  name: 'my-plugin',
  setup(nuxtApp) {
    // Server-side logic
  },
});
```

```typescript
// plugins/my-plugin.ts (universal)
export default defineNuxtPlugin({
  name: 'my-plugin',
  parallel: true, // Allow parallel loading
  setup(nuxtApp) {
    // Universal logic
  },
});
```

### Plugin Options

- `name`: Unique plugin identifier
- `parallel`: Allow concurrent loading (default: false)
- `enforce`: 'pre' | 'post' - Execution order
- `setup`: Function that receives `nuxtApp`

---

## 📝 Recommended Modules for Your App

### High Priority

1. **@nuxt/image** - Optimize mobile dataset images
2. **@nuxt/icon** - Use more icons (you already have UIcon)
3. **@nuxt/scripts** - Add analytics scripts efficiently
4. **@formkit/auto-animate** - Smooth animations

### Medium Priority

1. **@nuxt/content** - If you need documentation
2. **dayjs** - Date formatting for dataset years
3. **marquee** - Scrolling announcements
4. **web-vitals** - Performance monitoring

### Low Priority

1. **og-image** - Generate OG images for sharing
2. **schema-org** - Structured data for SEO
3. **nuxt-cookie-consent** - GDPR compliance

---

## 🎯 Usage Examples

### Using Nuxt UI Components

```vue
<template>
  <UCard>
    <template #header>
      <h2>Dataset Statistics</h2>
    </template>
    <div>
      <UButton color="purple" variant="solid">Click Me</UButton>
      <UAlert color="green" title="Success">Data loaded!</UAlert>
    </div>
  </UCard>
</template>
```

### Installing a Module

```bash
# Using Nuxt CLI (recommended)
npx nuxi@latest module add @nuxt/image

# Or manually
npm install @nuxt/image
```

Then add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
});
```

### Creating a Custom Plugin

```typescript
// plugins/analytics.client.ts
export default defineNuxtPlugin({
  name: 'analytics',
  setup() {
    if (process.client) {
      // Initialize analytics
      console.log('Analytics initialized');
    }
  },
});
```

---

## 🔗 Resources

- **Nuxt Modules**: https://nuxt.com/modules
- **Nuxt UI Components**: https://ui.nuxt.com/docs/components
- **Nuxt Plugins Guide**: https://nuxt.com/docs/4.x/guide/directory-structure/plugins
- **Nuxt UI Templates**: https://ui.nuxt.com/templates

---

## 📊 Module Categories

### Official Modules

- @nuxt/\* - Official Nuxt team modules

### Community Modules

- @nuxtjs/\* - Community-maintained modules
- Other packages - Third-party integrations

### Categories Available

- AI, Analytics, CMS, CSS, Database, Devtools
- Ecommerce, Extensions, Fonts, Images, Libraries
- Monitoring, Payment, Performance, Request
- Security, SEO, UI

---

## ✅ Next Steps

1. **Review your current modules** in `nuxt.config.ts`
2. **Install recommended modules** for your use case
3. **Explore Nuxt UI components** you haven't used yet
4. **Create custom plugins** for app-specific functionality
5. **Check module compatibility** with Nuxt 4
