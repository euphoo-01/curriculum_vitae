import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore, type AuthUser } from '../../app/stores/auth';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useNuxtApp } from '#imports';

interface CookieMock {
  value: string | null;
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

    mutateMock.mockReset();
    queryMock.mockReset();
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
    mutateMock.mockReset();
    queryMock.mockReset();
  });

  it('initializes with null user and checks isAuthenticated', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('sets user correctly', () => {
    const store = useAuthStore();
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
    } as AuthUser;
    store.setUser(mockUser);
    expect(store.user).toEqual(mockUser);
    expect(store.userId).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('clears user correctly', () => {
    const store = useAuthStore();
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
    } as AuthUser;
    store.setUser(mockUser);
    store.clearUser();
    expect(store.user).toBeNull();
    expect(store.userId).toBeNull();
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

    it('returns undefined when user is not found in query', async () => {
      const store = useAuthStore();
      queryMock.mockResolvedValueOnce({ data: { user: null } });

      const result = await store.getUser('1');
      expect(result).toBeUndefined();
    });

    it('throws the original error when query fails', async () => {
      const store = useAuthStore();
      const error = new Error('Network error');
      queryMock.mockRejectedValueOnce(error);

      await expect(store.getUser('1')).rejects.toThrow('Network error');
    });

    it('throws the original object if unknown error occurs', async () => {
      const store = useAuthStore();
      const unknownError = { some: 'unknown random error' };
      queryMock.mockRejectedValueOnce(unknownError);

      await expect(store.getUser('1')).rejects.toEqual(unknownError);
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

    it('returns undefined if login data is invalid', async () => {
      const store = useAuthStore();
      queryMock.mockResolvedValueOnce({ data: { login: null } });

      const result = await store.login({ email: 'x', password: 'y' });
      expect(result).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('logs out successfully, clears cookies, clears user', async () => {
      const store = useAuthStore();

      store.setUser({ id: '1', email: 'test' } as AuthUser);

      mockCookies['access_token'].value = 'token';
      mockCookies['refresh_token'].value = 'token';

      await store.logout();

      expect(onLogoutMock).toHaveBeenCalled();
      expect(mockCookies['access_token'].value).toBeNull();
      expect(mockCookies['refresh_token'].value).toBeNull();
      expect(store.user).toBeNull();
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

    it('clears user and throws error if refresh fails', async () => {
      const store = useAuthStore();
      mockCookies['refresh_token'].value = 'old-ref-token';

      mutateMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(store.refresh()).rejects.toThrow('Network error');

      expect(store.user).toBeNull();
      expect(mockCookies['access_token'].value).toBeNull();
      expect(mockCookies['refresh_token'].value).toBeNull();
    });
  });
});
