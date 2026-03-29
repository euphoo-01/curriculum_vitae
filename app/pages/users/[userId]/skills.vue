<template>
  <div class="flex flex-col h-screen bg-background pb-0 m-0">
    <div class="flex flex-col shrink-0 bg-background shadow-sm mb-4 px-4">
      <LayoutBreadcrumbs class="shrink-0" />
      <UsersProfileTabs />
    </div>

    <div
      v-if="loadingUser || loadingSkills"
      class="flex justify-center items-center min-h-[50vh]"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div
      v-else-if="userError || skillsError"
      class="flex justify-center items-center min-h-[50vh]"
    >
      <v-alert type="error">{{
        userError?.message || skillsError?.message
      }}</v-alert>
    </div>

    <div v-if="user" class="w-full grow overflow-scroll">
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
            {{ $t('common.delete') }}
          </v-btn>

          <template v-else>
            <v-btn
              variant="outlined"
              size="x-large"
              class="px-8"
              rounded
              @click="cancelDeleteMode"
            >
              {{ $t('common.cancel') }}
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
              {{ $t('common.delete') }}
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
        :skill="selectedSkill"
        :loading="updating"
        @submit="handleUpdateSkill"
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
import type { Mastery } from '~~/graphql/generated/graphql';
import { UserRole } from '~~/graphql/generated/graphql';

const route = useRoute();
const userId = route.params.userId as string;

const {
  user,
  loading: loadingUser,
  error: userError,
  fetchUser,
} = useProfile();

const {
  profileSkills,
  skillsList,
  categoriesList,
  loading: loadingSkills,
  error: skillsError,
  fetchProfileSkills,
  fetchSkills,
  fetchCategories,
  addProfileSkill,
  updateProfileSkill,
  deleteProfileSkill,
} = useSkills();

const { user: currentUser } = useAuth();
const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();

const updating = ref(false);
const showSuccess = ref(false);
const successMessage = ref('');
const actionError = ref('');

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const selectedSkill = ref<{
  name: string;
  mastery: Mastery;
  categoryId?: string | null;
} | null>(null);

const deleteMode = ref(false);
const selectedSkillsToDelete = ref<Set<string>>(new Set());

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

const categoriesWithSkills = computed(() => {
  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      skills: typeof profileSkills.value;
      order: number;
    }
  >();

  categoriesList.value.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      skills: [],
      order: cat.order,
    });
  });

  categoryMap.set('uncategorized', {
    id: 'uncategorized',
    name: t('skills.uncategorized'),
    skills: [],
    order: 9999,
  });

  profileSkills.value.forEach((skill) => {
    const catId = skill.categoryId || 'uncategorized';
    if (categoryMap.has(catId)) {
      categoryMap.get(catId)!.skills.push(skill);
    } else {
      categoryMap.get('uncategorized')!.skills.push(skill);
    }
  });

  return Array.from(categoryMap.values())
    .filter((c) => c.skills.length > 0)
    .sort((a, b) => a.order - b.order);
});

await Promise.all([
  fetchUser(userId),
  fetchProfileSkills(userId),
  fetchSkills(),
  fetchCategories(),
]);

if (userId) {
  setBreadcrumbs([
    { title: t('sidebarUsers'), to: '/users' },
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

const toggleDeleteMode = () => {
  if (!deleteMode.value) {
    deleteMode.value = true;
    selectedSkillsToDelete.value.clear();
  } else {
    if (selectedSkillsToDelete.value.size > 0) {
      isConfirmModalOpen.value = true;
    } else {
      deleteMode.value = false;
    }
  }
};

const cancelDeleteMode = () => {
  deleteMode.value = false;
  selectedSkillsToDelete.value.clear();
};

const handleSkillClick = (skill: {
  name: string;
  mastery: Mastery;
  categoryId?: string | null;
}) => {
  if (deleteMode.value) {
    if (selectedSkillsToDelete.value.has(skill.name)) {
      selectedSkillsToDelete.value.delete(skill.name);
    } else {
      selectedSkillsToDelete.value.add(skill.name);
    }
  } else {
    selectedSkill.value = { ...skill };
    isEditModalOpen.value = true;
  }
};

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
    successMessage.value = t('common.save');
    showSuccess.value = true;
    isAddModalOpen.value = false;
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Error adding skill';
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
    successMessage.value = t('common.update');
    showSuccess.value = true;
    isEditModalOpen.value = false;
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Error updating skill';
  } finally {
    updating.value = false;
  }
};

const openDeleteModalFromEdit = () => {
  isEditModalOpen.value = false;
  selectedSkillsToDelete.value.clear();
  if (selectedSkill.value) {
    selectedSkillsToDelete.value.add(selectedSkill.value.name);
  }
  isConfirmModalOpen.value = true;
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
      name: Array.from(selectedSkillsToDelete.value),
    });
    successMessage.value = t('common.delete');
    showSuccess.value = true;
    isConfirmModalOpen.value = false;
    deleteMode.value = false;
    selectedSkillsToDelete.value.clear();
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Error deleting skill';
    isConfirmModalOpen.value = false;
  } finally {
    updating.value = false;
  }
};
</script>
