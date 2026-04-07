import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import EditModal from '../../../../app/components/users/languages/EditModal.vue';
import { Proficiency } from '../../../../graphql/generated/graphql';

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

describe('Users Languages EditModal Component', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: {
        modelValue: true,
        editData: { name: 'English', proficiency: Proficiency.B2 },
      },
      ...mountOptions,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('languages.edit');
  });

  it('emits delete on delete button click', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: {
        modelValue: true,
        editData: { name: 'English', proficiency: Proficiency.B2 },
      },
      ...mountOptions,
    });

    const deleteBtn = wrapper
      .findAll('button')
      .filter((b) => b.text() === 'common.actions.delete')[0];
    if (!deleteBtn) {
      const btns = wrapper.findAll('button');
      await btns[0].trigger('click');
    } else {
      await deleteBtn?.trigger('click');
    }

    expect(wrapper.emitted('delete')).toBeTruthy();
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: {
        modelValue: true,
        editData: { name: 'English', proficiency: Proficiency.B2 },
      },
      ...mountOptions,
    });

    const closeBtn = wrapper
      .findAll('button')
      .filter((b) => b.text() === 'common.actions.cancel')[0];
    if (!closeBtn) {
      const btns = wrapper.findAll('button');
      await btns[1].trigger('click');
    } else {
      await closeBtn?.trigger('click');
    }

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
