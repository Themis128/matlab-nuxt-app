#!/usr/bin/env node

/**
 * CSP Debug Helper
 * Helps debug Content Security Policy violations
 */

console.log('🔍 CSP Debug Helper');
console.log('==================');

// Check environment variables
console.log('\n📋 Environment Configuration:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`DISABLE_CSP: ${process.env.DISABLE_CSP || 'not set'}`);

// CSP violation listener for browser console
const cspViolationListener = `
// Add this to your browser console to monitor CSP violations:
document.addEventListener('securitypolicyviolation', (e) => {
  console.group('🚨 CSP Violation Detected');
  console.log('Violated Directive:', e.violatedDirective);
  console.log('Blocked URI:', e.blockedURI);
  console.log('Original Policy:', e.originalPolicy);
  console.log('Source File:', e.sourceFile);
  console.log('Line Number:', e.lineNumber);
  console.log('Column Number:', e.columnNumber);
  console.groupEnd();
});
`;

console.log('\n🔧 Browser Console Script:');
console.log(cspViolationListener);

// Common CSP fixes
console.log('\n💡 Common CSP Issues & Fixes:');
console.log('');
console.log('1. Browser Extension Issues:');
console.log('   - Extensions inject scripts/iframes that violate CSP');
console.log('   - Solution: Use development CSP or disable extensions');
console.log('');
console.log('2. Iframe Sandbox Issues:');
console.log('   - Iframes with both allow-scripts and allow-same-origin');
console.log('   - Solution: Remove one of these sandbox attributes');
console.log('');
console.log('3. Vimeo/YouTube Embeds:');
console.log('   - External video embeds need frame-src permissions');
console.log('   - Solution: Add video domains to frame-src directive');
console.log('');
console.log('4. Development Tools:');
console.log('   - DevTools, hot reload, etc. need special permissions');
console.log('   - Solution: Use lenient CSP in development');

// Environment-specific recommendations
console.log('\n🎯 Recommendations:');
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production mode detected - using strict CSP');
} else {
  console.log('🔧 Development mode detected');
  console.log('   - CSP is more permissive for browser extensions');
  console.log('   - To disable CSP entirely: set DISABLE_CSP=true');
  console.log('   - To test production CSP: set NODE_ENV=production');
}

console.log('\n🚀 Quick Fixes:');
console.log('1. Disable CSP in development:');
console.log('   export DISABLE_CSP=true');
console.log('');
console.log('2. Test with production CSP:');
console.log('   export NODE_ENV=production');
console.log('');
console.log('3. Check browser extensions:');
console.log('   - Open incognito/private mode');
console.log('   - Disable extensions one by one');
console.log('');
console.log('4. Monitor violations in browser:');
console.log('   - Paste the console script above');
console.log('   - Check Network tab for blocked requests');
