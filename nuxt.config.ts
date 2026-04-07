// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/apollo',
    'vuetify-nuxt-module',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  ssr: true,

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      graphqlUrl:
        process.env.VITE_GRAPHQL_URL || 'http://localhost:3001/api/graphql',
    },
  },

  apollo: {
    clients: {
      default: {
        httpEndpoint:
          process.env.VITE_GRAPHQL_URL || 'http://localhost:3001/api/graphql',
        httpLinkOptions: {
          credentials: 'include',
        },
      },
    },
  },

  i18n: {
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json',
        name: 'English',
      },
      {
        code: 'ru',
        language: 'ru-RU',
        file: 'ru.json',
        name: 'Русский',
      },
    ],
    defaultLocale: 'ru',
    strategy: 'no_prefix',
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  nitro: {
    devProxy: {
      '/api/graphql': {
        target: 'http://localhost:3001/api/graphql',
        changeOrigin: true,
      },
    },
  },

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              background: '#F5F5F7',
              surface: '#F5F5F7',
              primary: '#C63031',
              secondary: '#ebebeb',
              'on-background': '#2E2E2E',
              'on-surface': '#2E2E2E',
            },
          },
          dark: {
            dark: true,
            colors: {
              background: '#444444',
              surface: '#444444',
              primary: '#C63031',
              secondary: '#CCCCCC',
              'on-background': '#FFFFFF',
              'on-surface': '#FFFFFF',
            },
          },
        },
      },
    },
  },
});
