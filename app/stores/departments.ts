import { defineStore } from 'pinia';
import {
  GetDepartmentsDocument,
  CreateDepartmentDocument,
  UpdateDepartmentDocument,
  DeleteDepartmentDocument,
} from '../../graphql/generated/graphql';
import type {
  GetDepartmentsQuery,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../../graphql/generated/graphql';

export const useDepartmentsStore = defineStore('departments', () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const departments = ref<GetDepartmentsQuery['departments']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchDepartments = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: GetDepartmentsDocument,
        fetchPolicy: 'network-only',
      });
      departments.value = data.departments;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch departments');
    } finally {
      loading.value = false;
    }
  };

  const createDepartment = async (department: CreateDepartmentInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: CreateDepartmentDocument,
        variables: { department },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to create department');
      throw e;
    }
  };

  const updateDepartment = async (department: UpdateDepartmentInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: UpdateDepartmentDocument,
        variables: { department },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to update department');
      throw e;
    }
  };

  const deleteDepartment = async (departmentId: string) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: DeleteDepartmentDocument,
        variables: { departmentId },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to delete department');
      throw e;
    }
  };

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
