import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AddModal from '../../../../app/components/cvs/projects/AddModal.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

const mountOptions = {
  global: {
    stubs: {
      VDialog: {
        template: '<div><slot /></div>',
      },
    },
  },
};

describe('CVs Projects AddModal Component', () => {
  const projects = [
    { id: '1', name: 'Project A' },
    { id: '2', name: 'Project B' },
  ];

  it('renders correctly for adding', async () => {
    const wrapper = await mountSuspended(AddModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        projects,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('common.actions.add');
  });

  it('renders correctly for editing', async () => {
    const wrapper = await mountSuspended(AddModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        projects,
        editData: {
          projectId: '1',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          roles: ['Developer'],
          responsibilities: ['Coding'],
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('common.actions.update');
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(AddModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        projects,
      },
    });

    const closeBtn = wrapper
      .findAll('button')
      .filter((b) => b.text() === 'common.actions.cancel')[0];
    if (!closeBtn) {
      const btns = wrapper.findAll('button');
      await btns[btns.length - 2].trigger('click');
    } else {
      await closeBtn?.trigger('click');
    }

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
