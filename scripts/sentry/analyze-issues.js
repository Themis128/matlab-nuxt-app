#!/usr/bin/env node
/**
 * Sentry Issues Analyzer
 *
 * Fetches issues from Sentry and provides actionable recommendations
 * to improve the application.
 */

import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.sentry') });
dotenv.config();

// Support both naming conventions
// SECURITY: Never hardcode secrets in source code
// Always use environment variables or secure secret management
const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG || 'baltzakisthemiscom';
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;

// Validate that token is provided
if (!SENTRY_AUTH_TOKEN) {
  console.error('❌ SENTRY_AUTH_TOKEN not found in environment variables');
  console.error('   Set it in .env.sentry or export it before running this script');
  console.error('   Never commit tokens to source control');
  process.exit(1);
}

if (!SENTRY_ORG || !SENTRY_AUTH_TOKEN) {
  console.error('❌ Missing Sentry configuration');
  console.error('   Set SENTRY_ORG and SENTRY_AUTH_TOKEN in .env.sentry');
  process.exit(1);
}

/**
 * Fetch issues from Sentry API
 */
async function fetchIssues(limit = 50) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      query: 'is:unresolved',
      sort: 'freq', // Sort by frequency (most frequent first) - valid values: date, new, priority, freq, user
    });

    const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch issues:', error.message);
    return [];
  }
}

/**
 * Analyze issues and provide recommendations
 */
function analyzeIssues(issues) {
  const recommendations = [];
  const patterns = {
    javascript: [],
    network: [],
    performance: [],
    security: [],
    other: [],
  };

  // Categorize issues
  issues.forEach((issue) => {
    const title = issue.title?.toLowerCase() || '';
    const type = issue.type || '';

    // JavaScript errors
    if (
      title.includes('error') ||
      title.includes('exception') ||
      title.includes('undefined') ||
      title.includes('null') ||
      type === 'error'
    ) {
      patterns.javascript.push(issue);
    }
    // Network errors
    else if (
      title.includes('network') ||
      title.includes('fetch') ||
      title.includes('request') ||
      title.includes('timeout') ||
      title.includes('cors')
    ) {
      patterns.network.push(issue);
    }
    // Performance issues
    else if (
      title.includes('slow') ||
      title.includes('performance') ||
      title.includes('timeout') ||
      type === 'performance'
    ) {
      patterns.performance.push(issue);
    }
    // Security issues
    else if (
      title.includes('security') ||
      title.includes('unauthorized') ||
      title.includes('forbidden') ||
      title.includes('xss') ||
      title.includes('csrf')
    ) {
      patterns.security.push(issue);
    } else {
      patterns.other.push(issue);
    }
  });

  // Generate recommendations
  if (patterns.javascript.length > 0) {
    recommendations.push({
      category: 'JavaScript Errors',
      count: patterns.javascript.length,
      priority: 'high',
      issues: patterns.javascript.slice(0, 5),
      recommendations: [
        'Add error boundaries in Vue components',
        'Implement proper null/undefined checks',
        'Add TypeScript strict mode for better type safety',
        'Use optional chaining (?.) and nullish coalescing (??)',
        'Add try-catch blocks around async operations',
      ],
    });
  }

  if (patterns.network.length > 0) {
    recommendations.push({
      category: 'Network Errors',
      count: patterns.network.length,
      priority: 'high',
      issues: patterns.network.slice(0, 5),
      recommendations: [
        'Implement retry logic for failed requests',
        'Add request timeout handling',
        'Implement proper CORS configuration',
        'Add network error user feedback',
        'Use exponential backoff for retries',
      ],
    });
  }

  if (patterns.performance.length > 0) {
    recommendations.push({
      category: 'Performance Issues',
      count: patterns.performance.length,
      priority: 'medium',
      issues: patterns.performance.slice(0, 5),
      recommendations: [
        'Implement code splitting and lazy loading',
        'Optimize images and assets',
        'Add performance monitoring',
        'Implement caching strategies',
        'Review and optimize database queries',
      ],
    });
  }

  if (patterns.security.length > 0) {
    recommendations.push({
      category: 'Security Issues',
      count: patterns.security.length,
      priority: 'critical',
      issues: patterns.security.slice(0, 5),
      recommendations: [
        'Review authentication and authorization',
        'Implement CSRF protection',
        'Sanitize user inputs',
        'Review API security',
        'Implement rate limiting',
      ],
    });
  }

  // Top issues by frequency
  const topIssues = issues.sort((a, b) => b.count - a.count).slice(0, 10);

  return {
    total: issues.length,
    patterns,
    recommendations,
    topIssues,
  };
}

/**
 * Generate fix suggestions for specific issues
 */
function generateFixSuggestions(issue) {
  const suggestions = [];
  const title = issue.title?.toLowerCase() || '';

  // Common error patterns
  if (title.includes('undefined') || title.includes('cannot read property')) {
    suggestions.push({
      type: 'Null Safety',
      fix: 'Add optional chaining and null checks',
      example: `// Before: obj.property.method()
// After: obj?.property?.method() ?? defaultValue`,
    });
  }

  if (title.includes('network') || title.includes('fetch failed')) {
    suggestions.push({
      type: 'Error Handling',
      fix: 'Add retry logic and error handling',
      example: `async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}`,
    });
  }

  if (title.includes('timeout')) {
    suggestions.push({
      type: 'Performance',
      fix: 'Increase timeout or optimize slow operations',
      example: `// Add timeout to fetch requests
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000)
const response = await fetch(url, { signal: controller.signal })
clearTimeout(timeoutId)`,
    });
  }

  return suggestions;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing Sentry Issues...\n');
  console.log('='.repeat(60));

  const issues = await fetchIssues(50);

  if (issues.length === 0) {
    console.log('✅ No unresolved issues found!');
    console.log('   Your application is running smoothly.');
    return;
  }

  console.log(`📊 Found ${issues.length} unresolved issues\n`);

  const analysis = analyzeIssues(issues);

  // Display summary
  console.log('📈 Issue Categories:');
  console.log(`   JavaScript Errors: ${analysis.patterns.javascript.length}`);
  console.log(`   Network Errors: ${analysis.patterns.network.length}`);
  console.log(`   Performance Issues: ${analysis.patterns.performance.length}`);
  console.log(`   Security Issues: ${analysis.patterns.security.length}`);
  console.log(`   Other: ${analysis.patterns.other.length}\n`);

  // Display top issues
  console.log('🔥 Top 10 Most Frequent Issues:');
  analysis.topIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.title}`);
    console.log(`   Count: ${issue.count} | Users: ${issue.userCount}`);
    console.log(`   Level: ${issue.level} | Status: ${issue.status}`);
    console.log(`   Link: ${issue.permalink}`);

    const suggestions = generateFixSuggestions(issue);
    if (suggestions.length > 0) {
      console.log(`   💡 Quick Fix:`);
      suggestions.forEach((s) => {
        console.log(`      ${s.type}: ${s.fix}`);
      });
    }
  });

  // Display recommendations
  console.log('\n\n💡 Recommendations by Category:\n');
  analysis.recommendations.forEach((rec) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(
      `📋 ${rec.category} (${rec.count} issues) - Priority: ${rec.priority.toUpperCase()}`
    );
    console.log('='.repeat(60));

    rec.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    if (rec.issues.length > 0) {
      console.log(`\n   Example Issues:`);
      rec.issues.slice(0, 3).forEach((issue) => {
        console.log(`   - ${issue.title} (${issue.count} occurrences)`);
      });
    }
  });

  // Generate action items
  console.log('\n\n✅ Action Items:\n');
  console.log('='.repeat(60));

  const actionItems = [];
  analysis.recommendations.forEach((rec) => {
    if (rec.priority === 'critical' || rec.priority === 'high') {
      actionItems.push(...rec.recommendations.slice(0, 2));
    }
  });

  actionItems.slice(0, 10).forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('📝 Next Steps:');
  console.log('   1. Review the top issues and prioritize fixes');
  console.log('   2. Implement the recommended fixes');
  console.log('   3. Add error boundaries and better error handling');
  console.log('   4. Monitor improvements in Sentry dashboard');
  console.log('   5. Set up alerts for critical errors');
}

main().catch(console.error);
