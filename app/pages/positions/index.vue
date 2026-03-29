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
      :message="$t('profile.deleteConfirm')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      @confirm="positionToDelete && handleDeletePosition(positionToDelete)"
    />

    <PositionsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="positionToEdit"
      @submit="handleSubmitPosition"
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
            :placeholder="$t('searchUsers')"
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
            {{ $t('common.add') }}
          </v-btn>
        </v-row>
        <PositionsTable
          :items="positions"
          :loading="loading"
          :search="search"
          :admin-actions="adminActions"
          :can-edit="isAdmin"
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
const {
  positions,
  loading,
  fetchPositions,
  createPosition,
  updatePosition,
  deletePosition,
} = usePositions();

const search = ref('');
const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const positionToDelete = ref<string>();
const positionToEdit = ref<{ id: string; name: string } | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const pos = positions.value.find((p) => p.id === id);
      if (pos) {
        positionToEdit.value = { id: pos.id, name: pos.name };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      positionToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  positionToEdit.value = null;
  isAddModal.value = true;
};

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
      actionMessage.value = t('common.update');
    } else {
      await createPosition({
        name: formData.name,
      });
      actionMessage.value = t('common.add');
    }
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isAddModal.value = false;
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const handleDeletePosition = async (id: string) => {
  loadingAction.value = true;
  try {
    await deletePosition(id);
    actionMessage.value = t('common.delete');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isDeleteModal.value = false;
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('sidebarPositions'), disabled: true }]);
  fetchPositions();
});
</script>
