<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <div class="d-flex flex-column bg-background shadow-sm mb-4 px-4">
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

    <v-card
      flat
      rounded
      class="d-flex flex-column flex-none overflow-scroll min-h-0 mx-4"
    >
      <v-card-text class="pa-0 d-flex flex-column flex-grow-1 min-h-0">
        <v-row class="justify-between">
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
          class="h-screen mt-4"
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

const { cvs, loading, fetchCvs, createCv, updateCv, deleteCv } = useCvs();

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
    await fetchCvs(userId);
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
    await deleteCv({ cvId: id });
    isDeleteModal.value = false;
    await fetchCvs(userId);
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
await fetchCvs(userId);

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
