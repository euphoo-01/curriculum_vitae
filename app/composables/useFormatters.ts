import { useI18n } from 'vue-i18n';

export const useFormatters = () => {
  const { locale } = useI18n();

  const formatDate = (timestamp: string | number | undefined) => {
    if (!timestamp) return '';
    try {
      const ts =
        typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      if (isNaN(ts)) return timestamp.toString();
      const date = new Date(ts);
      return new Intl.DateTimeFormat(locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return timestamp.toString();
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return {
    formatDate,
    getInitials,
  };
};
