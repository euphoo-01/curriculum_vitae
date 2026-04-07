import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Chip from '../../../../app/components/users/languages/Chip.vue';
import { Proficiency } from '../../../../graphql/generated/graphql';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

describe('Users Languages Chip Component', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        language: { name: 'English', proficiency: Proficiency.B2 },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('English');
    expect(wrapper.text()).toContain('proficiency.B2');
  });

  it('emits click event when not disabled', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        language: { name: 'English', proficiency: Proficiency.B2 },
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        language: { name: 'English', proficiency: Proficiency.B2 },
        disabled: true,
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('has selected class when selected is true', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        language: { name: 'English', proficiency: Proficiency.B2 },
        selected: true,
      },
    });

    expect(wrapper.classes()).toContain('border-error');
  });
});
