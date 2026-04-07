<script setup lang="ts">
import { AdminActionsNames, type AdminAction } from '~/types/users';
import {
  UserRole,
  type GetDepartmentsQuery,
  type GetPositionsQuery,
  type CreateUserInput,
} from '~~/graphql/generated/graphql';
import { useTableManager } from '~/composables/useTableManager';

const dictionariesStore = useDictionariesStore();
const { fetchDepartments, fetchPositions } = dictionariesStore;
const employeesStore = useEmployeesStore();
const { users, loading, error } = storeToRefs(employeesStore);
const { fetchUsers, deleteUser, createUser } = employeesStore;
const { t } = useI18n();
useSeoMeta({
  title: t('seo.users.title'),
  ogTitle: t('seo.users.title'),
  description: t('seo.users.description'),
  ogDescription: t('seo.users.description'),
});
const { setBreadcrumbs } = useBreadcrumbs();

setBreadcrumbs([
  {
    title: t('employees.title'),
    disabled: true,
    to: '/users',
  },
]);

const router = useRouter();

const { user } = storeToRefs(useAuthStore());
let timeout: ReturnType<typeof setTimeout> | null = null;

const {
  search,
  isDeleteModal,
  isAddModal,
  isSnackbar,
  actionMessage: snackbarMessage,
  snackbarColor,
  itemToDelete: userToDelete,
  openDeleteModal,
  showSuccess,
  showError,
} = useTableManager<unknown>();

const departments = ref<GetDepartmentsQuery['departments']>([]);
const positions = ref<GetPositionsQuery['positions']>([]);

const roles: UserRole[] = [];
Object.values(UserRole).forEach((role) => roles.push(role));

const canEdit = computed(() => {
  return (user.value && user.value.role === UserRole.Admin) || false;
});

const adminActions: AdminAction[] = [
  {
    name: t('profile.see'),
    type: AdminActionsNames.SEE,
    action: (id: string) => router.push(`/users/${id}/profile`),
  },
  {
    name: t('profile.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      openDeleteModal(id);
    },
  },
];

const handleCreateUser = async (payload: CreateUserInput) => {
  try {
    await createUser(payload);
    if (error.value) {
      showError(`${t('common.responses.error')}: ${error.value}`);
    } else {
      showSuccess(t('common.responses.addSuccess'));
    }
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }
};

const handleDeleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    await deleteUser(userToDelete.value);
    if (error.value) {
      showError(`${t('common.responses.error')}: ${error.value}`);
    } else {
      showSuccess(t('common.responses.deleteSuccess'));
    }
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }
};

const onSearchInput = (value: string) => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    search.value = value;
  }, 300);
};

await fetchUsers();
const [deps, pos] = await Promise.all([fetchDepartments(), fetchPositions()]);
departments.value = deps;
positions.value = pos;
</script>

<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <v-snackbar
      v-model="isSnackbar"
      location="top"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <ConfirmModal
      v-model="isDeleteModal"
      :title="t('profile.delete')"
      :message="t('profile.deleteConfirm')"
      :confirm-text="t('common.actions.delete')"
      :cancel-text="t('common.actions.cancel')"
      @confirm="handleDeleteUser"
    />

    <UsersAddModal
      v-model="isAddModal"
      :loading="loading"
      :departments="departments"
      :positions="positions"
      :roles="roles"
      @submit="handleCreateUser"
    />

    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
    </div>

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full mb-4">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between items-center p-4 flex-none">
          <v-text-field
            :model-value="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('employees.search')"
            variant="outlined"
            density="compact"
            rounded
            hide-details
            class="max-w-md"
            style="max-width: 400px"
            @update:model-value="onSearchInput"
          ></v-text-field>

          <v-btn
            v-if="canEdit"
            prepend-icon="mdi-plus"
            variant="text"
            color="primary"
            size="large"
            rounded
            @click="isAddModal = true"
          >
            {{ t('profile.create') }}
          </v-btn>
        </v-row>

        <div class="flex-grow overflow-y-auto">
          <UsersTable
            :items="users"
            :loading="loading"
            :search="search"
            :admin-actions="adminActions"
            :can-edit="canEdit"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
