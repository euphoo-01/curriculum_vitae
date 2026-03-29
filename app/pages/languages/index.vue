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
      @confirm="languageToDelete && handleDeleteLanguage(languageToDelete)"
    />

    <LanguagesAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="languageToEdit"
      @submit="handleSubmitLanguage"
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
        <LanguagesTable
          :items="languagesList"
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
  languagesList,
  loading,
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} = useLanguages();

const search = ref('');
const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const languageToDelete = ref<string>();
const languageToEdit = ref<{ id: string; name: string; native_name?: string | null; iso2: string } | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const lang = languagesList.value.find((l) => l.id === id);
      if (lang) {
        languageToEdit.value = {
          id: lang.id,
          name: lang.name,
          native_name: lang.native_name,
          iso2: lang.iso2,
        };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      languageToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  languageToEdit.value = null;
  isAddModal.value = true;
};

const handleSubmitLanguage = async (formData: {
  id?: string;
  name: string;
  native_name?: string;
  iso2: string;
}) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateLanguage({
        languageId: formData.id,
        name: formData.name,
        native_name: formData.native_name,
        iso2: formData.iso2,
      });
      actionMessage.value = t('common.update');
    } else {
      await createLanguage({
        name: formData.name,
        native_name: formData.native_name,
        iso2: formData.iso2,
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

const handleDeleteLanguage = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteLanguage(id);
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
  setBreadcrumbs([
    { title: t('sidebarLanguages'), disabled: true },
  ]);
  fetchLanguages();
});
</script>
