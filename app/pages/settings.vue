<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
    </div>

    <div
      class="w-full flex min-h-0 overflow-y-auto gap-3 flex-col pt-4"
      style="width: 768px; margin: 0 auto"
    >
      <v-select
        v-model="currentLocale"
        :items="availableLocales"
        item-title="name"
        item-value="code"
        :label="t('settings.language.label')"
        variant="outlined"
        hide-details
        @update:model-value="changeLanguage"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-web" size="20"></v-icon>
        </template>
      </v-select>

      <v-select
        v-model="theme.global.name.value"
        :items="themeOptions"
        item-title="title"
        item-value="value"
        :label="t('settings.theme.label')"
        variant="outlined"
        hide-details
        @update:model-value="saveTheme"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-theme-light-dark" size="20"></v-icon>
        </template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props" :prepend-icon="item.icon"></v-list-item>
        </template>
      </v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';

const { t, locale, locales, setLocale } = useI18n();
useSeoMeta({
  title: t('seo.settings.title'),
  ogTitle: t('seo.settings.title'),
  description: t('seo.settings.description'),
  ogDescription: t('seo.settings.description'),
});
const theme = useTheme();
const { setBreadcrumbs } = useBreadcrumbs();

const currentLocale = ref(locale.value);

const availableLocales = computed(() => locales.value);

const themeOptions = computed(() => [
  {
    title: t('settings.theme.light'),
    value: 'light',
    icon: 'mdi-white-balance-sunny',
  },
  {
    title: t('settings.theme.dark'),
    value: 'dark',
    icon: 'mdi-weather-night',
  },
]);

const changeLanguage = (newLocale: 'en' | 'ru') => {
  setLocale(newLocale);
};

const saveTheme = (newTheme: string | null) => {
  if (newTheme) {
    localStorage.setItem('theme', newTheme);
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('settings.title'), disabled: true }]);

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.global.name.value = savedTheme;
  }
});
</script>
