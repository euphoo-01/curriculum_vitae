import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import LanguagesTable from '../../../app/components/languages/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string, _fallback?: string) => key,
  });
});

describe('Languages Table Component', () => {
  const mockItems = [
    { id: '1', name: 'English', native_name: 'English', iso2: 'en' },
    { id: '2', name: 'Russian', native_name: 'Русский', iso2: 'ru' },
  ];

  const mockAdminActions = [
    { name: 'Update', action: vi.fn(), type: 'update' },
    { name: 'Delete', action: vi.fn(), type: 'delete' },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(LanguagesTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
        canEdit: true,
      },
    });

    expect(wrapper.find('[data-test-id="languages-table"]').exists()).toBe(
      true
    );
    expect(wrapper.text()).toContain('English');
    expect(wrapper.text()).toContain('Русский');
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(LanguagesTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
        canEdit: false,
      },
    });

    expect(wrapper.find('[data-test-id="actions-button"]').exists()).toBe(
      false
    );
  });
});
