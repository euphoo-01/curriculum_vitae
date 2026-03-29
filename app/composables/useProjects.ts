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

export const useProjects = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const projects = ref<GetProjectsQuery['projects']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'projects',
      async () => {
        const { data } = await client!.query({
          query: GetProjectsDocument,
          fetchPolicy: 'network-only',
        });
        return data.projects;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch projects');
    } else if (fetchedData.value) {
      projects.value = fetchedData.value;
    }

    loading.value = false;
  };

  const createProject = async (project: CreateProjectInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: CreateProjectDocument,
        variables: { project },
      });
      clearNuxtData('projects');
      await fetchProjects();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to create project');
      throw e;
    }
  };

  const updateProject = async (project: UpdateProjectInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: UpdateProjectDocument,
        variables: { project },
      });
      clearNuxtData('projects');
      await fetchProjects();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to update project');
      throw e;
    }
  };

  const deleteProject = async (projectId: string) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: DeleteProjectDocument,
        variables: { projectId },
      });
      clearNuxtData('projects');
      await fetchProjects();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to delete project');
      throw e;
    }
  };

  const fetchProject = async (projectId: string) => {
    try {
      const { data } = await client!.query({
        query: GetProjectDocument,
        variables: { projectId },
      });
      return data.project;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch project');
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
};
