import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Chip from '../../../../app/components/users/skills/Chip.vue';
import { Mastery } from '../../../../graphql/generated/graphql';

describe('Users Skills Chip Component', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        skill: { name: 'Vue.js', mastery: Mastery.Proficient },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Vue.js');
  });

  it('emits click event when not disabled', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        skill: { name: 'Vue.js', mastery: Mastery.Proficient },
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        skill: { name: 'Vue.js', mastery: Mastery.Proficient },
        disabled: true,
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('has selected class when selected is true', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: {
        skill: { name: 'Vue.js', mastery: Mastery.Proficient },
        selected: true,
      },
    });

    expect(wrapper.classes()).toContain('border-error');
  });
});
