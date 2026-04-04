import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Login from '../../../app/pages/auth/login.vue';

const mockLogin = vi.fn();
mockNuxtImport('useAuthStore', () => {
  return () => ({
    login: mockLogin,
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = async () => {
    return await mountSuspended(Login, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
  };

  it('renders login form and handles submit', async () => {
    const wrapper = await createWrapper();

    const emailInput = wrapper.find('[data-test-id="email-input"] input');
    const passwordInput = wrapper.find('[data-test-id="password-input"] input');
    const form = wrapper.find('[data-test-id="login-form"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    await form.trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows error message on failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const wrapper = await createWrapper();

    const emailInput = wrapper.find('[data-test-id="email-input"] input');
    const passwordInput = wrapper.find('[data-test-id="password-input"] input');
    const form = wrapper.find('[data-test-id="login-form"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('wrong');

    await form.trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const alert = wrapper.find('[data-test-id="error-alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Invalid credentials');
  });
});
