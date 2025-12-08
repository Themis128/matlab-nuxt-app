# Next Steps - DaisyUI Migration & Project Improvements

## ✅ Completed

- ✅ Created reusable layout components (DPageLayout, DPageHeader, DAlert)
- ✅ Migrated 19/20 pages to use new components
- ✅ Standardized loading and error states
- ✅ Created usePageData composable
- ✅ Updated documentation

## 🔧 Immediate Next Steps

### 1. ✅ Fix Remaining Direct Class Usage (COMPLETED)

**Priority: Medium** ✅

Fixed all remaining direct DaisyUI class usage:

- ✅ Replaced pagination buttons in `search.vue` with DButton
- ✅ Updated `style-guide.vue` to use DButton consistently
- ✅ All pages now use wrapper components

### 2. ✅ Security Vulnerabilities - CORS Fixed (COMPLETED)

**Priority: High** ✅

Fixed **15 API endpoints** that were using insecure CORS:

- ✅ All user management APIs
- ✅ All notification APIs
- ✅ All prediction APIs
- ✅ All advanced APIs
- ✅ Query and product APIs
- ✅ Health check endpoints

**Remaining Security Issues:**

**Priority: High** ⚠️

The security scan identified **17 vulnerabilities** across 12 files. Critical issues include:

#### Authentication & Authorization ⚠️
- **Status**: CORS fixed ✅, but authentication still needs improvement
- **Issue**: User identification via cookie without session validation
- **Files**: All user-related API endpoints
- **TODO**: Implement proper session management or JWT validation

#### Command Injection
- **tools/run-eslint-mcp-fallback.js** - Command injection risk
- **mcp-servers/todo-mcp-server/todo_mcp.py** - Command injection in ripgrep
- **scripts/sentry/discover-and-fix.js** - Command injection risk

#### File Operations
- **mcp-servers/todo-mcp-server/todo_mcp.py** - Arbitrary file write
- **scripts/sentry/fix-api-config.js** - Arbitrary file write (2 instances)
- **scripts/python/view_mat_file.py** - Arbitrary file write

#### Insecure Deserialization
- **python_api/pickle_security.py** - Untrusted pickle deserialization

**Action Items:**
- [x] Fix CORS configuration (use specific origins, not '*') ✅
- [ ] Implement proper authentication/authorization
- [ ] Sanitize user inputs in command execution
- [ ] Validate file paths before write operations
- [ ] Replace pickle with safer serialization (JSON, msgpack)

### 3. Testing & Validation

**Priority: High**

- [ ] **Visual Testing**: Test all migrated pages in browser
  - [ ] Verify layouts render correctly
  - [ ] Check responsive design on mobile/tablet
  - [ ] Verify theme switching works
  - [ ] Test loading states
  - [ ] Test error states

- [ ] **Functional Testing**:
  - [ ] Test form submissions
  - [ ] Test navigation
  - [ ] Test API integrations
  - [ ] Test user interactions

- [ ] **Accessibility Testing**:
  - [ ] Run accessibility audit (Lighthouse)
  - [ ] Test keyboard navigation
  - [ ] Verify ARIA labels
  - [ ] Check color contrast

### 4. Performance Optimization

**Priority: Medium**

- [ ] **Code Splitting**:
  - [ ] Lazy load heavy pages
  - [ ] Dynamic imports for large components
  - [ ] Optimize bundle size

- [ ] **Image Optimization**:
  - [ ] Verify OptimizedImage component usage
  - [ ] Add lazy loading for images
  - [ ] Implement proper image formats (WebP, AVIF)

- [ ] **Caching**:
  - [ ] Review API response caching
  - [ ] Implement proper cache headers
  - [ ] Add service worker if needed

### 5. Documentation Updates

**Priority: Low**

- [ ] Update README with new component usage
- [ ] Add component examples to style-guide
- [ ] Document migration patterns
- [ ] Create developer guide for new components

### 6. Optional Enhancements

**Priority: Low**

- [ ] **Page Organization**: Consider organizing pages into feature-based subdirectories
  ```
  pages/
  ├── user/
  │   ├── profile.vue
  │   └── settings.vue
  ├── analytics/
  │   ├── datamine.vue
  │   └── recommendations.vue
  └── admin/
      ├── sentry-dashboard.vue
      └── integration-status.vue
  ```

- [ ] **Page Transitions**: Add smooth transitions between pages
- [ ] **Loading Skeletons**: Replace spinners with skeleton loaders
- [ ] **Empty States**: Create reusable empty state component
- [ ] **Error Boundaries**: Add error boundary components

## 📋 Recommended Order of Execution

### Phase 1: Critical (This Week)
1. Fix security vulnerabilities (especially authentication/CORS)
2. Test all migrated pages
3. Fix remaining direct class usage

### Phase 2: Important (Next Week)
4. Performance optimization
5. Accessibility improvements
6. Documentation updates

### Phase 3: Nice to Have (Future)
7. Page organization refactoring
8. Enhanced UX features
9. Advanced optimizations

## 🔍 Quick Wins

These can be done quickly for immediate improvements:

1. **Fix CORS** (15 min)
   - Update `server/api/user/settings.put.ts`
   - Update `server/api/notifications/mark-all-read.put.ts`
   - Use environment variable for allowed origins

2. **Replace Pagination Buttons** (10 min)
   - Update `pages/search.vue` pagination
   - Use DButton component

3. **Update Style Guide** (15 min)
   - Replace direct button classes
   - Showcase all DaisyUI components

4. **Add Loading Skeletons** (30 min)
   - Create DSkeleton component
   - Replace spinners in key pages

## 📊 Progress Tracking

- **Migration**: 95% complete (19/20 pages)
- **Security**: 0% addressed (17 vulnerabilities)
- **Testing**: 0% complete
- **Documentation**: 80% complete

## 🎯 Success Criteria

- [ ] All pages use DaisyUI wrapper components
- [ ] Zero high-severity security vulnerabilities
- [ ] All pages tested and working
- [ ] Performance metrics meet targets
- [ ] Documentation complete
- [ ] Accessibility score > 90

## 📚 Resources

- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Components](https://daisyui.com/components/)
- [Security Best Practices](./SECURITY_GUIDELINES.md) (to be created)
- [DAISYUI_MIGRATION_STATUS.md](./DAISYUI_MIGRATION_STATUS.md)
- [DAISYUI_PAGE_PATTERNS.md](./DAISYUI_PAGE_PATTERNS.md)
