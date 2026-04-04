import { defineStore } from 'pinia';
import {
  UsersDocument,
  DeleteUserDocument,
  CreateUserDocument,
} from '../../graphql/generated/graphql';
import type {
  UsersQuery,
  CreateUserInput,
} from '../../graphql/generated/graphql';

export const useUsersStore = defineStore('users', () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const users = ref<UsersQuery['users']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: UsersDocument,
        fetchPolicy: 'network-only',
      });
      users.value = data.users;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch users');
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: DeleteUserDocument,
        variables: { userId: id },
      });
      await fetchUsers();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to delete user');
    }
  };

  const createUser = async (user: CreateUserInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: CreateUserDocument,
        variables: { user },
      });
      await fetchUsers();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to create user');
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    createUser,
  };
});
