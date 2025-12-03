/* ESLint Flat Config for Nuxt 4 + Vue 3 + TypeScript + Prettier */
const vueParser = require('vue-eslint-parser')
const tsParser = require('@typescript-eslint/parser')
const vuePlugin = require('eslint-plugin-vue')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'venv/**',
      '__pycache__/**',
      'python_api/trained_models/**',
      'screenshots/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      'data/**',
      'archive/**',
      'instantsearch-app/dist/**',
      '.output/**',
      'venv/Lib/**',
      'python_api/__pycache__/**',
    ],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
]
