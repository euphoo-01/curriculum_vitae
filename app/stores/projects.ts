import {
  GetProjectsDocument,
  GetProjectDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
} from '../../graphql/generated/graphql';
import type {
  GetProjectsQuery,
  CreateProjectInput,
  UpdateProjectInput,
} from '../../graphql/generated/graphql';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<GetProjectsQuery['projects']>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetProjectsDocument,
        fetchPolicy: 'network-only',
      });
      projects.value = data.projects;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects';
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (project: CreateProjectInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: CreateProjectDocument,
        variables: { project },
      });
      await fetchProjects();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create project';
      throw e;
    }
  };

  const updateProject = async (project: UpdateProjectInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: UpdateProjectDocument,
        variables: { project },
      });
      await fetchProjects();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update project';
      throw e;
    }
  };

  const deleteProject = async (projectId: string) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteProjectDocument,
        variables: { projectId },
      });
      await fetchProjects();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete project';
      throw e;
    }
  };

  const fetchProject = async (projectId: string) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetProjectDocument,
        variables: { projectId },
        fetchPolicy: 'network-only',
      });
      return data.project;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch project';
      throw e;
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
});
