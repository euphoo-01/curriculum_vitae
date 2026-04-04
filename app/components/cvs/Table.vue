<script setup lang="ts">
import type { GetAllCvsQuery } from '~~/graphql/generated/graphql';
import type { AdminAction } from '~/types/users';

type CvItem = GetAllCvsQuery['cvs'][number];

defineProps<{
  items: CvItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
}>();

const { t } = useI18n();

const headers = computed(() => [
  { title: t('cvs.name'), key: 'name', sortable: true },
  { title: t('cvs.description'), key: 'description', sortable: true },
  // employee column deleted due to incomplete db records.
  // missing User.profile causes GraphQL to fail on GetAllCvs.
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
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
    class="bg-transparent h-full flex flex-col"
    fixed-header
    :items-per-page="10"
    :no-data-text="$t('cvs.noCvs')"
  >
    <template #[`item.actions`]="{ item }">
      <div class="d-flex justify-end">
        <!-- backend returns not all cvs in the project, but only
       cvs, that pinned to current user (if not admin) -->
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
              @click.stop
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
