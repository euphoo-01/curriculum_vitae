import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AddModal from '../../../app/components/departments/AddModal.vue';
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
    form: { name: '' },
    close: vi.fn(),
    submit: vi.fn(),
  });
});

describe('Departments AddModal Component', () => {
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

    expect(wrapper.html()).toContain('common.actions.add');
    expect(wrapper.html()).toContain('common.actions.create');
  });

  it('shows appropriate title for edit', async () => {
    const wrapper = await mountSuspended(AddModal, {
      props: {
        modelValue: true,
        editData: { id: '1', name: 'Engineering' },
      },
      ...mountOptions,
    });

    expect(wrapper.html()).toContain('common.actions.update');
    expect(wrapper.html()).toContain('common.actions.save');
  });
});
