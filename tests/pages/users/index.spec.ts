import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import UsersPage from '../../../app/pages/users/index.vue';
import { ref } from 'vue';

const mockFetchUsers = vi.fn();
const mockUsers = ref([]);
const mockLoading = ref(false);
const mockError = ref(null);

mockNuxtImport('useUsers', () => {
  return () => ({
    users: mockUsers,
    loading: mockLoading,
    error: mockError,
    fetchUsers: mockFetchUsers,
  });
});

describe('Users Page', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(UsersPage);

    expect(wrapper.html()).toContain('Search...');

    expect(mockFetchUsers).toHaveBeenCalled();
  });
});
