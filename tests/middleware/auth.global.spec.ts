import { describe, it, expect, vi, beforeEach } from 'vitest';
import authMiddleware from '../../app/middleware/auth.global';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { RouteMiddleware } from 'nuxt/app';
import type { RouteLocationNormalized } from 'vue-router';

const mocks = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  auth: {
    refresh: vi.fn(),
    getUser: vi.fn(),
    logout: vi.fn(),
  },
  store: {
    user: null as Record<string, unknown> | null,
    userId: null as string | null,
  },
  apollo: {
    getToken: vi.fn(),
  },
  cookie: { value: null as string | null },
}));

mockNuxtImport('useAuthStore', () => () => ({ ...mocks.store, ...mocks.auth }));
mockNuxtImport('useApollo', () => () => mocks.apollo);
mockNuxtImport('useCookie', () => () => mocks.cookie);
mockNuxtImport('navigateTo', () => mocks.navigateTo);

describe('Auth Global Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.store.user = null;
    mocks.store.userId = null;
    mocks.cookie.value = null;
    mocks.apollo.getToken.mockResolvedValue(null);
  });

  it('redirects to login if no token and no refresh token on protected route', async () => {
    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });

  it('allows access to auth pages if no token', async () => {
    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/auth/login' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );
    expect(mocks.navigateTo).not.toHaveBeenCalled();
  });

  it('attempts refresh if no token but refresh token exists', async () => {
    mocks.apollo.getToken.mockResolvedValueOnce(null);
    mocks.cookie.value = 'refresh-123';
    mocks.auth.refresh.mockResolvedValueOnce(true);
    mocks.store.userId = '1';
    mocks.auth.getUser.mockResolvedValueOnce({ id: '1' });

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
    expect(mocks.auth.getUser).toHaveBeenCalledWith('1');
    expect(mocks.navigateTo).not.toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to login if refresh fails on protected route', async () => {
    mocks.apollo.getToken.mockResolvedValueOnce(null);
    mocks.cookie.value = 'refresh-123';
    mocks.auth.refresh.mockRejectedValueOnce(new Error('fail'));

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to /employees if refresh succeeds on auth page', async () => {
    mocks.apollo.getToken.mockResolvedValueOnce(null);
    mocks.cookie.value = 'refresh-123';
    mocks.auth.refresh.mockResolvedValueOnce(true);
    mocks.store.userId = '1';
    mocks.auth.getUser.mockResolvedValueOnce({ id: '1' });

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/auth/login' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/users');
  });

  it('redirects to /employees if token is valid and visiting auth page', async () => {
    mocks.apollo.getToken.mockResolvedValue('valid-token');
    mocks.store.user = { id: '1' };

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/auth/login' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.navigateTo).toHaveBeenCalledWith('/users');
  });

  it('does not refresh if token is null but user is already in store', async () => {
    mocks.apollo.getToken.mockResolvedValue(null);
    mocks.store.user = { id: '1' };
    mocks.cookie.value = 'refresh-123';

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/other' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).not.toHaveBeenCalled();
    expect(mocks.navigateTo).not.toHaveBeenCalled();
  });
});
