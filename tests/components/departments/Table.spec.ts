import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DepartmentsTable from '../../../app/components/departments/Table.vue';
import { AdminActionsNames } from '../../../app/types/users';

describe('Departments Table Component', () => {
  const items = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Marketing' },
  ];

  const adminActions = [
    {
      name: 'Edit',
      type: AdminActionsNames.SEE,
      action: vi.fn(),
    },
    {
      name: 'Delete',
      type: AdminActionsNames.DELETE,
      action: vi.fn(),
    },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(DepartmentsTable, {
      props: {
        items,
        adminActions,
        canEdit: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
    const dataTable = wrapper.find('[data-test-id="data-table"]');
    expect(dataTable.exists()).toBe(true);
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(DepartmentsTable, {
      props: {
        items,
        adminActions,
        canEdit: false,
      },
    });

    const menuBtn = wrapper.find('[data-test-id="actions-menu-btn"]');
    expect(menuBtn.exists()).toBe(false);
  });
});
