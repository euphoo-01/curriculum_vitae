import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ProjectsAddModal from '../../../app/components/projects/AddModal.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('Projects AddModal Component', () => {
  const defaultProps = {
    modelValue: true,
    loading: false,
    editData: null,
  };

  const mountOptions = {
    global: {
      stubs: {
        VDialog: {
          template: '<div data-test-id="dialog"><slot /></div>',
          props: ['modelValue'],
        },
      },
    },
  };

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(ProjectsAddModal, {
      props: defaultProps,
      ...mountOptions,
    });

    expect(wrapper.find('[data-test-id="modal-title"]').text()).toContain(
      'common.actions.add'
    );
    expect(wrapper.find('[data-test-id="projects-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="input-name"]').exists()).toBe(true);
  });

  it('shows appropriate title for edit', async () => {
    const wrapper = await mountSuspended(ProjectsAddModal, {
      props: {
        ...defaultProps,
        editData: {
          id: '1',
          name: 'Project A',
          internal_name: 'Int A',
          domain: 'Web',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          description: 'Desc',
          environment: ['Vue'],
        },
      },
      ...mountOptions,
    });

    expect(wrapper.find('[data-test-id="modal-title"]').text()).toContain(
      'common.actions.update'
    );
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(ProjectsAddModal, {
      props: defaultProps,
      ...mountOptions,
    });

    await wrapper.find('[data-test-id="cancel-button"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
