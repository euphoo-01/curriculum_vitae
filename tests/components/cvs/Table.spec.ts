import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import CvsTable from '../../../app/components/cvs/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('Cvs Table Component', () => {
  const mockItems = [
    { id: '1', name: 'CV 1', description: 'Desc 1' },
    { id: '2', name: 'CV 2', description: 'Desc 2' },
  ];

  const mockAdminActions = [
    { name: 'Update', action: vi.fn() },
    { name: 'Delete', action: vi.fn() },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(CvsTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
      },
    });

    expect(wrapper.find('[data-test-id="cvs-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('CV 1');
    expect(wrapper.text()).toContain('CV 2');
  });

  it('renders actions button', async () => {
    const wrapper = await mountSuspended(CvsTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
      },
    });

    expect(wrapper.find('[data-test-id="actions-button"]').exists()).toBe(true);
  });
});
