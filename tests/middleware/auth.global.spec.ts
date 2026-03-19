import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import authMiddleware from '../../app/middleware/auth.global';

const apolloMock = { getToken: vi.fn().mockResolvedValue(null) };
mockNuxtImport('useApollo', () => () => apolloMock);

const authMock = { refresh: vi.fn() };
mockNuxtImport('useAuth', () => () => authMock);

let cookieMockValue: string | null = null;
mockNuxtImport('useCookie', () => {
  return () => ({
    get value() {
      return cookieMockValue;
    },
    set value(val) {
      cookieMockValue = val;
    },
  });
});

const navigateToMock = vi.fn();
mockNuxtImport('navigateTo', () => {
  return (path: string) => navigateToMock(path);
});

type Middleware = (to: { path: string }) => Promise<unknown>;

describe('Auth Global Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieMockValue = null;
  });

  it('redirects to login if no token and no refresh token on protected route', async () => {
    apolloMock.getToken.mockResolvedValueOnce(null);

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/protected' });

    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('allows access to auth pages if no token', async () => {
    apolloMock.getToken.mockResolvedValueOnce(null);

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/auth/login' });

    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('attempts refresh if no token but refresh token exists', async () => {
    apolloMock.getToken.mockResolvedValueOnce(null);
    cookieMockValue = 'refresh-123';
    authMock.refresh.mockResolvedValueOnce(true);

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/protected' });

    expect(authMock.refresh).toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects to login if refresh fails on protected route', async () => {
    apolloMock.getToken.mockResolvedValueOnce(null);
    cookieMockValue = 'refresh-123';
    authMock.refresh.mockRejectedValueOnce(new Error('Refresh failed'));

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/protected' });

    expect(authMock.refresh).toHaveBeenCalled();
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to /users if refresh succeeds on auth page', async () => {
    apolloMock.getToken.mockResolvedValueOnce(null);
    cookieMockValue = 'refresh-123';
    authMock.refresh.mockResolvedValueOnce(true);

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/auth/login' });

    expect(authMock.refresh).toHaveBeenCalled();
    expect(navigateToMock).toHaveBeenCalledWith('/users');
  });

  it('redirects to /users if token is valid and visiting auth page', async () => {
    apolloMock.getToken.mockResolvedValue('valid-token');

    const middleware = authMiddleware as Middleware;
    await middleware({ path: '/auth/login' });

    expect(navigateToMock).toHaveBeenCalledWith('/users');
  });
});
