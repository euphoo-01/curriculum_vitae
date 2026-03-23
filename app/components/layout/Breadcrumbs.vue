<script setup lang="ts">
const { breadcrumbs } = useBreadcrumbs();
</script>

<template>
  <v-breadcrumbs :items="breadcrumbs" density="compact" class="m-0 pt-4 p-0">
    <template #divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>
