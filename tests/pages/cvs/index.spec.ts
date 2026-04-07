import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mountSuspended,
  mockNuxtImport,
  mockComponent,
} from '@nuxt/test-utils/runtime';
import CvsPage from '../../../app/pages/cvs/index.vue';
import { UserRole } from '../../../graphql/generated/graphql';
import { ref } from 'vue';

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

const mockCvs = [
  {
    id: '1',
    name: 'Software Engineer CV',
    description: 'Experience in Vue',
    user: { id: '1' },
  },
];

const fetchAllCvsMock = vi.fn();
mockNuxtImport('useCvsStore', () => {
  return () => ({
    allCvs: ref(mockCvs),
    loading: ref(false),
    fetchAllCvs: fetchAllCvsMock,
  });
});

mockNuxtImport('storeToRefs', () => {
  return (store: Record<string, unknown>) => {
    if (store.allCvs) {
      return {
        allCvs: store.allCvs,
        loading: store.loading,
      };
    }
    if (store.user) {
      return {
        user: store.user,
      };
    }
    return {};
  };
});

mockNuxtImport('useAuthStore', () => {
  return () => ({
    user: ref({ id: '1', role: UserRole.Admin }),
  });
});

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
    openAddModal: vi.fn(),
    openEditModal: vi.fn(),
    openDeleteModal: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    closeModals: vi.fn(),
  });
});

mockComponent('LayoutBreadcrumbs', {
  template: '<div>Breadcrumbs</div>',
});

mockComponent('ConfirmModal', {
  template: '<div data-test-id="confirm-modal"><slot /></div>',
  props: ['modelValue'],
});

mockComponent('UsersCvsAddModal', {
  template: '<div data-test-id="add-modal"><slot /></div>',
  props: ['modelValue'],
});

mockComponent('CvsTable', {
  template: '<div data-test-id="cvs-table"><slot /></div>',
  props: ['items', 'loading'],
});

describe('CVs Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches CVs', async () => {
    const wrapper = await mountSuspended(CvsPage, {
      global: {
        stubs: {
          VSnackbar: {
            template: '<div data-test-id="snackbar"><slot /></div>',
          },
          VTextField: { template: '<input data-test-id="search-input" />' },
          VBtn: {
            template: '<button data-test-id="add-button"><slot /></button>',
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(fetchAllCvsMock).toHaveBeenCalled();
    expect(setBreadcrumbsMock).toHaveBeenCalled();
    expect(wrapper.find('[data-test-id="cvs-table"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="add-button"]').exists()).toBe(true);
  });
});
