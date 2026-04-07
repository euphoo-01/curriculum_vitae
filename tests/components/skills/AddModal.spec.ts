import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import SkillsAddModal from '../../../app/components/skills/AddModal.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('Skills AddModal Component', () => {
  const defaultProps = {
    modelValue: true,
    loading: false,
    editData: null,
    categories: [
      { id: 'cat1', name: 'Frontend' },
      { id: 'cat2', name: 'Backend' },
    ],
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
    const wrapper = await mountSuspended(SkillsAddModal, {
      props: defaultProps,
      ...mountOptions,
    });

    expect(wrapper.find('[data-test-id="modal-title"]').text()).toContain(
      'common.actions.add'
    );
    expect(wrapper.find('[data-test-id="skills-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="input-name"]').exists()).toBe(true);
  });

  it('shows appropriate title for edit', async () => {
    const wrapper = await mountSuspended(SkillsAddModal, {
      props: {
        ...defaultProps,
        editData: {
          id: '1',
          name: 'Vue',
          categoryId: 'cat1',
        },
      },
      ...mountOptions,
    });

    expect(wrapper.find('[data-test-id="modal-title"]').text()).toContain(
      'common.actions.update'
    );
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(SkillsAddModal, {
      props: defaultProps,
      ...mountOptions,
    });

    await wrapper.find('[data-test-id="cancel-button"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
