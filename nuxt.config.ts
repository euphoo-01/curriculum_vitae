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
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {},
  },
});
