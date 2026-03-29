<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <div class="d-flex flex-column bg-background shadow-sm mb-4 px-4">
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
      :title="$t('common.delete')"
      :message="$t('cvs.deleteConfirm')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      @confirm="cvToDelete && handleDeleteCv(cvToDelete)"
    />

    <UsersCvsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="cvToEdit"
      @submit="handleSubmitCv"
    />

    <v-card
      flat
      rounded
      class="d-flex flex-column flex-none overflow-scroll min-h-0 mx-4"
    >
      <v-card-text class="pa-0 d-flex flex-column flex-grow-1 min-h-0">
        <v-row class="justify-between px-4 pt-4">
          <v-text-field
            v-model="search"
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
          :items="allCvs"
          :loading="loading"
          :search="search"
          :admin-actions="adminActions"
          :can-edit="canEdit"
          class="h-screen mt-4"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { AdminActionsNames, type AdminAction } from '~/types/users';
import { UserRole } from '~~/graphql/generated/graphql';

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const { user: currentUser } = useAuth();
const { allCvs, loading, fetchAllCvs, createCv, updateCv, deleteCv } = useCvs();

const search = ref('');
const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const cvToDelete = ref<string>();
const cvToEdit = ref<{ id: string; name: string; description: string } | null>(
  null
);

const canEdit = (item: { user?: { id: string } | null }) => {
  if (!currentUser.value) return false;
  return (
    currentUser.value.role === UserRole.Admin ||
    String(item.user?.id) === String(currentUser.value.id)
  );
};

const adminActions: AdminAction[] = [
  {
    name: 'See CV',
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      navigateTo(`/cvs/${id}/details`);
    },
  },
  {
    name: t('common.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const cv = allCvs.value.find((c) => c.id === id);
      if (cv) {
        cvToEdit.value = {
          id: cv.id,
          name: cv.name,
          description: cv.description,
        };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      cvToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  cvToEdit.value = null;
  isAddModal.value = true;
};

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
      actionMessage.value = t('common.update');
    } else {
      await createCv({
        name: formData.name,
        description: formData.description,
        userId: currentUser.value?.id,
      });
      actionMessage.value = t('common.add');
    }
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isAddModal.value = false;
    await fetchAllCvs();
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteCv = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteCv(id);
    actionMessage.value = t('common.delete');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isDeleteModal.value = false;
    await fetchAllCvs();
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('sidebarCVs'), disabled: true }]);
  fetchAllCvs();
});
</script>
