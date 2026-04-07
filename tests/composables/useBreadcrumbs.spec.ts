import { describe, it, expect, beforeEach } from 'vitest';
import { useBreadcrumbs } from '../../app/composables/useBreadcrumbs';
import { clearNuxtData } from '#app';

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    clearNuxtData('breadcrumbs');
    const { setBreadcrumbs } = useBreadcrumbs();
    setBreadcrumbs([]);
  });

  it('initializes with empty breadcrumbs', () => {
    const { breadcrumbs } = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([]);
  });

  it('initializes with provided items', () => {
    const items = [{ title: 'Home', to: '/' }];
    const { breadcrumbs } = useBreadcrumbs(items);
    expect(breadcrumbs.value).toEqual(items);
  });

  it('updates breadcrumbs via setBreadcrumbs', () => {
    const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([]);

    const newItems = [{ title: 'Dashboard', to: '/dashboard' }];
    setBreadcrumbs(newItems);
    expect(breadcrumbs.value).toEqual(newItems);
  });
});
