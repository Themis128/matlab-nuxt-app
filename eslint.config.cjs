/* ESLint Flat Config for Nuxt 4 + Vue 3 + TypeScript + Prettier */

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
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: require('@typescript-eslint/parser'),
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      vue: require('eslint-plugin-vue'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier')
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
]
