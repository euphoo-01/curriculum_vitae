import { defineStore } from 'pinia';
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
  const { clients } = useApollo();
  const client = clients?.default;

  const projects = ref<GetProjectsQuery['projects']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: GetProjectsDocument,
        fetchPolicy: 'network-only',
      });
      projects.value = data.projects;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch projects');
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (project: CreateProjectInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: CreateProjectDocument,
        variables: { project },
      });
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
        fetchPolicy: 'network-only',
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
});
