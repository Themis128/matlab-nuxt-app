# Security Guidelines

This document outlines security best practices and addresses vulnerabilities identified in the codebase.

## 🔒 Current Security Status

### ✅ Fixed Issues

1. **CORS Configuration** ✅
   - Using `setCorsHeaders()` utility function
   - Validates origins instead of using wildcard '*'
   - Production uses environment variable `ALLOWED_ORIGINS`
   - Development restricts to localhost origins

2. **Input Validation** ✅
   - User ID format validation (alphanumeric, hyphens, underscores)
   - Request body validation
   - URL validation for API endpoints

### ⚠️ Known Issues & TODOs

1. **Authentication System** ⚠️
   - **Current**: Cookie-based user identification without session validation
   - **Risk**: Users can impersonate others by setting `user-id` cookie
   - **Status**: Format validation exists, but no session/token verification
   - **TODO**: Implement proper session management or JWT validation

2. **Command Injection Risks** ⚠️
   - **Files**: `tools/run-eslint-mcp-fallback.js`, `mcp-servers/todo-mcp-server/todo_mcp.py`, `scripts/sentry/discover-and-fix.js`
   - **Risk**: User input directly interpolated into shell commands
   - **TODO**: Use argument arrays instead of string concatenation
   - **TODO**: Sanitize all user inputs before command execution

3. **Arbitrary File Write** ⚠️
   - **Files**: Multiple scripts and MCP servers
   - **Risk**: User-controlled paths can write to arbitrary locations
   - **TODO**: Validate and sanitize file paths
   - **TODO**: Use whitelist of allowed directories
   - **TODO**: Check for path traversal attempts (`../`)

4. **Insecure Deserialization** ⚠️
   - **File**: `python_api/pickle_security.py`
   - **Risk**: Untrusted pickle deserialization can execute arbitrary code
   - **TODO**: Replace pickle with safer alternatives (JSON, msgpack)
   - **TODO**: If pickle is required, validate source and use restricted unpicklers

5. **Hardcoded Secrets** ⚠️
   - **Files**: Various scripts loading secrets from files/env
   - **Risk**: Secrets may be exposed in logs, process lists, or shell history
   - **TODO**: Use secure secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
   - **TODO**: Never log secrets
   - **TODO**: Use secure file permissions for config files

## 🛡️ Security Best Practices

### API Endpoints

#### CORS Configuration
```typescript
// ✅ GOOD: Use secure CORS utility
import { setCorsHeaders } from '~/server/utils/cors';

export default defineEventHandler(async (event) => {
  setCorsHeaders(event);
  // ... rest of handler
});
```

#### Authentication
```typescript
// ✅ GOOD: Validate user ID format
const userId = getCookie(event, 'user-id');
if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Authentication required',
  });
}

// ⚠️ TODO: Add session/token validation
// In production, validate userId against session store or JWT
```

#### Input Validation
```typescript
// ✅ GOOD: Validate and sanitize inputs
if (!body || typeof body !== 'object') {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
  });
}

// Validate specific fields
if (typeof body.value !== 'number' || body.value < 0) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid value',
  });
}
```

### Command Execution

#### ❌ BAD: String Concatenation
```javascript
// DON'T: Direct string interpolation
execSync(`command ${userInput}`);
```

#### ✅ GOOD: Argument Arrays
```javascript
// DO: Use argument arrays
import { execSync } from 'child_process';

// Sanitize input
const sanitized = userInput.replace(/[^a-zA-Z0-9_-]/g, '');

// Use argument array
execSync('command', {
  args: [sanitized],
  stdio: 'pipe'
});
```

### File Operations

#### ❌ BAD: Direct Path Usage
```javascript
// DON'T: Use user input directly
fs.writeFileSync(userPath, data);
```

#### ✅ GOOD: Path Validation
```javascript
// DO: Validate and sanitize paths
import path from 'path';

function validatePath(userPath: string, baseDir: string): string {
  // Resolve to absolute path
  const resolved = path.resolve(baseDir, userPath);

  // Ensure it's within base directory
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('Path traversal detected');
  }

  // Check for dangerous patterns
  if (resolved.includes('..') || resolved.includes('~')) {
    throw new Error('Invalid path');
  }

  return resolved;
}

const safePath = validatePath(userPath, '/allowed/directory');
fs.writeFileSync(safePath, data);
```

### Secret Management

#### ❌ BAD: Hardcoded Secrets
```javascript
// DON'T: Hardcode secrets
const API_KEY = 'sk-1234567890';
```

#### ✅ GOOD: Environment Variables
```javascript
// DO: Use environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY not configured');
}
```

#### ✅ BETTER: Secure Secret Management
```javascript
// DO: Use secret management service
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'api-key' });
const API_KEY = JSON.parse(secret.SecretString).apiKey;
```

### Data Serialization

#### ❌ BAD: Untrusted Pickle
```python
# DON'T: Load untrusted pickle files
import pickle
data = pickle.load(open(user_file, 'rb'))
```

#### ✅ GOOD: Safe Alternatives
```python
# DO: Use JSON or other safe formats
import json
data = json.load(open(user_file, 'r'))

# OR: Use msgpack
import msgpack
data = msgpack.unpackb(open(user_file, 'rb').read())
```

## 🔐 Authentication Recommendations

### Current State
- Cookie-based user identification
- Format validation only
- No session/token verification

### Recommended Implementation

#### Option 1: Session-Based Authentication
```typescript
// Use Nuxt session module
import { useSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
  const session = await useSession(event);

  if (!session.data?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    });
  }

  const userId = session.data.userId;
  // ... rest of handler
});
```

#### Option 2: JWT-Based Authentication
```typescript
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;
    // ... rest of handler
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    });
  }
});
```

## 📋 Security Checklist

### For New API Endpoints
- [ ] Use `setCorsHeaders()` for CORS
- [ ] Validate all inputs
- [ ] Sanitize user-provided data
- [ ] Implement proper authentication
- [ ] Use parameterized queries (if using database)
- [ ] Rate limiting (if needed)
- [ ] Log security events

### For Scripts
- [ ] Never use string concatenation for commands
- [ ] Validate file paths before operations
- [ ] Use secure secret management
- [ ] Never log secrets
- [ ] Set proper file permissions

### For Data Processing
- [ ] Avoid untrusted deserialization
- [ ] Validate data schemas
- [ ] Use safe serialization formats
- [ ] Sanitize data before processing

## 🚨 Incident Response

If a security vulnerability is discovered:

1. **Immediate**: Assess the risk and impact
2. **Containment**: Disable affected functionality if critical
3. **Fix**: Implement proper security measures
4. **Document**: Update this document with the fix
5. **Review**: Audit for similar issues elsewhere

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Nuxt Security](https://nuxt.com/docs/guide/going-further/security)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 🔄 Regular Security Tasks

- [ ] Monthly security audit
- [ ] Dependency vulnerability scanning
- [ ] Review and update security guidelines
- [ ] Test authentication mechanisms
- [ ] Review access logs for suspicious activity

