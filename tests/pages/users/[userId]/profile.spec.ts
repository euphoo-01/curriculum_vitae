import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { ToRefs } from 'vue';
import { toRefs, reactive } from 'vue';
import ProfilePage from '../../../../app/pages/users/[userId]/profile.vue';

interface UserProfile {
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string | null;
}

interface Employee {
  id: string;
  email: string;
  created_at: string;
  profile: UserProfile;
  department: string | null;
  position: string | null;
}

interface EmployeesStore {
  user: Employee | null;
  loading: boolean;
  error: string | null;
  fetchUser: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  updateProfile: ReturnType<typeof vi.fn>;
  uploadAvatar: ReturnType<typeof vi.fn>;
  deleteAvatar: ReturnType<typeof vi.fn>;
}

mockNuxtImport('useI18n', () => () => ({
  t: (key: string): string => key,
}));

mockNuxtImport('useRoute', () => () => ({
  params: { userId: '1' },
}));

mockNuxtImport('useSeoMeta', () => vi.fn());

mockNuxtImport('useFormatters', () => () => ({
  formatDate: (d: string): string => d,
  getInitials: (s: string): string => (s ? s[0] : ''),
}));

mockNuxtImport('useBreadcrumbs', () => () => ({
  setBreadcrumbs: vi.fn(),
}));

mockNuxtImport('useDictionariesStore', () => () => ({
  fetchDepartments: vi.fn().mockResolvedValue([]),
  fetchPositions: vi.fn().mockResolvedValue([]),
}));

mockNuxtImport('useAuthStore', () => () => ({
  user: { id: '1', role: 'Admin' },
  logout: vi.fn(),
}));

const mockEmployeeData: Employee = {
  id: '1',
  email: 'test@example.com',
  created_at: '2024-01-01',
  profile: {
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    avatar: null,
  },
  department: null,
  position: null,
};

mockNuxtImport(
  'useEmployeesStore',
  () => (): EmployeesStore => ({
    user: mockEmployeeData,
    loading: false,
    error: null,
    fetchUser: vi.fn(),
    updateUser: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  })
);

mockNuxtImport(
  'storeToRefs',
  () =>
    <T extends Record<string, unknown>>(store: T): ToRefs<T> => {
      return toRefs(reactive(store)) as ToRefs<T>;
    }
);

describe('User Profile Page', () => {
  it('renders correctly and fetches data', async () => {
    const wrapper = await mountSuspended(ProfilePage, {
      global: {
        stubs: {
          LayoutBreadcrumbs: true,
          UsersProfileTabs: true,
          ConfirmModal: true,
          UsersProfileAvatarUpload: true,
          UsersProfileEditForm: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('test@example.com');
  });
});
