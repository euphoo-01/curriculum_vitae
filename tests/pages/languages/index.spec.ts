import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import LanguagesPage from '../../../app/pages/languages/index.vue';
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

const mockLanguages = [
  { id: '1', name: 'English', native_name: 'English', iso2: 'en' },
];

const fetchLanguagesMock = vi.fn();

mockNuxtImport('useDictionariesStore', () => {
  return () => ({
    languagesList: ref(mockLanguages),
    loading: ref(false),
    fetchLanguages: fetchLanguagesMock,
  });
});

mockNuxtImport('storeToRefs', () => {
  return (store: Record<string, unknown>) => {
    return {
      languagesList: store.languagesList || ref(mockLanguages),
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

describe('Languages Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches data on mount', async () => {
    const wrapper = await mountSuspended(LanguagesPage);

    expect(fetchLanguagesMock).toHaveBeenCalled();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('English');
  });

  it('shows add button for admin', async () => {
    const wrapper = await mountSuspended(LanguagesPage);

    const addBtn = wrapper.find('button');
    expect(addBtn.exists()).toBe(true);
  });
});
