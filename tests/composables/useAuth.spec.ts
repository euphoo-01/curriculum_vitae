import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../app/composables/useAuth';
import { useAuthStore, type AuthUser } from '../../app/stores/auth';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const mockQuery = vi.fn();
const mockMutate = vi.fn();
const mockOnLogin = vi.fn();
const mockOnLogout = vi.fn();
const mockGetToken = vi.fn();

mockNuxtImport('useApollo', () => {
  return () => ({
    onLogin: mockOnLogin,
    onLogout: mockOnLogout,
    getToken: mockGetToken,
    clients: {
      default: {
        query: mockQuery,
        mutate: mockMutate,
      },
    },
  });
});

mockNuxtImport('useCookie', () => {
  return () => {
    return { value: null };
  };
});

describe('useAuth Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('handles login successfully', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        login: {
          access_token: 'access-123',
          refresh_token: 'refresh-123',
          user: { id: 1, email: 'test@example.com' },
        },
      },
    });

    const auth = useAuth();
    const result = await auth.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockQuery).toHaveBeenCalled();
    expect(mockOnLogin).toHaveBeenCalledWith('access-123');
    expect(result.access_token).toBe('access-123');

    const store = useAuthStore();
    expect(store.user).toEqual({ id: 1, email: 'test@example.com' });
  });

  it('handles login failure', async () => {
    const error = new Error('Network error');
    mockQuery.mockRejectedValueOnce(error);

    const auth = useAuth();

    await expect(
      auth.login({ email: 'test@example.com', password: 'password123' })
    ).rejects.toThrow('Network error');
  });

  it('handles register successfully', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        signup: {
          access_token: 'access-reg',
          refresh_token: 'refresh-reg',
          user: { id: 2, email: 'new@example.com' },
        },
      },
    });

    const auth = useAuth();
    const result = await auth.register({
      email: 'new@example.com',
      password: 'password123',
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(mockOnLogin).toHaveBeenCalledWith('access-reg');
    expect(result.access_token).toBe('access-reg');
  });

  it('handles logout successfully', async () => {
    const auth = useAuth();
    const store = useAuthStore();
    store.setUser({ id: '1', email: 'test@example.com' } as AuthUser);

    await auth.logout();

    expect(mockOnLogout).toHaveBeenCalled();
    expect(store.user).toBeNull();
  });
});
