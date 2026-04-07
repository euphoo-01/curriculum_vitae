import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import PositionsTable from '../../../app/components/positions/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('Positions Table Component', () => {
  const mockItems = [
    { id: '1', name: 'Developer' },
    { id: '2', name: 'Manager' },
  ];

  const mockAdminActions = [
    { name: 'Update', action: vi.fn() },
    { name: 'Delete', action: vi.fn() },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(PositionsTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
        canEdit: true,
      },
    });

    expect(wrapper.find('[data-test-id="positions-table"]').exists()).toBe(
      true
    );

    expect(wrapper.text()).toContain('Developer');
    expect(wrapper.text()).toContain('Manager');
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(PositionsTable, {
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
