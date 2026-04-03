<script setup lang="ts">
import type { GetSkillsQuery } from '~~/graphql/generated/graphql';
import type { AdminAction } from '~/types/users';

type SkillItem = GetSkillsQuery['skills'][number];

defineProps<{
  items: SkillItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean;
}>();

const { t } = useI18n();

const headers = computed(() => [
  { title: t('skills.skill'), key: 'name', sortable: true },
  { title: 'Category', key: 'category_name', sortable: true },
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
    class="bg-transparent flex flex-col flex-grow min-h-0"
    fixed-header
    height="100%"
    :items-per-page="-1"
    :no-data-text="$t('noDataAvailable')"
  >
    <template #bottom></template>

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
</style>
