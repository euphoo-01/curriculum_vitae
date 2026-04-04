<script setup lang="ts">
import { AdminActionsNames, type AdminAction } from '~/types/users';
import {
  UserRole,
  type GetDepartmentsQuery,
  type GetPositionsQuery,
  type CreateUserInput,
} from '~~/graphql/generated/graphql';

const dictionariesStore = useDictionariesStore();
const { fetchDepartments, fetchPositions } = dictionariesStore;
const employeesStore = useEmployeesStore();
const { users, loading, error } = storeToRefs(employeesStore);
const { fetchUsers, deleteUser, createUser } = employeesStore;
const { t } = useI18n();
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
const search = ref('');

let timeout: ReturnType<typeof setTimeout> | null = null;
const userToDelete = ref<string>();
const isDeleteModal = ref<boolean>(false);
const isAddModal = ref<boolean>(false);
const isSnackbar = ref<boolean>(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

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
      userToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const handleCreateUser = async (payload: CreateUserInput) => {
  try {
    await createUser(payload);
    if (error.value) {
      snackbarMessage.value = `${t('common.responses.error')}: ${error.value}`;
      snackbarColor.value = 'error';
      isSnackbar.value = true;
    } else {
      snackbarMessage.value = t('common.responses.addSuccess');
      snackbarColor.value = 'success';
      isSnackbar.value = true;
      isAddModal.value = false;
    }
  } catch (e) {
    snackbarMessage.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  }
};

const handleDeleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    await deleteUser(userToDelete.value);
    if (error.value) {
      snackbarMessage.value = `${t('common.responses.error')}: ${error.value}`;
      snackbarColor.value = 'error';
      isSnackbar.value = true;
    } else {
      snackbarMessage.value = t('common.responses.deleteSuccess');
      snackbarColor.value = 'success';
      isSnackbar.value = true;
      isDeleteModal.value = false;
    }
  } catch (e) {
    snackbarMessage.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    snackbarColor.value = 'error';
    isSnackbar.value = true;
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
