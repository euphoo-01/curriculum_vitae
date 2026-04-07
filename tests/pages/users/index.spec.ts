import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import UsersPage from '../../../app/pages/users/index.vue';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

const mockFetchUsers = vi.fn();
const mockDeleteUser = vi.fn();
const mockCreateUser = vi.fn();
const mockUsers = ref([]);
const mockLoading = ref(false);
const mockError = ref<string | null>(null);

mockNuxtImport('useEmployeesStore', () => () => ({
  users: mockUsers,
  loading: mockLoading,
  error: mockError,
  fetchUsers: mockFetchUsers,
  deleteUser: mockDeleteUser,
  createUser: mockCreateUser,
}));

mockNuxtImport('useDictionariesStore', () => () => ({
  fetchDepartments: vi.fn().mockResolvedValue([]),
  fetchPositions: vi.fn().mockResolvedValue([]),
}));

mockNuxtImport('useAuthStore', () => () => ({
  user: ref({ role: 'Admin' }),
}));

const mockRouterPush = vi.fn();
mockNuxtImport('useRouter', () => () => ({
  push: mockRouterPush,
  replace: vi.fn(),
  afterEach: vi.fn(),
}));

const openDeleteModalMock = vi.fn();
const showSuccessMock = vi.fn();
const showErrorMock = vi.fn();
const searchMock = ref('');
const itemToDeleteMock = ref('user-123');

mockNuxtImport('useTableManager', () => () => ({
  search: searchMock,
  isDeleteModal: ref(false),
  isAddModal: ref(false),
  isSnackbar: ref(false),
  actionMessage: ref(''),
  snackbarColor: ref('success'),
  itemToDelete: itemToDeleteMock,
  openDeleteModal: openDeleteModalMock,
  showSuccess: showSuccessMock,
  showError: showErrorMock,
}));

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }));
mockNuxtImport('useSeoMeta', () => vi.fn());
mockNuxtImport('useBreadcrumbs', () => () => ({ setBreadcrumbs: vi.fn() }));

const mountOptions = {
  global: {
    mocks: {
      $t: (key: string) => key,
    },
    stubs: {
      UsersAddModal: true,
      ConfirmModal: true,
      UsersTable: true,
      LayoutBreadcrumbs: true,
      VSnackbar: true,
      VTextField: true,
      VCard: { template: '<div><slot /></div>' },
      VCardText: { template: '<div><slot /></div>' },
      VRow: { template: '<div><slot /></div>' },
      VBtn: { template: '<button><slot /></button>' },
    },
  },
};

describe('Users Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockError.value = null;
    searchMock.value = '';
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(UsersPage, mountOptions);
    expect(wrapper.exists()).toBe(true);
    expect(mockFetchUsers).toHaveBeenCalled();
  });

  it('handles successful user creation', async () => {
    const wrapper = await mountSuspended(UsersPage, mountOptions);
    const modal = wrapper.findComponent({ name: 'UsersAddModal' });

    await modal.vm.$emit('submit', { email: 'new@user.com' });
    await flushPromises();

    expect(mockCreateUser).toHaveBeenCalledWith({ email: 'new@user.com' });
    expect(showSuccessMock).toHaveBeenCalled();
  });

  it('handles user creation error via throw', async () => {
    const wrapper = await mountSuspended(UsersPage, mountOptions);
    mockCreateUser.mockRejectedValueOnce(new Error('Network Fail'));

    const modal = wrapper.findComponent({ name: 'UsersAddModal' });
    await modal.vm.$emit('submit', { email: 'new@user.com' });
    await flushPromises();

    expect(showErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('Network Fail')
    );
  });

  it('handles successful user deletion', async () => {
    const wrapper = await mountSuspended(UsersPage, mountOptions);
    const modal = wrapper.findComponent({ name: 'ConfirmModal' });

    await modal.vm.$emit('confirm');
    await flushPromises();

    expect(mockDeleteUser).toHaveBeenCalledWith('user-123');
    expect(showSuccessMock).toHaveBeenCalled();
  });

  it('handles search input with debounce', async () => {
    vi.useFakeTimers();
    const wrapper = await mountSuspended(UsersPage, mountOptions);

    const searchInput = wrapper.findComponent({ name: 'VTextField' });
    await searchInput.vm.$emit('update:modelValue', 'john');

    vi.advanceTimersByTime(300);
    expect(searchMock.value).toBe('john');
    vi.useRealTimers();
  });

  it('executes admin table actions properly', async () => {
    const wrapper = await mountSuspended(UsersPage, mountOptions);
    const table = wrapper.findComponent({ name: 'UsersTable' });
    const actions = table.props('adminActions');

    actions[0].action('user-1');
    expect(mockRouterPush).toHaveBeenCalledWith('/users/user-1/profile');

    actions[1].action('user-2');
    expect(openDeleteModalMock).toHaveBeenCalledWith('user-2');
  });
});
