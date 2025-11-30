# Changelog

All notable changes to the MATLAB Deep Learning & Mobile Dataset Analysis project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Security**: Comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.) in Nuxt config
- **Security**: Rate limiting middleware in Python API (100 requests/60 seconds by default)
- **DevOps**: Node.js version pinning with `.nvmrc` file (v22)
- **DevOps**: Dependabot configuration for automated dependency updates (npm, pip, GitHub Actions, Docker)
- **Security**: Enhanced CORS configuration with environment-based origins
- **Security**: Rate limit headers in API responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

### Changed
- **Security**: Strict Content Security Policy in production mode
- **Security**: Enhanced HTTP security headers across all routes

### Security
- Implemented rate limiting to prevent API abuse
- Added comprehensive security headers to protect against common vulnerabilities
- Configured strict CSP for production environments

## [1.0.0] - 2025-11-30

### Added
- **AI Models**: Distilled production model with 12× faster predictions (<1ms latency)
- **Data Quality**: Fixed data leakage issues - removed 3 price-derived features
- **Models**: Price prediction (98.24% R²), RAM prediction (95.16% R²), Battery prediction (94.77% R²)
- **Models**: Brand classification with 65.22% accuracy
- **Features**: 18 engineered features including price ratios, brand segments, and temporal features
- **Web**: Interactive dashboard with real-time predictions
- **Web**: Advanced search and filter for 930+ mobile phones
- **Web**: Model comparison feature (up to 5 models side-by-side)
- **Web**: Dataset explorer with visualizations
- **Web**: Dark mode support
- **Web**: Fully responsive design
- **Backend**: Python FastAPI with scikit-learn models
- **Backend**: Dynamic backend detection (localhost/Replit/production)
- **DevOps**: Docker setup with docker-compose
- **DevOps**: GitHub Actions CI/CD workflows
- **DevOps**: Comprehensive E2E testing with Playwright
- **MATLAB**: Deep learning examples (CNN, LSTM, Autoencoder, ResNet)
- **MATLAB**: Hybrid networks combining image and tabular data
- **Documentation**: Comprehensive README with setup instructions
- **Documentation**: Contributing guidelines (CONTRIBUTING.md)
- **Documentation**: Security policy (SECURITY.md)
- **Documentation**: Code of Conduct (CODE_OF_CONDUCT.md)

### Changed
- Updated to Nuxt 4.2.1 with improved performance
- Migrated to Python 3.14 for latest features
- Enhanced model training with cross-validation
- Optimized build process with code splitting

### Fixed
- Data leakage in training pipeline
- CSV encoding issues on Windows
- GPU memory errors with batch size optimization
- Enhanced feature mismatch in predictions

### Performance
- 12× faster predictions with distilled models
- Production model size reduced to 14.5 KB
- Sub-millisecond prediction latency
- Optimized bundle size with manual chunks

### Security
- Input validation for all API endpoints
- Secure handling of environment variables
- Docker security best practices
- Health check endpoints for monitoring

## [0.9.0] - 2025-11-15

### Added
- Initial release with basic prediction models
- MATLAB integration for deep learning
- Nuxt.js frontend with basic UI
- Python API with TensorFlow models

### Known Issues
- Data leakage in feature engineering (fixed in 1.0.0)
- Performance issues with TensorFlow models (fixed in 1.0.0)
- Missing security headers (fixed in unreleased)

---

## Version History Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
- **Performance** - Performance improvements

---

## Upgrade Guide

### Upgrading to Unreleased (with new security features)

1. **Update environment variables** for CORS:
   ```env
   CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
   ```

2. **Configure rate limiting** (optional):
   ```env
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_WINDOW=60
   ```

3. **Install dependencies**:
   ```bash
   npm install
   cd python_api && pip install -r requirements.txt
   ```

4. **Test the application**:
   ```bash
   npm run dev:all
   npm test
   ```

### Upgrading to 1.0.0

1. **Update Python** to version 3.14
2. **Retrain models** using enhanced features script
3. **Update dataset** to remove price-derived features
4. **Run data validation** scripts

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

- 📧 GitHub Issues: [Report a bug](https://github.com/Themis128/matlab-nuxt-app/issues)
- 💬 Discussions: [Ask questions](https://github.com/Themis128/matlab-nuxt-app/discussions)
- 🔒 Security: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities
