import { UsersDocument } from '../../graphql/generated/graphql';
import type { UsersQuery } from '../../graphql/generated/graphql';

export const useUsers = () => {
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

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
};
