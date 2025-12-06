# Documentation Index

> **Analytical Documentation** - Generated December 2025

## Quick Navigation

### Core Documentation

1. **[README.md](./README.md)** - Main documentation
   - Application overview
   - Architecture analysis
   - Technology stack
   - Project structure
   - Dependencies analysis
   - Build configuration

2. **[API_REFERENCE.md](./API_REFERENCE.md)** - API documentation
   - Nuxt server API routes
   - Python FastAPI endpoints
   - Request/response formats
   - Error handling
   - Rate limiting

3. **[COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)** - Components guide
   - All 15 components
   - Props and events
   - Usage examples
   - Integration recommendations

4. **[STORES_REFERENCE.md](./STORES_REFERENCE.md)** - Pinia stores guide
   - All 6 stores
   - State, getters, actions
   - Usage patterns
   - Integration examples

5. **[COMPOSABLES_REFERENCE.md](./COMPOSABLES_REFERENCE.md)** - Composables guide
   - All 13 composables
   - Return types
   - Usage examples
   - Best practices

6. **[PAGES_ANALYSIS.md](./PAGES_ANALYSIS.md)** - Pages analysis
   - All 11 pages
   - Features and functionality
   - API integration status
   - Improvement recommendations

7. **[DATABASE_REFERENCE.md](./DATABASE_REFERENCE.md)** - Database documentation
   - SQLite schema and implementation
   - LanceDB multimodal database
   - Schema details and usage
   - API integration
   - Maintenance and troubleshooting

8. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Setup & installation guide
   - Prerequisites and requirements
   - Step-by-step installation
   - Environment configuration
   - Troubleshooting
   - Production deployment

9. **[FILE_STRUCTURE.md](./FILE_STRUCTURE.md)** - Required file structure
   - Complete directory structure
   - Required vs optional files
   - File descriptions
   - Validation checklist

10. **[FILE_VERIFICATION.md](./FILE_VERIFICATION.md)** - File verification report
    - Current file status
    - Missing file detection
    - Issues fixed
    - Verification checklist

11. **[SCRIPTS_REFERENCE.md](./SCRIPTS_REFERENCE.md)** - npm scripts reference
    - All available scripts
    - Development, build, test scripts
    - Type checking and linting
    - Workflow examples

12. **[PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)** - Performance optimization guide
    - Lazy loading implementation
    - Code splitting strategy
    - Tree shaking configuration
    - Bundle size optimization
    - Performance metrics

---

## Documentation Structure

```
docs/
├── README.md                    # Main documentation
├── INDEX.md                     # This file
├── SETUP_GUIDE.md              # Setup & installation
├── FILE_STRUCTURE.md           # Required file structure
├── API_REFERENCE.md             # API endpoints
├── COMPONENTS_REFERENCE.md      # Components
├── STORES_REFERENCE.md          # Pinia stores
├── COMPOSABLES_REFERENCE.md     # Composables
├── PAGES_ANALYSIS.md            # Pages analysis
└── DATABASE_REFERENCE.md       # Database schema & implementation
```

---

## Quick Reference

### Application Stats

- **Framework**: Nuxt 4.2.1 + Vue 3.5.25
- **Pages**: 11
- **Components**: 15
- **Stores**: 6
- **Composables**: 13
- **API Routes**: 22+ (Nuxt server)
- **Python Endpoints**: 20+ (FastAPI)

### Technology Stack

**Frontend:**

- Nuxt 4.2.1
- Vue 3.5.25
- TypeScript 5.9.3
- Nuxt UI 2.19.0
- Pinia 3.0.4
- Tailwind CSS v4

**Backend:**

- Python 3.14+
- FastAPI 0.104+
- scikit-learn (primary)
- TensorFlow (fallback)

### Key Features

- ✅ Price prediction (98.24% R²)
- ✅ RAM prediction (95.16% R²)
- ✅ Battery prediction (94.77% R²)
- ✅ Brand classification (65.22% accuracy)
- ✅ Dataset search and filtering
- ✅ A/B testing for models
- ✅ Real-time analytics
- ✅ Error tracking (Sentry)

---

## Getting Started

### For New Users

1. **Start Here:** Read **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** to get the app running
2. Then read **[README.md](./README.md)** for architecture overview

### For Developers

1. Read **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** if you haven't set up yet
2. Read **[README.md](./README.md)** for architecture overview
3. Check **[API_REFERENCE.md](./API_REFERENCE.md)** for API endpoints
4. Review **[PAGES_ANALYSIS.md](./PAGES_ANALYSIS.md)** for page structure
5. Use **[COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)** for components
6. Use **[STORES_REFERENCE.md](./STORES_REFERENCE.md)** for state management
7. Use **[COMPOSABLES_REFERENCE.md](./COMPOSABLES_REFERENCE.md)** for utilities

### For Integration

1. **Stores**: See `STORES_REFERENCE.md` → Integration examples
2. **Composables**: See `COMPOSABLES_REFERENCE.md` → Usage patterns
3. **Components**: See `COMPONENTS_REFERENCE.md` → Props and events
4. **API**: See `API_REFERENCE.md` → Endpoint documentation

---

## Documentation Philosophy

This documentation is **analytical** - it describes:

- ✅ What exists in the codebase
- ✅ How components/stores/composables work
- ✅ Current integration status
- ✅ Improvement opportunities

**Not included:**

- ❌ Setup instructions (use code comments)
- ❌ Tutorials (use code examples)
- ❌ Historical changes (use git history)

---

## Maintenance

**Update Frequency**: When significant changes are made

**Update Triggers:**

- New pages/components/stores added
- API endpoints changed
- Architecture changes
- Major dependency updates

---

## Contributing to Documentation

When adding new features:

1. **New Page** → Update `PAGES_ANALYSIS.md`
2. **New Component** → Update `COMPONENTS_REFERENCE.md`
3. **New Store** → Update `STORES_REFERENCE.md`
4. **New Composable** → Update `COMPOSABLES_REFERENCE.md`
5. **New API Endpoint** → Update `API_REFERENCE.md`
6. **Database Changes** → Update `DATABASE_REFERENCE.md`
7. **Architecture Change** → Update `README.md`

---

## Related Resources

- **Code Comments**: Inline documentation in code
- **TypeScript Types**: Type definitions in `types/`
- **Git History**: Change history via `git log`
- **Package.json**: Dependencies and scripts

---

**Last Updated**: December 2025
**Version**: 1.0.0
