import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import SkillsTable from '../../../app/components/skills/Table.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string, _fallback?: string) => key,
  });
});

describe('Skills Table Component', () => {
  const mockItems = [
    { id: '1', name: 'Vue', category_name: 'Frontend' },
    { id: '2', name: 'Node', category_name: 'Backend' },
  ];

  const mockAdminActions = [
    { name: 'Update', action: vi.fn(), type: 'update' },
    { name: 'Delete', action: vi.fn(), type: 'delete' },
  ];

  it('renders correctly with items', async () => {
    const wrapper = await mountSuspended(SkillsTable, {
      props: {
        items: mockItems,
        loading: false,
        adminActions: mockAdminActions,
        canEdit: true,
      },
    });

    expect(wrapper.find('[data-test-id="skills-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Vue');
    expect(wrapper.text()).toContain('Frontend');
    expect(wrapper.text()).toContain('Node');
    expect(wrapper.text()).toContain('Backend');
  });

  it('does not render actions menu if canEdit is false', async () => {
    const wrapper = await mountSuspended(SkillsTable, {
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
