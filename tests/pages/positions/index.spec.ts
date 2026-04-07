import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import {
  mountSuspended,
  mockNuxtImport,
  mockComponent,
} from '@nuxt/test-utils/runtime';
import PositionsPage from '../../../app/pages/positions/index.vue';
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

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

mockNuxtImport('useSeoMeta', () => vi.fn());

const setBreadcrumbsMock = vi.fn();
mockNuxtImport('useBreadcrumbs', () => {
  return () => ({
    setBreadcrumbs: setBreadcrumbsMock,
  });
});

const mockPositions = [
  { id: '1', name: 'Developer' },
  { id: '2', name: 'Manager' },
];

const fetchPositionsMock = vi.fn();
const createPositionMock = vi.fn();
const updatePositionMock = vi.fn();
const deletePositionMock = vi.fn();

mockNuxtImport('useDictionariesStore', () => {
  return () => ({
    positions: ref(mockPositions),
    loading: ref(false),
    fetchPositions: fetchPositionsMock,
    createPosition: createPositionMock,
    updatePosition: updatePositionMock,
    deletePosition: deletePositionMock,
  });
});

mockNuxtImport('storeToRefs', () => {
  return (store: Record<string, unknown>) => {
    return {
      positions: store.positions || ref(mockPositions),
      loading: store.loading || ref(false),
      user: store.user || ref({ role: UserRole.Admin }),
    };
  };
});

mockNuxtImport('useAuthStore', () => {
  return () => ({
    user: ref({ role: UserRole.Admin }),
  });
});

const openAddModalMock = vi.fn();
const openEditModalMock = vi.fn();
const openDeleteModalMock = vi.fn();
const showSuccessMock = vi.fn();
const showErrorMock = vi.fn();
const closeModalsMock = vi.fn();

mockNuxtImport('useTableManager', () => {
  return () => ({
    search: ref(''),
    isDeleteModal: ref(false),
    isAddModal: ref(false),
    isSnackbar: ref(false),
    actionMessage: ref(''),
    snackbarColor: ref('success'),
    loadingAction: ref(false),
    itemToDelete: ref(null),
    itemToEdit: ref(null),
    openAddModal: openAddModalMock,
    openEditModal: openEditModalMock,
    openDeleteModal: openDeleteModalMock,
    showSuccess: showSuccessMock,
    showError: showErrorMock,
    closeModals: closeModalsMock,
  });
});

mockComponent('ConfirmModal', {
  template: '<div data-test-id="delete-modal"><slot /></div>',
  props: ['modelValue', 'title', 'message', 'confirmText', 'cancelText'],
});

mockComponent('PositionsAddModal', {
  template: '<div data-test-id="add-modal"><slot /></div>',
  props: ['modelValue', 'loading', 'editData'],
});

mockComponent('PositionsTable', {
  template: '<div data-test-id="positions-table"><slot /></div>',
  props: ['items', 'loading', 'search', 'adminActions', 'canEdit'],
});

mockComponent('LayoutBreadcrumbs', {
  template: '<div>Breadcrumbs</div>',
});

describe('Positions Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches data on mount', async () => {
    const wrapper = await mountSuspended(PositionsPage, {
      global: {
        stubs: {
          VSnackbar: {
            template: '<div data-test-id="snackbar"><slot /></div>',
          },
          VTextField: { template: '<input data-test-id="search-input" />' },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(fetchPositionsMock).toHaveBeenCalled();
    expect(setBreadcrumbsMock).toHaveBeenCalled();

    expect(wrapper.find('[data-test-id="snackbar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="delete-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="add-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="search-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="positions-table"]').exists()).toBe(
      true
    );
  });

  it('shows add button for admin', async () => {
    const wrapper = await mountSuspended(PositionsPage);
    const addBtn = wrapper.find('[data-test-id="add-button"]');
    expect(addBtn.exists()).toBe(true);
  });
});
