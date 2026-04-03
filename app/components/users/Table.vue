<script setup lang="ts">
import type { UsersQuery } from '~~/graphql/generated/graphql';
import type { AdminAction } from '~/types/users';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

type UserItem = UsersQuery['users'][number];

defineProps<{
  items: UserItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean;
}>();

const { t } = useI18n();

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
    class="bg-transparent flex-grow-1"
    fixed-header
    :items-per-page="-1"
    :no-data-text="$t('noDataAvailable')"
  >
    <template #bottom></template>

    <template #[`item.avatar`]="{ item }">
      <v-avatar color="secondary" size="40">
        <v-img
          v-if="item.profile?.avatar"
          :src="item.profile?.avatar"
          alt="Avatar"
        ></v-img>
        <span v-else class="text-h6">{{
          item.email?.charAt(0).toUpperCase()
        }}</span>
      </v-avatar>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="flex items-center justify-end">
        <v-menu v-if="canEdit">
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(action, idx) in adminActions"
              :key="idx"
              :value="idx"
              @click="action.action(item.id)"
            >
              <v-list-item-title>{{ action.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          v-else
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          :to="`/users/${item.id}/profile`"
        ></v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<style scoped>
:deep(.v-data-table__td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
</style>
