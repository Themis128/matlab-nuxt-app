/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './app/pages/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    // Use semantic color names for better maintainability
    themes: [
      {
        light: {
          ...require('daisyui/theme/object.js')['light'],
          primary: '#a855f7', // Purple to match your brand
          secondary: '#3b82f6', // Blue accent
          accent: '#10b981', // Green
          neutral: '#1f2937',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        dark: {
          ...require('daisyui/theme/object.js')['dark'],
          primary: '#c084fc', // Lighter purple for dark mode
          secondary: '#60a5fa', // Lighter blue
          accent: '#34d399', // Lighter green
          neutral: '#f3f4f6',
          'base-100': '#1f2937',
          'base-200': '#374151',
          'base-300': '#4b5563',
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
    darkTheme: 'dark',
    base: true, // Apply base styles
    styled: true, // Include component styles
    utils: true, // Include utility classes
    prefix: '', // No prefix for daisyUI classes
    logs: false, // Disable logs in production
    themeRoot: ':root', // CSS variable root
    rtl: false, // Left-to-right layout
  },
}
