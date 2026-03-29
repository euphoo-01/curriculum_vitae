import {
  UsersDocument,
  DeleteUserDocument,
  CreateUserDocument,
} from '../../graphql/generated/graphql';
import type {
  UsersQuery,
  CreateUserInput,
} from '../../graphql/generated/graphql';

export const useUsers = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const users = ref<UsersQuery['users']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'users',
      async () => {
        const { data } = await client!.query({
          query: UsersDocument,
          fetchPolicy: 'network-only',
        });
        return data.users;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch users');
    } else if (fetchedData.value) {
      users.value = fetchedData.value;
    }

    loading.value = false;
  };

  const deleteUser = async (id: string) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: DeleteUserDocument,
        variables: { userId: id },
      });
      clearNuxtData('users');
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
      clearNuxtData('users');
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
};
