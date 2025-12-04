/* ESLint Flat Config for Nuxt 4 + Vue 3 + TypeScript + Prettier */

module.exports = [
  {
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
      'instantsearch-app/dist/**',
      '.output/**',
      'venv/Lib/**',
      'python_api/__pycache__/**',
      'mcp-servers/**',
      'svgl-mcp-server/**',
      'pwsh/**'
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
      prettier: require('eslint-plugin-prettier'),
      tailwindcss: require('eslint-plugin-tailwindcss'),
      css: require('eslint-plugin-css')
    },
    rules: {
      'prettier/prettier': 'error',
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Auto-fixable TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      // Vue-specific auto-fix rules
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      'vue/no-multiple-template-root': 'off',
      // Import organization (auto-fixable)
      // 'import/order': [
      //   'error',
      //   {
      //     groups: [
      //       'builtin',
      //       'external',
      //       'internal',
      //       'parent',
      //       'sibling',
      //       'index'
      //     ],
      //     'newlines-between': 'always',
      //     alphabetize: {
      //       order: 'asc',
      //       caseInsensitive: true
      //     }
      //   }
      // ],
      // 'import/no-duplicates': 'error',
      // 'import/no-unresolved': 'off', // Disabled for better performance
      // Code quality rules (auto-fixable)
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      // Accessibility (auto-fixable for Vue)
      'vue/require-default-prop': 'error',
      'vue/require-prop-types': 'error',
      'vue/no-unused-components': 'warn',
      // Function complexity and structure
      // 'max-lines': ['warn', 300],
      // 'max-depth': ['warn', 4],
      // complexity: ['warn', 10],
      // Consistent naming
      camelcase: ['error', { properties: 'never' }],
      // 'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 100, 1000] }],
      // Tailwind CSS
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off'
    }
  },
  {
    files: ['**/*.css', '**/*.vue'],
    rules: {
      // Disable CSS parsing for @apply directives
      'css/no-unknown-at-rules': 'off'
    }
  },
  {
    files: ['**/*.js'],
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
      'mcp-servers/**',
      'svgl-mcp-server/**',
      'pwsh/**'
    ],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.css'],
    rules: {
      // Disable CSS parsing for all CSS files
    }
  }
]
