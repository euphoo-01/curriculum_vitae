<script setup lang="ts">
import { computed } from 'vue';

const { t } = useI18n();
const route = useRoute();
const userId = route.params.userId as string;

const profileTabs = computed(() => [
  {
    title: t('profile.title'),
    to: `/users/${userId}/profile`,
    value: 'profile',
  },
  {
    title: t('profile.skills'),
    to: `/users/${userId}/skills`,
    value: 'skills',
  },
  {
    title: t('profile.languages'),
    to: `/users/${userId}/languages`,
    value: 'languages',
  },
  {
    title: t('cvs.title'),
    to: `/users/${userId}/cvs`,
    value: 'cvs',
  },
]);
</script>

<template>
  <LayoutTabs :items="profileTabs" class="mt-2" />
</template>
