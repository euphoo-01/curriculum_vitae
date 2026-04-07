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
      :message="$t('profile.deleteConfirm')"
      :confirm-text="$t('common.actions.delete')"
      :cancel-text="$t('common.actions.cancel')"
      @confirm="skillToDelete && handleDeleteSkill(skillToDelete)"
    />

    <SkillsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="skillToEdit"
      :categories="categoriesList"
      @submit="handleSubmitSkill"
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
        <SkillsTable
          :items="skillsList"
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
import type { SkillEditData, SkillFormData } from '~/types/skills';

const dictionariesStore = useDictionariesStore();
const { skillsList, categoriesList, loading } = storeToRefs(dictionariesStore);
const { fetchSkills, fetchCategories, createSkill, updateSkill, deleteSkill } =
  dictionariesStore;

const { t } = useI18n();
useSeoMeta({
  title: t('seo.skills.title'),
  ogTitle: t('seo.skills.title'),
  description: t('seo.skills.description'),
  ogDescription: t('seo.skills.description'),
});
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
  itemToDelete: skillToDelete,
  itemToEdit: skillToEdit,
  openAddModal,
  openEditModal,
  openDeleteModal,
  showSuccess,
  showError,
  closeModals,
} = useTableManager<SkillEditData>();

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.actions.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const skill = skillsList.value.find((s) => s.id === id);
      if (skill) {
        openEditModal({
          id: skill.id,
          name: skill.name,
          categoryId: skill.category?.id,
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

const handleSubmitSkill = async (formData: SkillFormData) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateSkill({
        skillId: formData.id,
        name: formData.name,
        categoryId: formData.categoryId,
      });
      showSuccess(t('common.responses.updateSuccess'));
    } else {
      await createSkill({
        name: formData.name,
        categoryId: formData.categoryId,
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

const handleDeleteSkill = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteSkill(id);
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
  setBreadcrumbs([{ title: t('sidebar.skills'), disabled: true }]);
  fetchSkills();
  fetchCategories();
});
</script>
