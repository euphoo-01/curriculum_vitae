<script setup lang="ts">
export interface TabItem {
  title: string;
  to: string;
  value: string;
}

defineProps<{
  items: TabItem[];
}>();

const route = useRoute();
</script>

<template>
  <div class="w-full">
    <v-tabs :model-value="route.path" color="primary" align-tabs="start">
      <v-tab
        v-for="item in items"
        :key="item.value"
        :value="item.to"
        :to="item.to"
        density="comfortable"
        class="px-8"
      >
        {{ item.title }}
      </v-tab>
    </v-tabs>
  </div>
</template>
