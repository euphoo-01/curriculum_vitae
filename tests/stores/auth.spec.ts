import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore, type AuthUser } from '../../app/stores/auth';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useNuxtApp } from '#imports';

interface CookieMock {
  value: string | null;
}

interface GraphQLErrorResponse {
  graphQLErrors: Array<{
    message: string;
    extensions?: {
      response?: {
        message?: string | string[];
      };
    };
  }>;
}

interface ApolloClientMock {
  mutate: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
}

const mutateMock = vi.fn();
const queryMock = vi.fn();
const onLoginMock = vi.fn();
const onLogoutMock = vi.fn();
const navigateToMock = vi.fn();

let mockCookies: Record<string, CookieMock> = {};

mockNuxtImport('useApollo', () => {
  return () => ({
    onLogin: (token: string) => onLoginMock(token),
    onLogout: () => onLogoutMock(),
  });
});

mockNuxtImport('useCookie', () => {
  return (name: string): CookieMock => {
    if (!mockCookies[name]) {
      mockCookies[name] = { value: null };
    }
    return mockCookies[name];
  };
});

mockNuxtImport('navigateTo', () => {
  return (url: string) => navigateToMock(url);
});

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockCookies = {};

    const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
      $apollo?: { defaultClient: ApolloClientMock };
    };

    const apolloMock: ApolloClientMock = {
      mutate: mutateMock,
      query: queryMock,
    };

    if (!nuxtApp.$apollo) {
      nuxtApp.provide('apollo', {
        defaultClient: apolloMock,
      });
    } else {
      nuxtApp.$apollo.defaultClient = apolloMock;
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null user and checks isAuthenticated', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('sets user and userId correctly', () => {
    const store = useAuthStore();
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
    } as AuthUser;
    store.setUser(mockUser);
    expect(store.user).toEqual(mockUser);
    expect(store.userId.value).toBe('1');
    expect(store.isAuthenticated).toBe(true);
  });

  it('clears user and userId correctly', () => {
    const store = useAuthStore();
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
    } as AuthUser;
    store.setUser(mockUser);
    store.clearUser();
    expect(store.user).toBeNull();
    expect(store.userId.value).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  describe('getUser', () => {
    it('fetches user successfully', async () => {
      const store = useAuthStore();
      const mockUser = { id: '1', email: 'test@example.com' };
      queryMock.mockResolvedValueOnce({ data: { user: mockUser } });

      const result = await store.getUser('1');
      expect(queryMock).toHaveBeenCalled();
      expect(store.user).toEqual(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('throws error when user is not found', async () => {
      const store = useAuthStore();
      queryMock.mockResolvedValueOnce({ data: { user: null } });

      await expect(store.getUser('1')).rejects.toThrow(
        'Пользователь не найден'
      );
    });

    it('parses GraphQLErrors array format', async () => {
      const store = useAuthStore();
      const graphQLError: GraphQLErrorResponse = {
        graphQLErrors: [
          {
            message: 'Error',
            extensions: {
              response: {
                message: ['Validation failed 1', 'Validation failed 2'],
              },
            },
          },
        ],
      };
      queryMock.mockRejectedValueOnce(graphQLError);

      await expect(store.getUser('1')).rejects.toThrow(
        'Validation failed 1, Validation failed 2'
      );
    });

    it('parses GraphQLErrors string format', async () => {
      const store = useAuthStore();
      const graphQLError: GraphQLErrorResponse = {
        graphQLErrors: [
          {
            message: 'Error',
            extensions: { response: { message: 'Single validation error' } },
          },
        ],
      };
      queryMock.mockRejectedValueOnce(graphQLError);

      await expect(store.getUser('1')).rejects.toThrow(
        'Single validation error'
      );
    });

    it('falls back to default message if unknown error', async () => {
      const store = useAuthStore();
      // Pass a non-Error object to trigger the default fallback
      queryMock.mockRejectedValueOnce({ some: 'unknown random error' });
      await expect(store.getUser('1')).rejects.toThrow(
        'Ошибка при получении данных пользователя'
      );
    });
  });

  describe('login', () => {
    it('logs in successfully, sets cookies and user', async () => {
      const store = useAuthStore();
      const mockResponse = {
        login: {
          access_token: 'acc-token',
          refresh_token: 'ref-token',
          user: { id: '1', email: 'test@test.com' },
        },
      };
      queryMock.mockResolvedValueOnce({ data: mockResponse });

      const result = await store.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(queryMock).toHaveBeenCalled();
      expect(onLoginMock).toHaveBeenCalledWith('acc-token');
      expect(mockCookies['access_token'].value).toBe('acc-token');
      expect(mockCookies['refresh_token'].value).toBe('ref-token');
      expect(store.user).toEqual(mockResponse.login.user);
      expect(result).toEqual(mockResponse.login);
    });

    it('throws error if login data is invalid', async () => {
      const store = useAuthStore();
      queryMock.mockResolvedValueOnce({ data: { login: null } });

      await expect(store.login({ email: 'x', password: 'y' })).rejects.toThrow(
        'Ошибка авторизации'
      );
    });
  });

  describe('register', () => {
    it('registers successfully, sets cookies and user', async () => {
      const store = useAuthStore();
      const mockResponse = {
        signup: {
          access_token: 'acc-token2',
          refresh_token: 'ref-token2',
          user: { id: '2', email: 'new@test.com' },
        },
      };
      mutateMock.mockResolvedValueOnce({ data: mockResponse });

      const result = await store.register({
        email: 'new@test.com',
        password: 'password',
      });

      expect(mutateMock).toHaveBeenCalled();
      expect(onLoginMock).toHaveBeenCalledWith('acc-token2');
      expect(mockCookies['access_token'].value).toBe('acc-token2');
      expect(mockCookies['refresh_token'].value).toBe('ref-token2');
      expect(store.user).toEqual(mockResponse.signup.user);
      expect(result).toEqual(mockResponse.signup);
    });
  });

  describe('logout', () => {
    it('logs out successfully, clears cookies, clears user, navigates to login', async () => {
      const store = useAuthStore();

      store.setUser({ id: '1', email: 'test' } as AuthUser);

      // Must mutate .value to ensure the store sees the exact same reference change
      mockCookies['access_token'].value = 'token';
      mockCookies['refresh_token'].value = 'token';

      await store.logout();

      expect(onLogoutMock).toHaveBeenCalled();
      expect(mockCookies['access_token'].value).toBeNull();
      expect(mockCookies['refresh_token'].value).toBeNull();
      expect(store.user).toBeNull();
      expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
    });
  });

  describe('refresh', () => {
    it('throws error if no refresh token is present', async () => {
      const store = useAuthStore();
      mockCookies['refresh_token'].value = null;

      await expect(store.refresh()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('refreshes token successfully', async () => {
      const store = useAuthStore();
      mockCookies['refresh_token'].value = 'old-ref-token';

      const mockResponse = {
        updateToken: {
          access_token: 'new-acc-token',
          refresh_token: 'new-ref-token',
        },
      };
      mutateMock.mockResolvedValueOnce({ data: mockResponse });

      const result = await store.refresh();

      expect(mutateMock).toHaveBeenCalled();
      expect(onLoginMock).toHaveBeenCalledWith('new-acc-token');
      expect(mockCookies['access_token'].value).toBe('new-acc-token');
      expect(mockCookies['refresh_token'].value).toBe('new-ref-token');
      expect(result).toEqual(mockResponse.updateToken);
    });

    it('logs out if refresh fails', async () => {
      const store = useAuthStore();
      mockCookies['refresh_token'].value = 'old-ref-token';

      mutateMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(store.refresh()).rejects.toThrow('Network error');
      expect(onLogoutMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
    });
  });
});
