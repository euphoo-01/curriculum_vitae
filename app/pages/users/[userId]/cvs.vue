<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
      <UsersProfileTabs />
    </div>

    <v-snackbar
      v-model="isSnackbar"
      location="top"
      color="error"
      :timeout="3000"
    >
      {{ actionError }}
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

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between flex-none p-4">
          <v-text-field
            :model-value="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('cvs.search')"
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
            @click="openAddModal"
          >
            {{ $t('cvs.add') }}
          </v-btn>
        </v-row>
        <UsersCvsTable
          :items="cvs || []"
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

const route = useRoute();
const userId = route.params.userId as string;

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const { user: currentUser } = useAuth();
const { user: profileUser, fetchUser } = useProfile();

const { cvs, loading, fetchUserCvs, createCv, updateCv, deleteCv } = useCvs();

const search = ref('');
let timeout: ReturnType<typeof setTimeout> | null = null;

const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionError = ref('');
const loadingAction = ref(false);

const cvToDelete = ref<string>();
const cvToEdit = ref<{ id: string; name: string; description: string } | null>(
  null
);

const canEdit = computed(() => {
  if (!currentUser.value || !profileUser.value) return false;
  return (
    String(currentUser.value.id) === String(profileUser.value.id) ||
    currentUser.value.role === UserRole.Admin
  );
});

const adminActions: AdminAction[] = [
  {
    name: t('cvs.see'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      navigateTo(`/cvs/${id}/details`);
    },
  },
  {
    name: t('cvs.edit'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const cv = cvs.value?.find((c) => c.id === id);
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
  actionError.value = '';
  try {
    if (formData.id) {
      await updateCv({
        cvId: formData.id,
        name: formData.name,
        description: formData.description,
      });
    } else {
      await createCv({
        name: formData.name,
        description: formData.description,
        userId: userId,
      });
    }
    isAddModal.value = false;
    await fetchUserCvs(userId);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteCv = async (id: string) => {
  loadingAction.value = true;
  actionError.value = '';
  try {
    await deleteCv(id);
    isDeleteModal.value = false;
    await fetchUserCvs(userId);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const onSearchInput = (value: string) => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    search.value = value;
  }, 300);
};

await fetchUser(userId);
await fetchUserCvs(userId);

if (userId) {
  setBreadcrumbs([
    { title: t('sidebarUsers'), to: '/users' },
    {
      title: profileUser.value?.profile.full_name || t('profile.title'),
      to: `/users/${userId}/profile`,
    },
    {
      title: t('cvs.title'),
      disabled: true,
    },
  ]);
}
</script>
