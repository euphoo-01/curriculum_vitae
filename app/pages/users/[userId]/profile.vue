<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <div class="d-flex flex-column bg-background shadow-sm mb-4 px-4">
      <LayoutBreadcrumbs class="flex-none" />
      <LayoutTabs :items="profileTabs" class="mt-2" />
    </div>

    <v-container v-if="loading" class="fill-height d-flex justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-container>

    <v-container v-else-if="error" class="fill-height d-flex justify-center">
      <v-alert type="error">{{ error.message }}</v-alert>
    </v-container>

    <ClientOnly>
      <v-container
        v-if="user"
        class="pa-6 mx-auto bg-background rounded-lg shadow-sm"
        style="max-width: 768px"
      >
        <v-snackbar v-model="showSuccess" color="success" :timeout="3000">
          {{ $t('profile.update_success') }}
        </v-snackbar>

        <v-alert
          v-if="uploadError"
          type="error"
          class="mb-4"
          closable
          @click:close="uploadError = ''"
        >
          {{ uploadError }}
        </v-alert>

        <div class="mb-8">
          <UsersProfileAvatarUpload
            :avatar-url="user.profile.avatar"
            :initials="getInitials(user.profile.full_name)"
            :can-edit="canEdit"
            @upload="handleAvatarUpload"
            @error="(e) => (uploadError = e)"
          />

          <div class="text-center mt-6">
            <h1 class="text-h5 font-bold mb-1">{{ user.profile.full_name }}</h1>
            <p class="text-body-1 text-grey-darken-1 mb-1">{{ user.email }}</p>
            <p class="text-caption text-grey">
              {{ $t('profile.member_since') }} {{ formatDate(user.created_at) }}
            </p>
          </div>
        </div>

        <UsersProfileEditForm
          :initial-data="initialFormData"
          :departments="departments"
          :positions="positions"
          :can-edit="canEdit"
          :show-logout="currentUser?.id === user?.id"
          :updating="updating"
          @update="handleUpdate"
          @logout="logout"
        />
      </v-container>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { Department, Position } from '~~/graphql/generated/graphql';

const route = useRoute();
const userId = route.params.userId as string;

const {
  user,
  loading,
  error,
  fetchUser,
  fetchDepartments,
  fetchPositions,
  updateUser,
  updateProfile,
  uploadAvatar,
} = useProfile();

const { user: currentUser, logout } = useAuth();
const { setBreadcrumbs } = useBreadcrumbs();
const { t } = useI18n();
const { formatDate, getInitials } = useFormatters();

const departments = ref<Department[]>([]);
const positions = ref<Position[]>([]);
const updating = ref(false);
const showSuccess = ref(false);
const uploadError = ref('');

const initialFormData = computed(() => ({
  first_name: user.value?.profile.first_name || '',
  last_name: user.value?.profile.last_name || '',
  departmentId: user.value?.department?.id || null,
  positionId: user.value?.position?.id || null,
}));

const profileTabs = computed(() => [
  {
    title: t('profile.title'),
    to: `/users/${userId}/profile`,
    value: 'profile',
  },
  {
    title: t('profile.skills'),
    to: `/users/${userId}/skills`,
    value: 'skills',
  },
  {
    title: t('profile.languages'),
    to: `/users/${userId}/languages`,
    value: 'languages',
  },
]);

const updateBreadcrumbs = () => {
  setBreadcrumbs([
    { title: t('sidebarUsers'), to: '/users' },
    {
      title: user.value?.profile.full_name || t('profile.title'),
      disabled: true,
    },
  ]);
};

const canEdit = computed(() => {
  if (!currentUser.value || !user.value) return false;
  return (
    currentUser.value.id === user.value.id || currentUser.value.role === 'Admin'
  );
});

onMounted(async () => {
  updateBreadcrumbs();
  await fetchUser(userId);
  if (user.value) {
    updateBreadcrumbs();
  }

  const [deps, pos] = await Promise.all([fetchDepartments(), fetchPositions()]);
  departments.value = deps;
  positions.value = pos;
});

const handleAvatarUpload = async (file: File, base64: string) => {
  try {
    await uploadAvatar({
      userId: user.value!.id,
      base64,
      size: file.size,
      type: file.type,
    });
    if (user.value) {
      user.value.profile.avatar = base64;
    }
  } catch (e) {
    uploadError.value = e instanceof Error ? e.message : t('Upload failed');
  }
};

const handleUpdate = async (formData: {
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
}) => {
  updating.value = true;
  try {
    const profileChanges = {
      userId: user.value!.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
    };

    const userChanges = {
      userId: user.value!.id,
      departmentId: formData.departmentId,
      positionId: formData.positionId,
    };

    await Promise.all([updateProfile(profileChanges), updateUser(userChanges)]);

    showSuccess.value = true;
    updateBreadcrumbs();
  } catch (e) {
    console.error('Update failed', e);
  } finally {
    updating.value = false;
  }
};
</script>
