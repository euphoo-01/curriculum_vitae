import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AddModal from '../../../app/components/users/AddModal.vue';
import { UserRole } from '../../../graphql/generated/graphql';

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

describe('Users AddModal Component', () => {
  const departments = [{ id: 'dep-1', name: 'IT' }];
  const positions = [{ id: 'pos-1', name: 'Developer' }];
  const roles = [UserRole.Admin, UserRole.Employee];

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        departments,
        positions,
        roles,
      },
      ...mountOptions,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('profile.create');
  });

  it('emits update:modelValue on close', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        departments,
        positions,
        roles,
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
