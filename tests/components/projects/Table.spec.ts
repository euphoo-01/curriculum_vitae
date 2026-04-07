import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ProjectsTable from '../../../app/components/projects/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string, _fallback?: string) => key,
  });
});

describe('Projects Table Component', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Project A',
      internal_name: 'Int A',
      domain: 'Web',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    },
    {
      id: '2',
      name: 'Project B',
      internal_name: 'Int B',
      domain: 'Mobile',
      start_date: '2024-01-01',
      end_date: null,
    },
  ];

  const mockAdminActions = [
    { name: 'Update', action: vi.fn(), type: 'update' },
    { name: 'Delete', action: vi.fn(), type: 'delete' },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(ProjectsTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
        canEdit: true,
      },
    });

    expect(wrapper.find('[data-test-id="projects-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Project A');
    expect(wrapper.text()).toContain('Project B');
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(ProjectsTable, {
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
