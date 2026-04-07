import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Table from '../../../../app/components/cvs/projects/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string, _defaultValue?: string) => key,
  });
});

describe('CVs Projects Table Component', () => {
  const items = [
    {
      name: 'Proj 1',
      internal_name: 'P1',
      domain: 'Web',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      project: {
        id: 'p-1',
        name: 'Proj 1',
        internal_name: 'P1',
        domain: 'Web',
        start_date: '2023-01-01',
      },
      roles: [],
      responsibilities: [],
    },
    {
      name: 'Proj 2',
      internal_name: 'P2',
      domain: 'Mobile',
      start_date: '2024-01-01',
      end_date: null,
      project: {
        id: 'p-2',
        name: 'Proj 2',
        internal_name: 'P2',
        domain: 'Mobile',
        start_date: '2024-01-01',
      },
      roles: [],
      responsibilities: [],
    },
  ];

  const adminActions = [
    { name: 'Edit', action: vi.fn() },
    { name: 'Delete', action: vi.fn() },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(Table, {
      props: {
        items,
        adminActions,
        canEdit: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(Table, {
      props: {
        items,
        adminActions,
        canEdit: false,
      },
    });

    const menu = wrapper.find('[data-test-id="actions-button"]');
    expect(menu.exists()).toBe(false);
  });
});
