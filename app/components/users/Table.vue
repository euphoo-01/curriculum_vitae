<script setup lang="ts">
import type { UsersQuery } from '~~/graphql/generated/graphql';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

type UserItem = UsersQuery['users'][number];

defineProps<{
  items: UserItem[];
  loading?: boolean;
  search?: string;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const headers = computed(() => [
  { title: '', key: 'avatar', sortable: false, width: '60px' },
  { title: t('firstName'), key: 'profile.first_name', sortable: true },
  { title: t('lastName'), key: 'profile.last_name', sortable: true },
  { title: t('email'), key: 'email', sortable: true },
  { title: t('department'), key: 'department_name', sortable: true },
  { title: t('position'), key: 'position_name', sortable: true },
  { title: '', key: 'actions', sortable: false },
]);
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    item-value="id"
    density="comfortable"
    class="bg-transparent d-flex flex-column flex-grow-1 min-h-0"
    fixed-header
    height="100%"
    :items-per-page="-1"
    :no-data-text="$t('noDataAvailable')"
  >
    <template #bottom></template>

    <template #[`item.avatar`]="{ item }">
      <v-avatar color="grey" size="40">
        <v-img
          v-if="item.profile?.avatar"
          :src="item.profile?.avatar"
          alt="Avatar"
        ></v-img>
        <span v-else class="text-h6 text-white">{{
          item.email?.charAt(0).toUpperCase()
        }}</span>
      </v-avatar>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="flex items-center justify-end">
        <v-btn
          v-if="item.id === authStore.userId"
          icon="mdi-dots-vertical"
          variant="text"
          size="small"
          class="mr-2"
          @click.stop="router.push('/profile')"
        ></v-btn>
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          @click.stop="router.push(`/users/${item.id}`)"
        ></v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<style scoped>
:deep(.v-data-table__td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  border-bottom: 1px solid #e0e0e0;
}
</style>
