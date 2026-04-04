import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../../../app/components/auth/Tabs.vue';

mockNuxtImport('useRoute', () => {
  return () => ({ path: '/auth/login' });
});

describe('Auth Tabs Component', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(Tabs, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
        stubs: {
          VTabs: {
            template: '<div class="v-tabs"><slot /></div>',
            props: ['modelValue', 'alignTabs', 'color'],
          },
          VTab: {
            template:
              '<div class="v-tab" :data-test-id="$attrs[\'data-test-id\']"><slot /></div>',
            props: ['value', 'to'],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);

    const loginTab = wrapper.find('[data-test-id="login-tab"]');
    expect(loginTab.exists()).toBe(true);
    expect(loginTab.text()).toContain('common.actions.login');

    const registerTab = wrapper.find('[data-test-id="register-tab"]');
    expect(registerTab.exists()).toBe(true);
    expect(registerTab.text()).toContain('common.actions.create');
  });
});
