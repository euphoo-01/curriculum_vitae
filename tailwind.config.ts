/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--v-theme-background) / <alpha-value>)',
        surface: 'rgb(var(--v-theme-surface) / <alpha-value>)',
        primary: 'rgb(var(--v-theme-primary) / <alpha-value>)',
        secondary: 'rgb(var(--v-theme-secondary) / <alpha-value>)',
        error: 'rgb(var(--v-theme-error) / <alpha-value>)',
        info: 'rgb(var(--v-theme-info) / <alpha-value>)',
        success: 'rgb(var(--v-theme-success) / <alpha-value>)',
        warning: 'rgb(var(--v-theme-warning) / <alpha-value>)',
        'on-background': 'rgb(var(--v-theme-on-background) / <alpha-value>)',
        'on-surface': 'rgb(var(--v-theme-on-surface) / <alpha-value>)',
        'on-primary': 'rgb(var(--v-theme-on-primary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--v-theme-on-secondary) / <alpha-value>)',
        'on-error': 'rgb(var(--v-theme-on-error) / <alpha-value>)',
        'on-info': 'rgb(var(--v-theme-on-info) / <alpha-value>)',
        'on-success': 'rgb(var(--v-theme-on-success) / <alpha-value>)',
        'on-warning': 'rgb(var(--v-theme-on-warning) / <alpha-value>)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
