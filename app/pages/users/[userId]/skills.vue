<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
      <UsersProfileTabs />
    </div>

    <div
      v-if="loadingUser || loadingSkills"
      class="flex justify-center items-center flex-grow"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div
      v-else-if="userError || skillsError"
      class="flex justify-center items-center flex-grow"
    >
      <v-alert type="error">{{ userError || skillsError }}</v-alert>
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
          v-if="categoriesWithSkills.length === 0"
          class="text-center py-8 text-on-surface/50"
        >
          {{ $t('skills.noSkills') }}
        </div>

        <div
          v-for="category in categoriesWithSkills"
          :key="category.id"
          class="mb-10"
        >
          <div class="text-xl font-bold mb-6 text-on-surface">
            {{ category.name }}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <UsersSkillsChip
              v-for="skill in category.skills"
              :key="skill.name"
              :skill="skill"
              :selected="selectedSkillsToDelete.has(skill.name)"
              :disabled="!canEdit"
              @click="handleSkillClick(skill)"
            />
          </div>
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
            {{ $t('skills.add') }}
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
                selectedSkillsToDelete.size > 0
                  ? `(${selectedSkillsToDelete.size})`
                  : ''
              }}
            </v-btn>
          </template>
        </div>
      </div>

      <UsersSkillsAddModal
        v-model="isAddModalOpen"
        :skills="availableSkillsToAdd"
        :loading="updating"
        @submit="handleAddSkill"
      />

      <UsersSkillsEditModal
        v-model="isEditModalOpen"
        :edit-data="selectedSkill"
        :loading="updating"
        @submit="handleUpdateSkill"
        @delete="openDeleteModalFromEdit"
      />

      <ConfirmModal
        v-model="isConfirmModalOpen"
        :loading="updating"
        :title="$t('common.actions.delete')"
        :message="$t('skills.deleteConfirm')"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mastery } from '~~/graphql/generated/graphql';
import { UserRole } from '~~/graphql/generated/graphql';

const dictionariesStore = useDictionariesStore();
const { skillsList, categoriesList } = storeToRefs(dictionariesStore);
const { fetchSkills, fetchCategories } = dictionariesStore;
const employeesStore = useEmployeesStore();
const {
  user,
  loading: loadingUser,
  error: userError,
  profileSkills,
  loading: loadingSkills,
  error: skillsError,
} = storeToRefs(employeesStore);
const {
  fetchUser,
  fetchProfileSkills,
  addProfileSkill,
  updateProfileSkill,
  deleteProfileSkill,
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

const {
  isAddModalOpen,
  isEditModalOpen,
  isConfirmModalOpen,
  deleteMode,
  selectedItem: selectedSkill,
  selectedItemsToDelete: selectedSkillsToDelete,
  toggleDeleteMode,
  cancelDeleteMode,
  handleItemClick: handleSkillClick,
  openDeleteModalFromEdit,
} = useListManager<{
  name: string;
  mastery: Mastery;
  categoryId?: string | null;
}>('name');

const canEdit = computed(() => {
  if (!currentUser.value || !user.value) return false;
  return (
    String(currentUser.value.id) === String(user.value.id) ||
    currentUser.value.role === UserRole.Admin
  );
});

const availableSkillsToAdd = computed(() => {
  const profileSkillNames = new Set(profileSkills.value.map((s) => s.name));
  return skillsList.value.filter((s) => !profileSkillNames.has(s.name));
});

const { categoriesWithSkills } = useSkillCategories(
  profileSkills,
  categoriesList
);

await Promise.all([
  fetchUser(userId),
  fetchProfileSkills(userId),
  fetchSkills(),
  fetchCategories(),
]);

if (userId) {
  setBreadcrumbs([
    { title: t('sidebar.employees'), to: '/users' },
    {
      title: user.value?.profile.full_name || t('profile.title'),
      to: `/users/${userId}/profile`,
    },
    {
      title: t('profile.skills'),
      disabled: true,
    },
  ]);
}

const handleAddSkill = async (data: { name: string; mastery: Mastery }) => {
  updating.value = true;
  actionError.value = '';
  try {
    const skillObj = skillsList.value.find((s) => s.name === data.name);

    await addProfileSkill({
      userId,
      name: data.name,
      categoryId: skillObj?.category?.id,
      mastery: data.mastery,
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

const handleUpdateSkill = async (data: { name: string; mastery: Mastery }) => {
  if (!selectedSkill.value) return;
  updating.value = true;
  actionError.value = '';
  try {
    await updateProfileSkill({
      userId,
      name: selectedSkill.value.name,
      categoryId: selectedSkill.value.categoryId,
      mastery: data.mastery,
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

const confirmDelete = async () => {
  if (selectedSkillsToDelete.value.size === 0) {
    isConfirmModalOpen.value = false;
    return;
  }

  updating.value = true;
  actionError.value = '';
  try {
    await deleteProfileSkill({
      userId,
      name: Array.from(selectedSkillsToDelete.value) as string[],
    });
    successMessage.value = t('common.responses.deleteSuccess');
    showSuccess.value = true;
    isConfirmModalOpen.value = false;
    deleteMode.value = false;
    selectedSkillsToDelete.value.clear();
  } catch (e) {
    actionError.value = `${t('common.responses.error')}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    isConfirmModalOpen.value = false;
  } finally {
    updating.value = false;
  }
};
</script>
