# Contributing to MATLAB Deep Learning Project

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/MatLab.git
   cd MatLab
   ```
3. **Set up the development environment:**
   - Follow the instructions in [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
   - Install dependencies: `npm install`
   - Set up Python environment
   - Configure MATLAB environment

## Development Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed

3. **Test your changes:**
   - Test MATLAB scripts in MATLAB
   - Test Node.js scripts: `npm run check`
   - Test Python scripts if applicable
   - Test the web app: `npm run dev`

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request:**
   - Use the PR template
   - Provide a clear description
   - Reference any related issues

## Code Style Guidelines

### MATLAB
- Use descriptive variable names
- Add comments for complex logic
- Follow MATLAB naming conventions
- Include function documentation

### JavaScript/TypeScript
- Follow existing code style
- Use TypeScript for type safety
- Add JSDoc comments for functions
- Use meaningful variable names

### Python
- Follow PEP 8 style guide
- Add docstrings to functions
- Use type hints where appropriate

## Documentation

- Update README.md if adding new features
- Add examples if creating new scripts
- Update relevant guide files
- Keep documentation clear and concise

## Testing

- Test all changes before submitting
- Ensure existing functionality still works
- Add tests for new features if applicable
- Test on different platforms if possible

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (MATLAB version, OS, etc.)
- Error messages or screenshots

## Questions?

Feel free to open an issue for questions or discussions about the project.

Thank you for contributing! 🎉
