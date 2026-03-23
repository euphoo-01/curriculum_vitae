import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsers } from '../../app/composables/useUsers';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mockQuery = vi.fn();

mockNuxtImport('useApollo', () => {
  return () => ({
    getToken: vi.fn(),
    clients: {
      default: {
        query: mockQuery,
      },
    },
  });
});

describe('useUsers Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches users successfully', async () => {
    const mockUsers = [
      {
        id: '1',
        email: 'test@example.com',
        role: 'Employee',
        profile: {
          first_name: 'Vasya',
          last_name: 'Pupkin',
          full_name: 'Vasya Pupkin',
        },
        department_name: 'IT',
        position_name: 'Developer',
      },
    ];
    mockQuery.mockResolvedValue({ data: { users: mockUsers } });

    const { users, loading, error, fetchUsers } = useUsers();

    expect(loading.value).toBe(false);

    await fetchUsers();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(users.value).toEqual(mockUsers);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('handles errors during fetch', async () => {
    mockQuery.mockRejectedValue(new Error('Network error'));

    const { users, loading, error, fetchUsers } = useUsers();

    await fetchUsers();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(users.value).toEqual([]);
    expect(error.value).toBeInstanceOf(Error);
    expect(error.value?.message).toBe('Network error');
    expect(loading.value).toBe(false);
  });
});
