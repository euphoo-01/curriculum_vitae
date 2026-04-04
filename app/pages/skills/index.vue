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

const dictionariesStore = useDictionariesStore();
const { skillsList, categoriesList, loading } = storeToRefs(dictionariesStore);
const { fetchSkills, fetchCategories, createSkill, updateSkill, deleteSkill } =
  dictionariesStore;

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

const skillToDelete = ref<string>();
const skillToEdit = ref<{
  id: string;
  name: string;
  categoryId?: string | null;
} | null>(null);

const isAdmin = computed(() => currentUser.value?.role === UserRole.Admin);

const adminActions: AdminAction[] = [
  {
    name: t('common.actions.update'),
    type: AdminActionsNames.SEE,
    action: (id: string) => {
      const skill = skillsList.value.find((s) => s.id === id);
      if (skill) {
        skillToEdit.value = {
          id: skill.id,
          name: skill.name,
          categoryId: skill.category?.id,
        };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.actions.delete'),
    type: AdminActionsNames.DELETE,
    action: (id: string) => {
      skillToDelete.value = id;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  skillToEdit.value = null;
  isAddModal.value = true;
};

const handleSubmitSkill = async (formData: {
  id?: string;
  name: string;
  categoryId?: string;
}) => {
  loadingAction.value = true;
  try {
    if (formData.id) {
      await updateSkill({
        skillId: formData.id,
        name: formData.name,
        categoryId: formData.categoryId,
      });
      actionMessage.value = t('common.responses.updateSuccess');
    } else {
      await createSkill({
        name: formData.name,
        categoryId: formData.categoryId,
      });
      actionMessage.value = t('common.responses.addSuccess');
    }
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isAddModal.value = false;
  } catch (e) {
    actionMessage.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteSkill = async (id: string) => {
  loadingAction.value = true;
  try {
    await deleteSkill(id);
    actionMessage.value = t('common.responses.deleteSuccess');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isDeleteModal.value = false;
  } catch (e) {
    actionMessage.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

onMounted(() => {
  setBreadcrumbs([{ title: t('sidebar.skills'), disabled: true }]);
  fetchSkills();
  fetchCategories();
});
</script>
