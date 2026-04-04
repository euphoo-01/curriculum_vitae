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
      :title="$t('common.delete')"
      :message="$t('profile.deleteConfirm')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      @confirm="
        departmentToDelete && handleDeleteDepartment(departmentToDelete)
      "
    />

    <DepartmentsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="departmentToEdit"
      @submit="handleSubmitDepartment"
    />

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between px-4 pt-4 flex-none">
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
        <DepartmentsTable
          :items="departments"
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

const dictionariesStore = useDictionariesStore();
const { departments, loading } = storeToRefs(dictionariesStore);
const {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = dictionariesStore;

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const { user: currentUser } = storeToRefs(useAuthStore());

const search = ref('');
const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const departmentToDelete = ref<string>();
const departmentToEdit = ref<{ id: string; name: string } | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const dept = departments.value.find((d) => d.id === id);
      if (dept) {
        departmentToEdit.value = { id: dept.id, name: dept.name };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      departmentToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  departmentToEdit.value = null;
  isAddModal.value = true;
};

const handleSubmitDepartment = async (formData: {
  id?: string;
  name: string;
}) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateDepartment({
        departmentId: formData.id,
        name: formData.name,
      });
      actionMessage.value = t('common.update');
    } else {
      await createDepartment({
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

const handleDeleteDepartment = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteDepartment(id);
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
  setBreadcrumbs([{ title: t('sidebarDepartments'), disabled: true }]);
  fetchDepartments();
});
</script>
