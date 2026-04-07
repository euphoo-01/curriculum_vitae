import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AuthLayout from '../../app/layouts/auth.vue';

describe('Auth Layout', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      global: {
        stubs: {
          VMain: {
            template: '<main class="v-main-stub"><slot /></main>',
          },
        },
      },
      slots: {
        default: '<div class="test-slot">Slot Content</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.test-slot').exists()).toBe(true);
    expect(wrapper.text()).toContain('Slot Content');
  });
});
