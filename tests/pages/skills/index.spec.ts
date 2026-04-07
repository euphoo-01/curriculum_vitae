import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import {
  mountSuspended,
  mockNuxtImport,
  mockComponent,
} from '@nuxt/test-utils/runtime';
import SkillsPage from '../../../app/pages/skills/index.vue';
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

const mockSkills = [
  { id: '1', name: 'Vue.js', category: { id: 'c1', name: 'Frontend' } },
  { id: '2', name: 'Node.js', category: { id: 'c2', name: 'Backend' } },
];

const mockCategories = [
  { id: 'c1', name: 'Frontend' },
  { id: 'c2', name: 'Backend' },
];

const fetchSkillsMock = vi.fn();
const fetchCategoriesMock = vi.fn();
const createSkillMock = vi.fn();
const updateSkillMock = vi.fn();
const deleteSkillMock = vi.fn();

mockNuxtImport('useDictionariesStore', () => {
  return () => ({
    skillsList: ref(mockSkills),
    categoriesList: ref(mockCategories),
    loading: ref(false),
    fetchSkills: fetchSkillsMock,
    fetchCategories: fetchCategoriesMock,
    createSkill: createSkillMock,
    updateSkill: updateSkillMock,
    deleteSkill: deleteSkillMock,
  });
});

mockNuxtImport('storeToRefs', () => {
  return (store: Record<string, unknown>) => {
    return {
      skillsList: store.skillsList || ref(mockSkills),
      categoriesList: store.categoriesList || ref(mockCategories),
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

mockComponent('SkillsAddModal', {
  template: '<div data-test-id="add-modal"><slot /></div>',
  props: ['modelValue', 'loading', 'editData', 'categories'],
});

mockComponent('SkillsTable', {
  template: '<div data-test-id="skills-table"><slot /></div>',
  props: ['items', 'loading', 'search', 'adminActions', 'canEdit'],
});

mockComponent('LayoutBreadcrumbs', {
  template: '<div>Breadcrumbs</div>',
});

describe('Skills Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches data on mount', async () => {
    const wrapper = await mountSuspended(SkillsPage, {
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
    expect(fetchSkillsMock).toHaveBeenCalled();
    expect(fetchCategoriesMock).toHaveBeenCalled();
    expect(setBreadcrumbsMock).toHaveBeenCalled();

    expect(wrapper.find('[data-test-id="snackbar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="delete-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="add-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="search-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="skills-table"]').exists()).toBe(true);
  });

  it('shows add button for admin', async () => {
    const wrapper = await mountSuspended(SkillsPage);
    const addBtn = wrapper.find('[data-test-id="add-button"]');
    expect(addBtn.exists()).toBe(true);
  });
});
