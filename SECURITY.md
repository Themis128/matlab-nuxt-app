# Security Policy

## 🔒 Supported Versions

We actively support the following versions with security updates:

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue.

Instead, please report it by:

1. **Email:** [Your email] (if you have one set up)
2. **Private Security Advisory:** Use GitHub's [Private Vulnerability Reporting](https://github.com/Themis128/matlab-nuxt-app/security/advisories/new)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Time

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will keep you informed of our progress

## 🛡️ Security Features

### Implemented Security Measures

- ✅ **Rate Limiting** - Prevents API abuse (100 requests/60 seconds)
- ✅ **CORS Protection** - Configurable origin restrictions
- ✅ **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- ✅ **Input Validation** - Pydantic models for all API inputs
- ✅ **Environment Isolation** - Separate dev/production configurations
- ✅ **Docker Security** - Non-root users, minimal attack surface
- ✅ **Health Checks** - Monitoring endpoints

### Security Documentation

For detailed security configuration:

- 📖 [Security Configuration Guide](docs/SECURITY_CONFIGURATION.md)
- 📖 [Error Tracking Setup](docs/ERROR_TRACKING_SETUP.md)
- 📖 [Implementation Summary](docs/MISSING_FEATURES_IMPLEMENTATION.md)

## 🛡️ Security Best Practices

### For Users

- Keep MATLAB and dependencies updated
- Review code before running
- Use trusted data sources
- Validate inputs

### For Contributors

- Follow secure coding practices
- Validate all inputs
- Avoid hardcoded credentials
- Review dependencies for vulnerabilities

## 🔍 Known Security Considerations

### MATLAB Scripts

- Always review MATLAB scripts before running
- Be cautious with `eval()` or dynamic code execution
- Validate file paths and inputs

### Web Interface (Nuxt)

- Input validation on all API endpoints
- Sanitize user inputs
- Use environment variables for secrets
- Keep dependencies updated

### Data Handling

- Validate dataset sources
- Check data integrity
- Handle sensitive data appropriately

## 📝 Security Updates

Security updates will be:

- Released as patches for supported versions
- Documented in release notes
- Tagged with security labels

---

**Thank you for helping keep this project secure!** 🔐
