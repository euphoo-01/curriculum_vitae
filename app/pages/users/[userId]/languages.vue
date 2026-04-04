<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
      <UsersProfileTabs />
    </div>

    <div
      v-if="loadingUser || loadingLanguages"
      class="flex justify-center items-center flex-grow"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div
      v-else-if="userError || languagesError"
      class="flex justify-center items-center flex-grow"
    >
      <v-alert type="error">{{ userError || languagesError }}</v-alert>
    </div>

    <div v-if="user" class="w-full flex-grow min-h-0 overflow-y-auto">
      <div class="mx-auto max-w-[1140px] pb-[120px] px-4">
        <v-snackbar
          v-model="showSuccess"
          color="success"
          location="top"
          :timeout="3000"
        >
          {{ successMessage }}
        </v-snackbar>

        <v-alert
          v-if="actionError"
          type="error"
          class="mb-4"
          closable
          @click:close="actionError = ''"
        >
          {{ actionError }}
        </v-alert>

        <div
          v-if="profileLanguages.length === 0"
          class="text-center py-8 text-on-surface/50"
        >
          {{ $t('languages.noLanguages') }}
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
        >
          <UsersLanguagesChip
            v-for="language in profileLanguages"
            :key="language.name"
            :language="language"
            :selected="selectedLanguagesToDelete.has(language.name)"
            :disabled="!canEdit"
            @click="handleLanguageClick(language)"
          />
        </div>

        <div v-if="canEdit" class="flex items-center my-6 gap-8">
          <v-btn
            v-if="!deleteMode"
            variant="outlined"
            prepend-icon="mdi-plus"
            size="x-large"
            class="px-8"
            rounded
            :disabled="deleteMode"
            @click="isAddModalOpen = true"
          >
            {{ $t('languages.add') }}
          </v-btn>

          <v-btn
            v-if="!deleteMode"
            color="primary"
            variant="flat"
            size="x-large"
            class="px-8"
            rounded
            prepend-icon="mdi-delete"
            @click="toggleDeleteMode"
          >
            {{ $t('common.actions.delete') }}
          </v-btn>

          <template v-else>
            <v-btn
              variant="outlined"
              size="x-large"
              class="px-8"
              rounded
              @click="cancelDeleteMode"
            >
              {{ $t('common.actions.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              class="px-8"
              rounded
              prepend-icon="mdi-delete"
              @click="toggleDeleteMode"
            >
              {{ $t('common.actions.delete') }}
              {{
                selectedLanguagesToDelete.size > 0
                  ? `(${selectedLanguagesToDelete.size})`
                  : ''
              }}
            </v-btn>
          </template>
        </div>
      </div>

      <UsersLanguagesAddModal
        v-model="isAddModalOpen"
        :languages="availableLanguagesToAdd"
        :loading="updating"
        @submit="handleAddLanguage"
      />

      <UsersLanguagesEditModal
        v-model="isEditModalOpen"
        :language="selectedLanguage"
        :loading="updating"
        @submit="handleUpdateLanguage"
        @delete="openDeleteModalFromEdit"
      />

      <ConfirmModal
        v-model="isConfirmModalOpen"
        :loading="updating"
        :title="$t('profile.deleteConfirm')"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Proficiency } from '~~/graphql/generated/graphql';
import { UserRole } from '~~/graphql/generated/graphql';

const dictionariesStore = useDictionariesStore();
const { languagesList } = storeToRefs(dictionariesStore);
const { fetchLanguages } = dictionariesStore;
const employeesStore = useEmployeesStore();
const {
  user,
  loading: loadingUser,
  error: userError,
  profileLanguages,
  loading: loadingLanguages,
  error: languagesError,
} = storeToRefs(employeesStore);
const {
  fetchUser,
  fetchProfileLanguages,
  addProfileLanguage,
  updateProfileLanguage,
  deleteProfileLanguage,
} = employeesStore;

const route = useRoute();
const userId = route.params.userId as string;

const { user: currentUser } = storeToRefs(useAuthStore());
const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();

const updating = ref(false);
const showSuccess = ref(false);
const successMessage = ref('');
const actionError = ref('');

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const selectedLanguage = ref<{
  name: string;
  proficiency: Proficiency;
} | null>(null);

const deleteMode = ref(false);
const selectedLanguagesToDelete = ref<Set<string>>(new Set());

const canEdit = computed(() => {
  if (!currentUser.value || !user.value) return false;
  return (
    String(currentUser.value.id) === String(user.value.id) ||
    currentUser.value.role === UserRole.Admin
  );
});

const availableLanguagesToAdd = computed(() => {
  const profileLanguageNames = new Set(
    profileLanguages.value.map((l) => l.name)
  );
  return (
    languagesList.value.filter((l) => l !== null) as { name: string }[]
  ).filter((l) => !profileLanguageNames.has(l.name));
});

await Promise.all([
  fetchUser(userId),
  fetchProfileLanguages(userId),
  fetchLanguages(),
]);

if (userId) {
  setBreadcrumbs([
    { title: t('sidebar.employees'), to: '/users' },
    {
      title: user.value?.profile.full_name || t('profile.title'),
      to: `/users/${userId}/profile`,
    },
    {
      title: t('profile.languages'),
      disabled: true,
    },
  ]);
}

const toggleDeleteMode = () => {
  if (!deleteMode.value) {
    deleteMode.value = true;
    selectedLanguagesToDelete.value.clear();
  } else {
    if (selectedLanguagesToDelete.value.size > 0) {
      isConfirmModalOpen.value = true;
    } else {
      deleteMode.value = false;
    }
  }
};

const cancelDeleteMode = () => {
  deleteMode.value = false;
  selectedLanguagesToDelete.value.clear();
};

const handleLanguageClick = (language: {
  name: string;
  proficiency: Proficiency;
}) => {
  if (deleteMode.value) {
    if (selectedLanguagesToDelete.value.has(language.name)) {
      selectedLanguagesToDelete.value.delete(language.name);
    } else {
      selectedLanguagesToDelete.value.add(language.name);
    }
  } else {
    selectedLanguage.value = { ...language };
    isEditModalOpen.value = true;
  }
};

const handleAddLanguage = async (data: {
  name: string;
  proficiency: Proficiency;
}) => {
  updating.value = true;
  actionError.value = '';
  try {
    await addProfileLanguage({
      userId,
      name: data.name,
      proficiency: data.proficiency,
    });
    successMessage.value = t('common.responses.success');
    showSuccess.value = true;
    isAddModalOpen.value = false;
  } catch (e) {
    actionError.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
  } finally {
    updating.value = false;
  }
};

const handleUpdateLanguage = async (data: {
  name: string;
  proficiency: Proficiency;
}) => {
  if (!selectedLanguage.value) return;
  updating.value = true;
  actionError.value = '';
  try {
    await updateProfileLanguage({
      userId,
      name: selectedLanguage.value.name,
      proficiency: data.proficiency,
    });
    successMessage.value = t('common.responses.updateSuccess');
    showSuccess.value = true;
    isEditModalOpen.value = false;
  } catch (e) {
    actionError.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
  } finally {
    updating.value = false;
  }
};

const openDeleteModalFromEdit = () => {
  isEditModalOpen.value = false;
  selectedLanguagesToDelete.value.clear();
  if (selectedLanguage.value) {
    selectedLanguagesToDelete.value.add(selectedLanguage.value.name);
  }
  isConfirmModalOpen.value = true;
};

const confirmDelete = async () => {
  if (selectedLanguagesToDelete.value.size === 0) {
    isConfirmModalOpen.value = false;
    return;
  }

  updating.value = true;
  actionError.value = '';
  try {
    await deleteProfileLanguage({
      userId,
      name: Array.from(selectedLanguagesToDelete.value),
    });
    successMessage.value = t('common.responses.deleteSuccess');
    showSuccess.value = true;
    isConfirmModalOpen.value = false;
    deleteMode.value = false;
    selectedLanguagesToDelete.value.clear();
  } catch (e) {
    actionError.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    isConfirmModalOpen.value = false;
  } finally {
    updating.value = false;
  }
};
</script>
