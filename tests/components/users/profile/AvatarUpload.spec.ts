import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AvatarUpload from '../../../../app/components/users/profile/AvatarUpload.vue';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
}));

describe('AvatarUpload Component', () => {
  it('renders initials when no avatar URL is provided', async () => {
    const wrapper = await mountSuspended(AvatarUpload, {
      props: {
        avatarUrl: null,
        initials: 'JD',
        canEdit: true,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
        stubs: {
          VRow: { template: '<div><slot /></div>' },
          VCol: { template: '<div><slot /></div>' },
          VAvatar: { template: '<div class="v-avatar"><slot /></div>' },
          VImg: { template: '<div><slot /></div>' },
          VIcon: { template: '<div></div>' },
          VOverlay: { template: '<div><slot /></div>' },
          VProgressCircular: { template: '<div></div>' },
        },
      },
    });

    expect(wrapper.text()).toContain('JD');
    expect(wrapper.text()).toContain('profile.avatar.uploadTitle');
  });
});
