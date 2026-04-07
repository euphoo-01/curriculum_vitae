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
      :title="$t('common.actions.delete')"
      :message="$t('languages.deleteConfirm')"
      :confirm-text="$t('common.actions.delete')"
      :cancel-text="$t('common.actions.cancel')"
      @confirm="languageToDelete && handleDeleteLanguage(languageToDelete)"
    />

    <LanguagesAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="languageToEdit"
      @submit="handleSubmitLanguage"
    />

    <v-card flat rounded class="flex flex-col flex-grow min-h-0 w-full">
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between px-4 pt-4 flex-none">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('employees.search')"
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
            {{ $t('common.actions.add') }}
          </v-btn>
        </v-row>
        <LanguagesTable
          :items="languagesList"
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
import { useTableManager } from '~/composables/useTableManager';
import type { LanguageEditData, LanguageFormData } from '~/types/languages';

const dictionariesStore = useDictionariesStore();
const { languagesList, loading } = storeToRefs(dictionariesStore);
const { fetchLanguages, createLanguage, updateLanguage, deleteLanguage } =
  dictionariesStore;

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const { user: currentUser } = storeToRefs(useAuthStore());

const {
  search,
  isDeleteModal,
  isAddModal,
  isSnackbar,
  actionMessage,
  snackbarColor,
  loadingAction,
  itemToDelete: languageToDelete,
  itemToEdit: languageToEdit,
  openAddModal,
  openEditModal,
  openDeleteModal,
  showSuccess,
  showError,
  closeModals,
} = useTableManager<LanguageEditData>();

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.actions.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const lang = languagesList.value.find((l) => l?.id === id);
      if (lang) {
        openEditModal({
          id: lang.id,
          name: lang.name,
          native_name: lang.native_name,
          iso2: lang.iso2,
        });
      }
    },
  },
  {
    name: t('common.actions.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      openDeleteModal(id);
    },
  },
];

const handleSubmitLanguage = async (formData: LanguageFormData) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateLanguage({
        languageId: formData.id,
        name: formData.name,
        native_name: formData.native_name,
        iso2: formData.iso2,
      });
      showSuccess(t('common.responses.updateSuccess'));
    } else {
      await createLanguage({
        name: formData.name,
        native_name: formData.native_name,
        iso2: formData.iso2,
      });
      showSuccess(t('common.responses.addSuccess'));
    }
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteLanguage = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteLanguage(id);
    showSuccess(t('common.responses.deleteSuccess'));
  } catch (e) {
    showError(
      `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  } finally {
    loadingAction.value = false;
    closeModals();
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('sidebar.languages'), disabled: true }]);
  fetchLanguages();
});
</script>
