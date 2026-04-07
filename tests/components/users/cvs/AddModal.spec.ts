import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AddModal from '../../../../app/components/users/cvs/AddModal.vue';
import { ref } from 'vue';

beforeAll(() => {
  if (!global.visualViewport) {
    global.visualViewport = {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as VisualViewport;
  }
});

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

mockNuxtImport('useDomainForm', () => {
  return () => ({
    formRef: ref(null),
    form: { name: '', description: '' },
    close: vi.fn(),
    submit: vi.fn(),
  });
});

describe('Users CVs AddModal Component', () => {
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
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
      },
      ...mountOptions,
    });

    expect(wrapper.exists()).toBe(true);
    const dialog = wrapper.find('[data-test-id="dialog"]');
    expect(dialog.exists()).toBe(true);
  });

  it('shows appropriate title for add', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        editData: null,
      },
      ...mountOptions,
    });

    expect(wrapper.html()).toContain('cvs.add');
    expect(wrapper.html()).toContain('common.actions.create');
  });

  it('shows appropriate title for edit', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        editData: {
          id: '1',
          name: 'Frontend CV',
          description: 'Expert in Vue',
        },
      },
      ...mountOptions,
    });

    expect(wrapper.html()).toContain('cvs.edit');
    expect(wrapper.html()).toContain('common.actions.save');
  });

  it('has data-test-id attributes on important elements', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
      },
      ...mountOptions,
    });

    expect(wrapper.find('[data-test-id="name-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="description-input"]').exists()).toBe(
      true
    );
    expect(wrapper.find('[data-test-id="cancel-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="submit-button"]').exists()).toBe(true);
  });
});
