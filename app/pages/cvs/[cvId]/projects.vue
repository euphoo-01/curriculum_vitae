<template>
  <div
    class="flex flex-col h-full w-full min-h-0 overflow-hidden pb-4 bg-background px-4"
  >
    <div class="flex flex-col bg-background shadow-sm mb-4 flex-none">
      <LayoutBreadcrumbs class="flex-none" />
      <CvsTabs />
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
      @confirm="projectToDelete && handleDeleteProject(projectToDelete)"
    />

    <CvsProjectsAddModal
      v-model="isAddModal"
      :loading="loadingAction"
      :edit-data="projectToEdit"
      :projects="availableProjects"
      @submit="handleSubmitProject"
    />

    <div
      v-if="loadingCv || loadingProjects"
      class="flex justify-center items-center flex-grow"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-card
      v-else-if="currentCv"
      flat
      rounded
      class="flex flex-col flex-grow min-h-0 w-full"
    >
      <v-card-text class="p-0 flex flex-col flex-grow min-h-0">
        <v-row class="m-0 justify-between px-4 pt-4 flex-none">
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
            v-if="canEdit"
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
        <CvsProjectsTable
          :items="currentCv.projects || []"
          :loading="loadingCv"
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

const cvsStore = useCvsStore();
const { currentCv, loading: loadingCv } = storeToRefs(cvsStore);
const { fetchCv, addCvProject, updateCvProject, removeCvProject } = cvsStore;
const projectsStore = useProjectsStore();
const { fetchProjects } = projectsStore;

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const route = useRoute();
const cvId = route.params.cvId as string;

const { user: currentUser } = useAuth();

const { projects, loading: loadingProjects } = storeToRefs(projectsStore);

const search = ref('');
const isDeleteModal = ref(false);
const isAddModal = ref(false);
const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const projectToDelete = ref<string>();
const projectToEdit = ref<{
  projectId: string;
  start_date: string;
  end_date?: string | null;
  roles: string[];
  responsibilities: string[];
} | null>(null);

const canEdit = computed(() => {
  if (!currentUser.value || !currentCv.value) return false;
  return (
    String(currentUser.value.id) === String(currentCv.value.user?.id) ||
    currentUser.value.role === UserRole.Admin
  );
});

const availableProjects = computed(() => {
  if (!currentCv.value || !currentCv.value.projects) return projects.value;
  const assignedProjectIds = new Set(
    currentCv.value.projects.map((p) => p.project.id)
  );
  return projects.value.filter(
    (p) =>
      !assignedProjectIds.has(p.id) || projectToEdit.value?.projectId === p.id
  );
});

const adminActions: AdminAction[] = [
  {
    name: t('common.update'),
    type: AdminActionsNames.SEE,
    action: (projectId: string) => {
      const proj = currentCv.value?.projects?.find(
        (p) => p.project.id === projectId
      );
      if (proj) {
        projectToEdit.value = {
          projectId: proj.project.id,
          start_date: proj.start_date,
          end_date: proj.end_date,
          roles: proj.roles,
          responsibilities: proj.responsibilities,
        };
        isAddModal.value = true;
      }
    },
  },
  {
    name: t('common.delete'),
    type: AdminActionsNames.DELETE,
    action: (projectId: string) => {
      projectToDelete.value = projectId;
      isDeleteModal.value = true;
    },
  },
];

const openAddModal = () => {
  projectToEdit.value = null;
  isAddModal.value = true;
};

const handleSubmitProject = async (formData: {
  projectId: string;
  start_date: string;
  end_date?: string;
  roles: string[];
  responsibilities: string[];
}) => {
  loadingAction.value = true;
  try {
    if (projectToEdit.value) {
      await updateCvProject({
        cvId,
        projectId: formData.projectId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        roles: formData.roles,
        responsibilities: formData.responsibilities,
      });
      actionMessage.value = t('common.update');
    } else {
      await addCvProject({
        cvId,
        projectId: formData.projectId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        roles: formData.roles,
        responsibilities: formData.responsibilities,
      });
      actionMessage.value = t('common.add');
    }
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isAddModal.value = false;
    await fetchCv(cvId);
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

const handleDeleteProject = async (projectId: string) => {
  loadingAction.value = true;
  try {
    await removeCvProject({ cvId, projectId });
    actionMessage.value = t('common.delete');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isDeleteModal.value = false;
    await fetchCv(cvId);
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

onMounted(async () => {
  const [cv] = await Promise.all([fetchCv(cvId), fetchProjects()]);

  if (cv) {
    setBreadcrumbs([
      { title: t('sidebarCVs'), to: '/cvs' },
      { title: cv.name, to: `/cvs/${cvId}/details` },
      { title: t('cvs.projects'), disabled: true },
    ]);
  }
});
</script>
