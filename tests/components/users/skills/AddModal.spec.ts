import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AddModal from '../../../../app/components/users/skills/AddModal.vue';

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

describe('Users Skills AddModal Component', () => {
  const skills = [{ name: 'Vue.js' }, { name: 'React' }];

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        skills,
      },
      ...mountOptions,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('skills.add');
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        skills,
      },
      ...mountOptions,
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
