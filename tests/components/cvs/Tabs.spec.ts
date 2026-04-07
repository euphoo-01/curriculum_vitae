import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../../../app/components/cvs/Tabs.vue';
import LayoutTabs from '../../../app/components/layout/Tabs.vue';

mockNuxtImport('useRoute', () => {
  return () => ({ params: { cvId: '123' }, path: '/cvs/123/details' });
});

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('CVs Tabs Component', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(Tabs);

    const tabs = wrapper.find('[data-test-id="cvs-tabs"]');
    expect(tabs.exists()).toBe(true);

    const layoutTabs = wrapper.findComponent(LayoutTabs);
    expect(layoutTabs.exists()).toBe(true);

    const items = layoutTabs.props('items') as Array<{
      title: string;
      to: string;
      value: string;
    }>;
    expect(items.length).toBe(4);
    expect(items[0].value).toBe('details');
    expect(items[0].to).toBe('/cvs/123/details');
  });
});
