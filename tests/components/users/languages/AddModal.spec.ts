import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import AddModal from '../../../../app/components/users/languages/AddModal.vue';
import { useNuxtApp } from '#imports';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

const mountOptions = {
  global: {
    stubs: {
      VDialog: {
        template: '<div id="v-dialog-stub"><slot /></div>',
      },
    },
  },
};

describe('Users Languages AddModal Component', () => {
  const languages = [{ name: 'English' }, { name: 'Spanish' }];

  beforeEach(() => {
    const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
      $apollo?: { defaultClient: ApolloClient };
    };

    const apolloMock = {
      mutate: vi.fn(),
      query: vi.fn(),
    };

    if (!nuxtApp.$apollo) {
      nuxtApp.provide('apollo', {
        defaultClient: apolloMock,
      });
    } else {
      nuxtApp.$apollo.defaultClient = apolloMock;
    }
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(AddModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        languages,
      },
    });

    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('languages.add');
  });

  it('emits update:modelValue on cancel', async () => {
    const wrapper = await mountSuspended(AddModal, {
      ...mountOptions,
      props: {
        modelValue: true,
        languages,
      },
    });

    await flushPromises();

    const closeBtn = wrapper
      .findAll('button')
      .filter((b) => b.text().includes('common.actions.cancel'))[0];

    if (!closeBtn) {
      const btns = wrapper.findAll('button');
      await btns[btns.length - 2].trigger('click');
    } else {
      await closeBtn.trigger('click');
    }

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
