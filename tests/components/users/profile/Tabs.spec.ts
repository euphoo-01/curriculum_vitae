import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../../../../app/components/users/profile/Tabs.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

mockNuxtImport('useRoute', () => {
  return () => ({
    params: { userId: 'user-123' },
  });
});

describe('User Profile Tabs Component', () => {
  it('renders correctly and has layout tabs component', async () => {
    const wrapper = await mountSuspended(Tabs);

    expect(wrapper.exists()).toBe(true);

    const layoutTabs = wrapper.findComponent({ name: 'LayoutTabs' });
    expect(layoutTabs.exists()).toBe(true);

    // Verify props passed to LayoutTabs
    const items = layoutTabs.props('items') as Array<{
      title: string;
      to: string;
      value: string;
    }>;

    expect(items.length).toBe(4);

    expect(items[0].value).toBe('profile');
    expect(items[0].to).toBe('/users/user-123/profile');
    expect(items[0].title).toBe('profile.title');

    expect(items[1].value).toBe('skills');
    expect(items[1].to).toBe('/users/user-123/skills');
    expect(items[1].title).toBe('profile.skills');

    expect(items[2].value).toBe('languages');
    expect(items[2].to).toBe('/users/user-123/languages');
    expect(items[2].title).toBe('profile.languages');

    expect(items[3].value).toBe('cvs');
    expect(items[3].to).toBe('/users/user-123/cvs');
    expect(items[3].title).toBe('cvs.title');
  });
});
