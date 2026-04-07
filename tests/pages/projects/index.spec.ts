import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mountSuspended,
  mockNuxtImport,
  mockComponent,
} from '@nuxt/test-utils/runtime';
import ProjectsPage from '../../../app/pages/projects/index.vue';
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

const mockProjects = [
  {
    id: '1',
    name: 'Project Alpha',
    domain: 'Tech',
    start_date: '2023-01-01',
    environment: ['Vue', 'Nuxt'],
  },
];

const fetchProjectsMock = vi.fn();
mockNuxtImport('useProjectsStore', () => {
  return () => ({
    projects: ref(mockProjects),
    loading: ref(false),
    fetchProjects: fetchProjectsMock,
  });
});

mockNuxtImport('storeToRefs', () => {
  return (store: Record<string, unknown>) => {
    if (store.projects) {
      return {
        projects: store.projects,
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
    user: ref({ role: UserRole.Admin }),
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

mockComponent('ProjectsAddModal', {
  template: '<div data-test-id="add-modal"><slot /></div>',
  props: ['modelValue'],
});

mockComponent('ProjectsTable', {
  template: '<div data-test-id="projects-table"><slot /></div>',
  props: ['items', 'loading'],
});

describe('Projects Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches projects', async () => {
    const wrapper = await mountSuspended(ProjectsPage, {
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
    expect(fetchProjectsMock).toHaveBeenCalled();
    expect(setBreadcrumbsMock).toHaveBeenCalled();
    expect(wrapper.find('[data-test-id="projects-table"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="add-button"]').exists()).toBe(true);
  });
});
