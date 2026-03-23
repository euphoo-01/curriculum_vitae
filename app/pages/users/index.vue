<script setup lang="ts">
import { onMounted, ref } from 'vue';
const { t } = useI18n();

useBreadcrumbs([
  {
    title: t('usersTitle'),
    disabled: true,
    to: '/users',
  },
]);

const { users, loading, fetchUsers } = useUsers();
const search = ref('');
let timeout: ReturnType<typeof setTimeout> | null = null;

const onSearchInput = (value: string) => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    search.value = value;
  }, 300);
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <LayoutBreadcrumbs class="ml-4 flex-none" />
    <v-card flat rounded class="d-flex flex-column flex-none min-h-0">
      <v-card-text class="pa-0 d-flex flex-column flex-grow-1 min-h-0">
        <v-text-field
          :model-value="search"
          prepend-inner-icon="mdi-magnify"
          :placeholder="$t('searchUsers')"
          variant="outlined"
          density="compact"
          rounded
          hide-details
          class="max-w-md"
          style="max-width: 400px"
          @update:model-value="onSearchInput"
        ></v-text-field>
        <UsersTable
          :items="users"
          :loading="loading"
          :search="search"
          class="h-screen"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
