module.exports = {
  // Disable HTML plugin for Vue files to avoid parsing bugs
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
      },
    },
  ],
  // Use single quotes for consistency
  singleQuote: true,
  // Use semicolons
  semi: true,
  // Tab width
  tabWidth: 2,
  // Use spaces instead of tabs
  useTabs: false,
  // Print width
  printWidth: 100,
  // Trailing commas
  trailingComma: 'es5',
};
