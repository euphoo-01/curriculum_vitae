<script setup lang="ts">
import type { GetProjectsQuery } from '~~/graphql/generated/graphql';
import type { AdminAction } from '~/types/users';

type ProjectItem = GetProjectsQuery['projects'][number];

defineProps<{
  items: ProjectItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean;
}>();

const { t } = useI18n();

const headers = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Internal Name', key: 'internal_name', sortable: true },
  { title: 'Domain', key: 'domain', sortable: true },
  { title: 'Start Date', key: 'start_date', sortable: true },
  { title: 'End Date', key: 'end_date', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]);

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return t('common.tillNow', 'Till now');
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    item-value="id"
    density="comfortable"
    class="bg-transparent h-full flex flex-col"
    fixed-header
    :items-per-page="10"
    :no-data-text="$t('noDataAvailable')"
  >
    <template #[`item.start_date`]="{ item }">
      {{ formatDate(item.start_date) }}
    </template>

    <template #[`item.end_date`]="{ item }">
      {{ formatDate(item.end_date) }}
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
      </div>
    </template>
  </v-data-table>
</template>

<style scoped>
:deep(.v-data-table__td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  border-bottom: 1px solid rgb(var(--v-theme-on-surface) / 0.12);
}

:deep(.v-table__wrapper) {
  flex-grow: 1;
}
</style>
