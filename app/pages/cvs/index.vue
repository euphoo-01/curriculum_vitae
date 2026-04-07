<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
    </div>

    <v-snackbar
      v-model="isSnackbar"
      data-test-id="snackbar"
      location="top"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ actionMessage }}
    </v-snackbar>

    <ConfirmModal
      v-model="isDeleteModal"
      :title="$t('common.actions.delete')"
      :message="$t('cvs.deleteConfirm')"
      :confirm-text="$t('common.actions.delete')"
      :cancel-text="$t('common.actions.cancel')"
      @confirm="cvToDelete && handleDeleteCv(cvToDelete)"
    />

    <UsersCvsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="cvToEdit"
      @submit="handleSubmitCv"
    />

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between px-4 pt-4 flex-none">
          <v-text-field
            v-model="search"
            data-test-id="search-input"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('cvs.search')"
            variant="outlined"
            density="compact"
            rounded
            hide-details
            class="max-w-md"
            style="max-width: 400px"
          ></v-text-field>
          <v-btn
            data-test-id="add-button"
            prepend-icon="mdi-plus"
            variant="text"
            color="primary"
            size="large"
            rounded
            @click="openAddModal"
          >
            {{ $t('cvs.add') }}
          </v-btn>
        </v-row>
        <CvsTable
          data-test-id="cvs-table"
          :items="allCvs"
          :loading="loading"
          :search="search"
          :admin-actions="adminActions"
          :can-edit="canEdit"
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

const cvsStore = useCvsStore();
const { allCvs, loading } = storeToRefs(cvsStore);
const { fetchAllCvs, createCv, updateCv, deleteCv } = cvsStore;

const { t } = useI18n();
useSeoMeta({
  title: t('seo.cvs.title'),
  ogTitle: t('seo.cvs.title'),
  description: t('seo.cvs.description'),
  ogDescription: t('seo.cvs.description'),
});
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
  itemToDelete: cvToDelete,
  itemToEdit: cvToEdit,
  openAddModal,
  openEditModal,
  openDeleteModal,
  showSuccess,
  showError,
  closeModals,
} = useTableManager<{ id: string; name: string; description: string }>();

const canEdit = (item: { user?: { id: string } | null }) => {
  if (!currentUser.value) return false;
  return (
    currentUser.value.role === UserRole.Admin ||
    String(item.user?.id) === String(currentUser.value.id)
  );
};

const adminActions: AdminAction[] = [
  {
    name: t('common.actions.see'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      navigateTo(`/cvs/${id}/details`);
    },
  },
  {
    name: t('common.actions.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const cv = allCvs.value.find((c) => c.id === id);
      if (cv) {
        openEditModal({
          id: cv.id,
          name: cv.name,
          description: cv.description,
        });
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

const handleSubmitCv = async (formData: {
  id?: string;
  name: string;
  description: string;
}) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateCv({
        cvId: formData.id,
        name: formData.name,
        description: formData.description,
      });
      showSuccess(t('common.responses.updateSuccess'));
    } else {
      await createCv({
        name: formData.name,
        description: formData.description,
        userId: currentUser.value?.id,
      });
      showSuccess(t('common.responses.addSuccess'));
    }
    await fetchAllCvs();
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteCv = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteCv(id);
    showSuccess(t('common.responses.deleteSuccess'));
    await fetchAllCvs();
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
    closeModals();
  }
};

setBreadcrumbs([{ title: t('sidebar.cvs'), disabled: true }]);
await fetchAllCvs();
</script>
