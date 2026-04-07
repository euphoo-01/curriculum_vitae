<script setup lang="ts">
import type { AdminAction } from '~/types/users';
import type { SkillItem } from '~/types/skills';

defineProps<{
  items: SkillItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean;
}>();

const { t } = useI18n();

const headers = computed(() => [
  { title: t('skills.name'), key: 'name', sortable: true },
  { title: t('skills.category'), key: 'category_name', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]);
</script>

<template>
  <v-data-table
    data-test-id="skills-table"
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    item-value="id"
    density="comfortable"
    class="bg-transparent h-full flex flex-col"
    fixed-header
    :items-per-page="10"
    :no-data-text="$t('common.noData')"
  >
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
