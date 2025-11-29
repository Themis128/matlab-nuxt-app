# Contributing to MATLAB-Nuxt App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Themis128/matlab-nuxt-app/issues)
2. Use the [Bug Report template](https://github.com/Themis128/matlab-nuxt-app/issues/new?template=bug_report.md)
3. Provide as much detail as possible:
   - MATLAB version
   - Operating system
   - Steps to reproduce
   - Error messages
   - Screenshots (if applicable)

### Suggesting Features

1. Check if the feature has already been suggested
2. Use the [Feature Request template](https://github.com/Themis128/matlab-nuxt-app/issues/new?template=feature_request.md)
3. Describe the use case and expected behavior

### Improving Models

1. Use the [Model Improvement template](https://github.com/Themis128/matlab-nuxt-app/issues/new?template=model_improvement.md)
2. Include performance metrics (before/after)
3. Explain the improvement approach

## 🔧 Development Setup

### Prerequisites

- MATLAB R2020a or later
- Deep Learning Toolbox
- Statistics and Machine Learning Toolbox
- Node.js 18+
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone
   git clone https://github.com/YOUR_USERNAME/matlab-nuxt-app.git
   cd matlab-nuxt-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup MATLAB environment**
   ```matlab
   cd mobiles-dataset-docs
   run('setup_matlab_env.m')
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Coding Guidelines

### MATLAB Code

- Use descriptive variable names
- Add comments for complex logic
- Follow MATLAB naming conventions:
  - Functions: `lowercase_with_underscores.m`
  - Variables: `camelCase` or `descriptive_names`
- Include function headers:
  ```matlab
  % Function Name
  % Description
  % Usage: output = function_name(input)
  ```

### JavaScript/TypeScript

- Follow ESLint rules
- Use TypeScript for type safety
- Add JSDoc comments for functions

### Documentation

- Update README.md if adding features
- Add examples for new functions
- Update relevant guides in `mobiles-dataset-docs/`

## 🧪 Testing

### MATLAB Testing

- Test your changes with sample data
- Verify model performance doesn't degrade
- Check for errors and warnings

### Before Submitting

- [ ] Code runs without errors
- [ ] All existing tests pass
- [ ] New features are documented
- [ ] Code follows style guidelines

## 📤 Submitting Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link related issues
   - Add screenshots if applicable

## 🎯 Contribution Areas

### High Priority

- Model performance improvements
- Bug fixes
- Documentation improvements
- New analysis features

### Medium Priority

- Additional visualizations
- Code optimization
- Test coverage
- Examples and tutorials

### Low Priority

- Code style improvements
- Refactoring
- Additional comments

## 📋 Pull Request Process

1. Ensure your code follows the guidelines
2. Update documentation as needed
3. Add tests if applicable
4. Ensure all checks pass
5. Request review from maintainers

## 🐛 Bug Fixes

- Include tests that demonstrate the bug
- Show that the fix works
- Update documentation if needed

## ✨ New Features

- Discuss in an issue first (for large features)
- Add documentation
- Include examples
- Update relevant guides

## 📚 Documentation

- Keep README.md up to date
- Add examples for new features
- Update guides in `mobiles-dataset-docs/`
- Add comments to code

## ❓ Questions?

- Open a [Discussion](https://github.com/Themis128/matlab-nuxt-app/discussions)
- Check existing [Issues](https://github.com/Themis128/matlab-nuxt-app/issues)
- Review [Documentation](https://github.com/Themis128/matlab-nuxt-app/tree/master/mobiles-dataset-docs)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

---

Thank you for contributing! 🎉
