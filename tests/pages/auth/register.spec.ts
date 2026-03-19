import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Register from '../../../app/pages/auth/register.vue';

const mockRegister = vi.fn();
mockNuxtImport('useAuth', () => {
  return () => ({
    register: mockRegister,
  });
});

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = async () => {
    return await mountSuspended(Register, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
  };

  it('renders register form and handles submit', async () => {
    const wrapper = await createWrapper();

    const emailInput = wrapper.find('[data-test-id="email-input"] input');
    const passwordInput = wrapper.find('[data-test-id="password-input"] input');
    const form = wrapper.find('[data-test-id="register-form"]');

    await emailInput.setValue('new@example.com');
    await passwordInput.setValue('password123');

    await form.trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
    });
  });

  it('shows error message on failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('User already exists'));
    const wrapper = await createWrapper();

    const emailInput = wrapper.find('[data-test-id="email-input"] input');
    const passwordInput = wrapper.find('[data-test-id="password-input"] input');
    const form = wrapper.find('[data-test-id="register-form"]');

    await emailInput.setValue('exist@example.com');
    await passwordInput.setValue('password123');

    await form.trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const alert = wrapper.find('[data-test-id="error-alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('User already exists');
  });
});
