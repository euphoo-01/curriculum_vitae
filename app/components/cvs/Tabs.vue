<script setup lang="ts">
import { computed } from 'vue';

const { t } = useI18n();
const route = useRoute();
const cvId = route.params.cvId as string;

const cvTabs = computed(() => [
  {
    title: t('cvs.tabs.details'),
    to: `/cvs/${cvId}/details`,
    value: 'details',
  },
  {
    title: t('cvs.tabs.skills'),
    to: `/cvs/${cvId}/skills`,
    value: 'skills',
  },
  {
    title: t('cvs.tabs.projects'),
    to: `/cvs/${cvId}/projects`,
    value: 'projects',
  },
  {
    title: t('cvs.tabs.preview'),
    to: `/cvs/${cvId}/preview`,
    value: 'preview',
  },
]);
</script>

<template>
  <LayoutTabs :items="cvTabs" class="mt-2" data-test-id="cvs-tabs" />
</template>
