import { describe, it, expect } from 'vitest';
import { useFormatters } from '../../app/composables/useFormatters';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

mockNuxtImport('useI18n', () => () => ({
  locale: { value: 'en-US' },
}));

describe('useFormatters Composable', () => {
  it('formats dates correctly', () => {
    const { formatDate } = useFormatters();

    const dateStr = formatDate(1710000000000);
    expect(typeof dateStr).toBe('string');
    expect(dateStr).toContain('2024');

    const dateStr2 = formatDate('1710000000000');
    expect(typeof dateStr2).toBe('string');
    expect(dateStr2).toContain('2024');

    expect(formatDate(undefined)).toBe('');
    expect(formatDate('invalid')).toBe('invalid');
  });

  it('gets initials correctly', () => {
    const { getInitials } = useFormatters();

    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('John')).toBe('J');
    expect(getInitials('')).toBe('');
    expect(getInitials(undefined)).toBe('');
    expect(getInitials(null)).toBe('');
  });
});
