<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
    </div>

    <v-snackbar
      v-model="isSnackbar"
      location="top"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ actionMessage }}
    </v-snackbar>

    <ConfirmModal
      v-model="isDeleteModal"
      :title="$t('common.actions.delete')"
      :message="$t('profile.deleteConfirm')"
      :confirm-text="$t('common.actions.delete')"
      :cancel-text="$t('common.actions.cancel')"
      @confirm="positionToDelete && handleDeletePosition(positionToDelete)"
    />

    <PositionsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="positionToEdit"
      @submit="handleSubmitPosition"
    />

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between px-4 pt-4 flex-none">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('employees.search')"
            variant="outlined"
            density="compact"
            rounded
            hide-details
            class="max-w-md"
            style="max-width: 400px"
          ></v-text-field>
          <v-btn
            v-if="isAdmin"
            prepend-icon="mdi-plus"
            variant="text"
            color="primary"
            size="large"
            rounded
            @click="openAddModal"
          >
            {{ $t('common.actions.add') }}
          </v-btn>
        </v-row>
        <PositionsTable
          :items="positions"
          :loading="loading"
          :search="search"
          :admin-actions="adminActions"
          :can-edit="isAdmin"
          class="overflow-y-auto mt-4"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { AdminActionsNames, type AdminAction } from '~/types/users';
import { UserRole } from '~~/graphql/generated/graphql';
import { useTableManager } from '~/composables/useTableManager';

const dictionariesStore = useDictionariesStore();
const { positions, loading } = storeToRefs(dictionariesStore);
const { fetchPositions, createPosition, updatePosition, deletePosition } =
  dictionariesStore;

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const { user: currentUser } = storeToRefs(useAuthStore());

const {
  search,
  isDeleteModal,
  isAddModal,
  isSnackbar,
  actionMessage,
  snackbarColor,
  loadingAction,
  itemToDelete: positionToDelete,
  itemToEdit: positionToEdit,
  openAddModal,
  openEditModal,
  openDeleteModal,
  showSuccess,
  showError,
  closeModals,
} = useTableManager<{ id: string; name: string }>();

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.actions.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const pos = positions.value.find((p) => p.id === id);
      if (pos) {
        openEditModal({ id: pos.id, name: pos.name });
      }
    },
  },
  {
    name: t('common.actions.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      openDeleteModal(id);
    },
  },
];

const handleSubmitPosition = async (formData: {
  id?: string;
  name: string;
}) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updatePosition({
        positionId: formData.id,
        name: formData.name,
      });
      showSuccess(t('common.responses.updateSuccess'));
    } else {
      await createPosition({
        name: formData.name,
      });
      showSuccess(t('common.responses.addSuccess'));
    }
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
  }
};

const handleDeletePosition = async (id: string) => {
  loadingAction.value = true;
  try {
    await deletePosition(id);
    showSuccess(t('common.responses.deleteSuccess'));
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
    closeModals();
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('sidebar.positions'), disabled: true }]);
  fetchPositions();
});
</script>
