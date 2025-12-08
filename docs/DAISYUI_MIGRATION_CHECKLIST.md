# DaisyUI Migration Checklist

Use this checklist to track your migration progress from PrimeVue/Nuxt UI to DaisyUI.

## Pre-Migration

- [ ] Create backup branch
- [ ] Document current component usage
- [ ] List all PrimeVue components in use
- [ ] List all Nuxt UI components in use
- [ ] Note custom styling and behaviors
- [ ] Verify DaisyUI is installed
- [ ] Verify Tailwind config is correct
- [ ] Test current app functionality

## Setup

- [x] Create `components/daisyui/` directory
- [x] Create DButton component wrapper
- [x] Create DInput component wrapper
- [x] Create DCard component wrapper
- [x] Create DSelect component wrapper
- [x] Create DModal component wrapper
- [x] Create DToast component/system
- [x] Create DTable component wrapper (if needed)

## Component Migration

### Buttons
- [x] Replace all `PrimeButton` with DaisyUI buttons
- [x] Replace all `UButton` with DaisyUI buttons
- [x] Update button variants
- [x] Update button sizes
- [ ] Test button interactions
- [ ] Test button loading states
- [ ] Test button disabled states

### Inputs
- [ ] Replace all `InputText` with DaisyUI inputs
- [ ] Replace all `UInput` with DaisyUI inputs
- [ ] Update input labels
- [ ] Update input validation styling
- [ ] Test input interactions
- [ ] Test input validation
- [ ] Test input disabled states

### Forms
- [ ] Migrate all form components
- [ ] Update form layouts
- [ ] Update form validation
- [ ] Test form submissions
- [ ] Test form error handling
- [ ] Test form accessibility

### Cards
- [x] Replace all `UCard` with DaisyUI cards
- [x] Update card headers
- [x] Update card footers
- [x] Update card images
- [ ] Test card layouts
- [ ] Test card responsiveness

### Tables
- [x] Replace `DataTable` with DaisyUI tables
- [x] Implement pagination
- [x] Implement sorting
- [x] Implement filtering
- [x] Implement search
- [ ] Test table responsiveness
- [ ] Test table accessibility

### Dropdowns/Selects
- [x] Replace `Dropdown` with DaisyUI selects
- [x] Replace `USelectMenu` with DaisyUI selects
- [x] Update dropdown options
- [ ] Test dropdown interactions
- [ ] Test dropdown accessibility

### Modals/Dialogs
- [ ] Replace `Dialog` with DaisyUI modals
- [ ] Replace `UModal` with DaisyUI modals
- [ ] Update modal triggers
- [ ] Update modal content
- [ ] Test modal open/close
- [ ] Test modal accessibility

### Checkboxes & Radios
- [ ] Replace `Checkbox` with DaisyUI checkboxes
- [ ] Replace `UCheckbox` with DaisyUI checkboxes
- [ ] Replace `RadioButton` with DaisyUI radios
- [ ] Replace `URadio` with DaisyUI radios
- [ ] Test checkbox/radio interactions

### Toasts/Notifications
- [x] Replace PrimeVue Toast with DaisyUI toasts
- [x] Create toast service/composable
- [x] Update toast calls throughout app
- [ ] Test toast display
- [ ] Test toast auto-dismiss

### Navigation
- [x] Update navbar components
- [x] Update menu components
- [x] Update breadcrumbs
- [ ] Test navigation interactions
- [ ] Test mobile navigation

### Other Components
- [ ] Replace `UAlert` with DaisyUI alerts
- [ ] Replace `UBadge` with DaisyUI badges
- [ ] Replace `UAvatar` with DaisyUI avatars (if used)
- [ ] Replace `UTabs` with DaisyUI tabs (if used)
- [ ] Replace `UAccordion` with DaisyUI collapse (if used)

## Pages Migration

- [ ] Migrate home page
- [ ] Migrate search page
- [ ] Migrate compare page
- [ ] Migrate dashboard page
- [ ] Migrate settings page
- [ ] Migrate profile page
- [ ] Migrate all other pages

## Layouts Migration

- [ ] Migrate default layout
- [ ] Migrate dashboard layout
- [ ] Migrate catalog layout
- [ ] Migrate compare layout
- [ ] Migrate query layout
- [ ] Test layout responsiveness

## Styling & Theming

- [ ] Remove PrimeVue CSS imports
- [ ] Remove Nuxt UI CSS (if removing)
- [ ] Update custom CSS
- [ ] Test light theme
- [ ] Test dark theme
- [ ] Test theme switching
- [ ] Test theme persistence
- [ ] Update color scheme
- [ ] Update typography
- [ ] Update spacing
- [ ] Update shadows

## Plugins & Configuration

- [ ] Remove PrimeVue plugin
- [ ] Remove PrimeVue from nuxt.config.ts
- [ ] Remove PrimeVue CSS from nuxt.config.ts
- [ ] Update global component registration (if any)
- [ ] Remove Nuxt UI module (if removing)
- [ ] Clean up unused imports

## Testing

### Functional Testing
- [ ] All buttons work
- [ ] All inputs work
- [ ] All forms submit correctly
- [ ] All modals open/close
- [ ] All toasts display
- [ ] All tables display data
- [ ] All navigation works
- [ ] All interactions work

### Visual Testing
- [ ] All components look correct
- [ ] Spacing is consistent
- [ ] Colors are correct
- [ ] Typography is correct
- [ ] Icons are aligned
- [ ] Shadows are appropriate

### Responsive Testing
- [ ] Mobile layout works (< 640px)
- [ ] Tablet layout works (640px - 1024px)
- [ ] Desktop layout works (> 1024px)
- [ ] Tables are scrollable on mobile
- [ ] Navigation is responsive
- [ ] Modals are responsive

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] No accessibility errors

### Performance Testing
- [ ] Page load time acceptable
- [ ] Bundle size reduced
- [ ] No console errors
- [ ] No layout shifts
- [ ] Smooth animations

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Cleanup

- [ ] Remove PrimeVue dependencies
- [ ] Remove PrimeVue plugin file
- [ ] Remove Nuxt UI dependencies (if removing)
- [ ] Remove unused imports
- [ ] Remove unused CSS
- [ ] Clean up commented code
- [ ] Update documentation
- [ ] Update README

## Documentation

- [ ] Update component documentation
- [ ] Update style guide
- [ ] Update developer guide
- [ ] Document new patterns
- [ ] Document theme customization
- [ ] Create component examples

## Final Steps

- [ ] Run full test suite
- [ ] Run linting
- [ ] Run type checking
- [ ] Build production bundle
- [ ] Test production build
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Get team review
- [ ] Deploy to production

## Post-Migration

- [ ] Monitor for issues
- [ ] Collect user feedback
- [ ] Document lessons learned
- [ ] Plan future improvements
- [ ] Update migration guide with learnings

---

## Notes

Use this section to track any issues, blockers, or decisions made during migration:

### Issues Encountered
-

### Decisions Made
-

### Components That Need Custom Solutions
-

### Performance Improvements
-

---

**Migration Start Date:** _______________
**Migration End Date:** _______________
**Total Time:** _______________
