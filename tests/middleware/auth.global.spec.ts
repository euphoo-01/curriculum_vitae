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
    mocks.cookie.value = 'refresh-123';
    mocks.auth.refresh.mockResolvedValueOnce(true);

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
  });

  it('redirects to login if refresh fails on protected route', async () => {
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

  it('fetches user if token is valid but user is missing from store', async () => {
    mocks.apollo.getToken.mockResolvedValue('valid');
    mocks.store.userId = 'user-1';
    mocks.auth.getUser.mockResolvedValueOnce(true);

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.getUser).toHaveBeenCalledWith('user-1');
    expect(mocks.navigateTo).not.toHaveBeenCalledWith('/auth/login');
  });

  it('logs out if getUser fails and no refresh token exists', async () => {
    mocks.apollo.getToken.mockResolvedValue('valid');
    mocks.store.userId = 'user-1';
    mocks.auth.getUser.mockRejectedValueOnce(new Error('Token Expired'));
    mocks.cookie.value = null;

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.logout).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });

  it('attempts refresh and getUser if getUser fails initially but refresh token exists', async () => {
    mocks.apollo.getToken.mockResolvedValue('valid');
    mocks.store.userId = 'user-1';
    mocks.cookie.value = 'refresh-123';

    mocks.auth.getUser
      .mockRejectedValueOnce(new Error('Token Expired'))
      .mockResolvedValueOnce(true);
    mocks.auth.refresh.mockResolvedValueOnce(true);

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
    expect(mocks.auth.getUser).toHaveBeenCalledTimes(2);
    expect(mocks.auth.logout).not.toHaveBeenCalled();
  });

  it('logs out if the fallback refresh -> getUser flow fails', async () => {
    mocks.apollo.getToken.mockResolvedValue('valid');
    mocks.store.userId = 'user-1';
    mocks.cookie.value = 'refresh-123';

    mocks.auth.getUser.mockRejectedValueOnce(new Error('Token Expired'));
    mocks.auth.refresh.mockRejectedValueOnce(new Error('Refresh Failed'));

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.logout).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });
});
