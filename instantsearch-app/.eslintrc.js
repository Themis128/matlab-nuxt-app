module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {},
  overrides: [
    {
      files: ['**/mcp-servers/**/template/*.html'],
      rules: {
        'no-unused-expressions': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['.github/workflows/*.yml'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
