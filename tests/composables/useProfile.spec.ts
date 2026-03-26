import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfile } from '../../app/composables/useProfile';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mockQuery = vi.fn();
const mockMutate = vi.fn();

mockNuxtImport('useApollo', () => {
  return () => ({
    clients: {
      default: {
        query: mockQuery,
        mutate: mockMutate,
      },
    },
  });
});

describe('useProfile Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user correctly', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      profile: { full_name: 'Test' },
    };
    mockQuery.mockResolvedValue({ data: { user: mockUser } });

    const { user, loading, error, fetchUser } = useProfile();

    expect(loading.value).toBe(false);
    await fetchUser('1');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(user.value).toEqual(mockUser);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('fetches departments correctly', async () => {
    const mockDeps = [{ id: '1', name: 'IT' }];
    mockQuery.mockResolvedValue({ data: { departments: mockDeps } });

    const { fetchDepartments } = useProfile();
    const deps = await fetchDepartments();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(deps).toEqual(mockDeps);
  });

  it('handles update profile correctly', async () => {
    const mockProfile = { id: '1', first_name: 'Stanislav' };
    mockMutate.mockResolvedValue({ data: { updateProfile: mockProfile } });

    const { updateProfile, user } = useProfile();
    user.value = {
      id: '1',
      email: 'test',
      profile: { full_name: 'Old', id: '1' },
    } as unknown as typeof user.value;

    const result = await updateProfile({
      userId: '1',
      first_name: 'Stanislav',
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProfile);
    expect(user.value?.profile.first_name).toBe('Stanislav');
  });
});
