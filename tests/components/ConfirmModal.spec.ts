import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import ConfirmModal from '../../app/components/ConfirmModal.vue';

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

describe('ConfirmModal Component', () => {
  it('renders correctly with default props', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      ...mountOptions,
      props: {
        modelValue: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('confirmModal.title');
    expect(wrapper.text()).toContain('confirmModal.message');
    expect(wrapper.text()).toContain('confirmModal.cancel');
    expect(wrapper.text()).toContain('confirmModal.confirm');
  });

  it('renders correctly with custom props', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        title: 'Custom Title',
        message: 'Custom Message',
        confirmText: 'Yes',
        cancelText: 'No',
        confirmColor: 'primary',
      },
    });

    expect(wrapper.text()).toContain('Custom Title');
    expect(wrapper.text()).toContain('Custom Message');
    expect(wrapper.text()).toContain('Yes');
    expect(wrapper.text()).toContain('No');
  });

  it('emits confirm and update:modelValue events on confirm click', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      ...mountOptions,
      props: {
        modelValue: true,
      },
    });

    const buttons = wrapper.findAll('button');
    const confirmButton = buttons[1];

    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('emits cancel and update:modelValue events on cancel click', async () => {
    const wrapper = await mountSuspended(ConfirmModal, {
      ...mountOptions,
      props: {
        modelValue: true,
      },
    });

    const buttons = wrapper.findAll('button');
    const cancelButton = buttons[0];

    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
