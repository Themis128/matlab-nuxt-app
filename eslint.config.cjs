/* eslint-env node */
/* ESLint Flat Config for Nuxt 4 + Vue 3 + TypeScript + Prettier */

const pluginVue = require('eslint-plugin-vue');
const pluginTypeScript = require('@typescript-eslint/eslint-plugin');
const parserTypeScript = require('@typescript-eslint/parser');
const parserVue = require('vue-eslint-parser');
const pluginPrettier = require('eslint-plugin-prettier');

const vueRecommended = pluginVue.configs['flat/recommended'];
const baseConfig = {
  files: ['**/*.{js,ts,vue}'],
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
    'mcp-servers/**',
    'pwsh/**',
  ],
  languageOptions: {
    parser: parserVue,
    parserOptions: {
      parser: parserTypeScript,
      ecmaVersion: 'latest',
      sourceType: 'module',
      extraFileExtensions: ['.vue'],
    },
  },
  plugins: {
    '@typescript-eslint': pluginTypeScript,
    prettier: pluginPrettier,
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    // TypeScript essential rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-var-requires': 'error',
    // Vue essential rules
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
  },
};

module.exports = [...vueRecommended, baseConfig];
