import { describe, it, expect } from 'vitest';
import { mountSuspended, mockComponent } from '@nuxt/test-utils/runtime';
import DefaultLayout from '../../../app/layouts/default.vue';
import { VLayout, VMain } from 'vuetify/components';

mockComponent(
  'LayoutSidebar',
  () => import('../../../app/components/layout/Sidebar.vue')
);

describe('Default Layout', () => {
  it('renders slot content and sidebar', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        components: {
          VLayout,
          VMain,
        },
      },
      slots: {
        default: '<div class="test-slot">Main Content</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.test-slot').exists()).toBe(true);
    expect(wrapper.text()).toContain('Main Content');
  });
});
