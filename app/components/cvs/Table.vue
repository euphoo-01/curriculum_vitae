<script setup lang="ts">
import type { GetAllCvsQuery } from '~~/graphql/generated/graphql';
import type { AdminAction } from '~/types/users';

type CvItem = GetAllCvsQuery['cvs'][number];

defineProps<{
  items: CvItem[];
  loading?: boolean;
  search?: string;
  adminActions: AdminAction[];
  canEdit: boolean | ((item: CvItem) => boolean);
}>();

const { t } = useI18n();

const headers = computed(() => [
  { title: t('cvs.name'), key: 'name', sortable: true },
  { title: t('cvs.description'), key: 'description', sortable: true },
  { title: t('cvs.employee'), key: 'user.profile.full_name', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]);

const getCanEdit = (
  item: CvItem,
  canEditProp: boolean | ((item: CvItem) => boolean)
) => {
  if (typeof canEditProp === 'function') {
    return canEditProp(item);
  }
  return canEditProp;
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
    class="bg-transparent flex flex-col flex-grow min-h-0"
    fixed-header
    height="100%"
    :items-per-page="-1"
    :no-data-text="$t('cvs.noCvs')"
  >
    <template #bottom></template>

    <template #[`item.user.profile.full_name`]="{ item }">
      {{ item.user?.profile?.full_name || item.user?.email }}
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="d-flex justify-end">
        <v-menu v-if="getCanEdit(item, canEdit)">
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
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          :to="`/cvs/${item.id}/preview`"
        ></v-btn>
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
