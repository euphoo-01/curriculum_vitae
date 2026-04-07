<script setup lang="ts">
import type { AdminAction, UserItem } from '~/types/users';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

defineProps<{
  items: UserItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean;
}>();

const { t } = useI18n();
const { width } = useDisplay();

const isMobile = computed(() => width.value <= 768);

const headers = computed(() => {
  const allHeaders = [
    { title: '', key: 'avatar', sortable: false, width: '60px' },
    {
      title: t('common.fields.firstName'),
      key: 'profile.first_name',
      sortable: true,
    },
    {
      title: t('common.fields.lastName'),
      key: 'profile.last_name',
      sortable: true,
    },
    { title: t('common.fields.email'), key: 'email', sortable: true },
    {
      title: t('common.fields.department'),
      key: 'department_name',
      sortable: true,
    },
    {
      title: t('common.fields.position'),
      key: 'position_name',
      sortable: true,
    },
    { title: '', key: 'actions', sortable: false },
  ];

  if (isMobile.value) {
    const mobileKeys = [
      'avatar',
      'profile.first_name',
      'department_name',
      'position_name',
      'actions',
    ];
    return allHeaders.filter((header) => mobileKeys.includes(header.key));
  }

  return allHeaders;
});
</script>

<template>
  <v-data-table
    data-test-id="users-table"
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    item-value="id"
    density="comfortable"
    class="bg-transparent h-full flex flex-col"
    :items-per-page="10"
    :no-data-text="$t('common.noData')"
    fixed-header
  >
    <template #[`item.avatar`]="{ item }">
      <v-avatar size="40">
        <v-img
          v-if="item.profile?.avatar"
          :src="item.profile?.avatar"
          alt="Avatar"
        ></v-img>
        <h6 v-else color="text-on-background">
          {{ item.email?.charAt(0).toUpperCase() }}
        </h6>
      </v-avatar>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="flex items-center justify-end">
        <v-menu v-if="canEdit">
          <template #activator="{ props }">
            <v-btn
              data-test-id="actions-button"
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
          data-test-id="view-button"
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

:deep(.v-table__wrapper) {
  flex-grow: 1;
}
</style>
