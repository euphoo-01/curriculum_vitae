import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DepartmentsPage from '../../../app/pages/departments/index.vue';
import { UserRole } from '../../../graphql/generated/graphql';
import { ref } from 'vue';

beforeAll(() => {
  if (!global.visualViewport) {
    global.visualViewport = {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as VisualViewport;
  }
});

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }));
mockNuxtImport('useSeoMeta', () => vi.fn());

const setBreadcrumbsMock = vi.fn();
mockNuxtImport('useBreadcrumbs', () => () => ({
  setBreadcrumbs: setBreadcrumbsMock,
}));

const mockDepartments = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Marketing' },
];

const fetchDepartmentsMock = vi.fn();
const createDepartmentMock = vi.fn();
const updateDepartmentMock = vi.fn();
const deleteDepartmentMock = vi.fn();

mockNuxtImport('useDictionariesStore', () => () => ({
  departments: ref(mockDepartments),
  loading: ref(false),
  fetchDepartments: fetchDepartmentsMock,
  createDepartment: createDepartmentMock,
  updateDepartment: updateDepartmentMock,
  deleteDepartment: deleteDepartmentMock,
}));

mockNuxtImport('storeToRefs', () => (store: Record<string, unknown>) => ({
  departments: store.departments || ref(mockDepartments),
  loading: store.loading || ref(false),
  user: store.user || ref({ role: UserRole.Admin }),
}));

mockNuxtImport('useAuthStore', () => () => ({
  user: ref({ role: UserRole.Admin }),
}));

const openAddModalMock = vi.fn();
const openEditModalMock = vi.fn();
const openDeleteModalMock = vi.fn();
const showSuccessMock = vi.fn();
const showErrorMock = vi.fn();
const closeModalsMock = vi.fn();
const loadingActionMock = ref(false);
const itemToDeleteMock = ref('1');

mockNuxtImport('useTableManager', () => () => ({
  search: ref(''),
  isDeleteModal: ref(false),
  isAddModal: ref(false),
  isSnackbar: ref(false),
  actionMessage: ref(''),
  snackbarColor: ref('success'),
  loadingAction: loadingActionMock,
  itemToDelete: itemToDeleteMock,
  itemToEdit: ref(null),
  openAddModal: openAddModalMock,
  openEditModal: openEditModalMock,
  openDeleteModal: openDeleteModalMock,
  showSuccess: showSuccessMock,
  showError: showErrorMock,
  closeModals: closeModalsMock,
}));

const mountOptions = {
  global: {
    stubs: {
      DepartmentsAddModal: true,
      ConfirmModal: true,
      DepartmentsTable: true,
      LayoutBreadcrumbs: true,
      VSnackbar: true,
      VTextField: true,
    },
  },
};

describe('Departments Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches data on mount', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    expect(wrapper.exists()).toBe(true);
    expect(fetchDepartmentsMock).toHaveBeenCalled();
  });

  it('shows add button for admin', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    expect(wrapper.find('[data-test-id="add-button"]').exists()).toBe(true);
  });

  it('handles successful department creation', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    const modal = wrapper.findComponent({ name: 'DepartmentsAddModal' });

    await modal.vm.$emit('submit', { name: 'HR' });
    await flushPromises();

    expect(createDepartmentMock).toHaveBeenCalledWith({ name: 'HR' });
    expect(showSuccessMock).toHaveBeenCalled();
    expect(loadingActionMock.value).toBe(false);
  });

  it('handles successful department update', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    const modal = wrapper.findComponent({ name: 'DepartmentsAddModal' });

    await modal.vm.$emit('submit', { id: '1', name: 'HR Updated' });
    await flushPromises();

    expect(updateDepartmentMock).toHaveBeenCalledWith({
      departmentId: '1',
      name: 'HR Updated',
    });
    expect(showSuccessMock).toHaveBeenCalled();
  });

  it('handles department submit error', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    createDepartmentMock.mockRejectedValueOnce(new Error('API Fail'));

    const modal = wrapper.findComponent({ name: 'DepartmentsAddModal' });
    await modal.vm.$emit('submit', { name: 'HR' });
    await flushPromises();

    expect(showErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('API Fail')
    );
  });

  it('handles successful department deletion', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    const modal = wrapper.findComponent({ name: 'ConfirmModal' });

    await modal.vm.$emit('confirm');
    await flushPromises();

    expect(deleteDepartmentMock).toHaveBeenCalledWith('1');
    expect(showSuccessMock).toHaveBeenCalled();
    expect(closeModalsMock).toHaveBeenCalled();
  });

  it('handles department deletion error', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    deleteDepartmentMock.mockRejectedValueOnce(new Error('In Use'));

    const modal = wrapper.findComponent({ name: 'ConfirmModal' });
    await modal.vm.$emit('confirm');
    await flushPromises();

    expect(showErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('In Use')
    );
    expect(closeModalsMock).toHaveBeenCalled();
  });

  it('executes admin table actions properly', async () => {
    const wrapper = await mountSuspended(DepartmentsPage, mountOptions);
    const table = wrapper.findComponent({ name: 'DepartmentsTable' });
    const actions = table.props('adminActions');

    actions[0].action('1');
    expect(openEditModalMock).toHaveBeenCalledWith({
      id: '1',
      name: 'Engineering',
    });

    actions[0].action('999');
    expect(openEditModalMock).toHaveBeenCalledTimes(1);

    actions[1].action('2');
    expect(openDeleteModalMock).toHaveBeenCalledWith('2');
  });
});
