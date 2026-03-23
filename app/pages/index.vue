<script setup lang="ts">
const { t } = useI18n();

useBreadcrumbs([
  {
    title: t('dashboard'),
    disabled: true,
    to: '/',
  },
]);
</script>

<template>
  <v-container>
    <LayoutBreadcrumbs class="ml-4" />
  </v-container>
</template>
