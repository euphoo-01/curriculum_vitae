import { useState } from '#app';

export interface BreadcrumbItem {
  title: string;
  disabled?: boolean;
  href?: string;
  to?: string | Record<string, any>;
}

export const useBreadcrumbs = (items?: BreadcrumbItem[]) => {
  const breadcrumbs = useState<BreadcrumbItem[]>('breadcrumbs', () => []);

  if (items) {
    breadcrumbs.value = items;
  }

  const setBreadcrumbs = (newItems: BreadcrumbItem[]) => {
    breadcrumbs.value = newItems;
  };

  return {
    breadcrumbs,
    setBreadcrumbs,
  };
};
