// Flat ESLint config for Nuxt 4 + Vue 3 + TypeScript + Prettier
const tsParser = require('@typescript-eslint/parser')
const vueParser = require('vue-eslint-parser')
const vuePlugin = require('eslint-plugin-vue')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
  {
    ignores: [
      'node_modules',
      '.nuxt',
      '**/.nuxt/**',
      '.output',
      '**/.output/**',
      'dist',
      '**/dist/**',
      'instantsearch-app/dist',
      'playwright-report',
      'venv',
      '__pycache__',
      'python_api/trained_models',
    ],
  },
  {
    files: ['**/*.{ts,js,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Vue rules
      'vue/multi-word-component-names': 'off',
      // TypeScript tweaks
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Prettier integration
      'prettier/prettier': ['error'],
      // Console restrictions (allow info/debug for scripts)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
