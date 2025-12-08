#!/usr/bin/env node
/**
 * Snyk False Positives Ignore Script
 *
 * This script helps ignore false positive security warnings in Snyk Code.
 * Run this after confirming all issues are indeed false positives.
 *
 * Usage:
 *   node scripts/snyk/ignore-false-positives.js
 *
 * Or run individual ignores:
 *   snyk ignore --id=<FINDING_ID> --reason="<REASON>" --expiry=2025-12-31
 */

// No unused imports needed

// False positive findings with their reasons
const falsePositives = [
  {
    id: '026fd526-2a0d-4cb7-8eda-52dad474641d',
    file: 'scripts/check-critical-todos.js',
    reason:
      'Path validation occurs before path.resolve() and file operations. All paths are validated to be within working directory and checked for path traversal sequences.',
  },
  {
    id: '4c57baac-10b3-49b9-b07b-671ad1bf48e4',
    file: 'python_api/prepare_engineered_dataset.py',
    reason:
      'Path validation using os.path.abspath() occurs before Path() creation. Output path is validated to be within working directory and checked for path traversal sequences.',
  },
  // Add more Finding IDs as needed from: npm run snyk:test:code
];

const EXPIRY_DATE = '2025-12-31';

console.log('🔒 Snyk False Positives Ignore Script\n');
console.log('This will ignore the following false positive security warnings:\n');

falsePositives.forEach((fp, index) => {
  console.log(`${index + 1}. ${fp.file}`);
  console.log(`   ID: ${fp.id}`);
  console.log(`   Reason: ${fp.reason}\n`);
});

console.log(`\n⚠️  WARNING: Only run this if you have confirmed these are false positives!`);
console.log(`\nTo proceed, run the following commands manually:\n`);

falsePositives.forEach((fp) => {
  const command = `snyk ignore --id=${fp.id} --reason="${fp.reason}" --expiry=${EXPIRY_DATE}`;
  console.log(command);
});

console.log(`\nOr run all at once:\n`);

falsePositives.forEach((fp) => {
  const command = `snyk ignore --id=${fp.id} --reason="${fp.reason}" --expiry=${EXPIRY_DATE}`;
  console.log(`${command} && \\`);
});

console.log(
  `\n💡 Tip: Run 'npm run snyk:test:code' first to get all Finding IDs, then update this script.`
);
