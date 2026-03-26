import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../../../app/components/layout/Tabs.vue';

mockNuxtImport('useRoute', () => {
  return () => ({ path: '/profile' });
});

describe('Layout Tabs Component', () => {
  it('renders correctly', async () => {
    const items = [
      { title: 'Profile', to: '/profile', value: 'profile' },
      { title: 'Skills', to: '/skills', value: 'skills' },
    ];

    const wrapper = await mountSuspended(Tabs, {
      props: { items },
      global: {
        stubs: {
          VTabs: {
            template: '<div class="v-tabs"><slot /></div>',
            props: ['modelValue', 'alignTabs', 'color'],
          },
          VTab: {
            template: '<div class="v-tab" :data-value="value"><slot /></div>',
            props: ['value', 'to'],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);

    const tabs = wrapper.findAll('.v-tab');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toContain('Profile');
    expect(tabs[1].text()).toContain('Skills');
  });
});
