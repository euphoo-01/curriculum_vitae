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
    refreshTokenCookie: null as string | null,
    accessTokenCookie: null as string | null,
    isTokenExpired: false,
    isAuthenticated: false,
  },
}));

mockNuxtImport('useAuthStore', () => () => ({ ...mocks.store, ...mocks.auth }));
mockNuxtImport('navigateTo', () => mocks.navigateTo);

describe('Auth Global Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.store.user = null;
    mocks.store.userId = null;
    mocks.store.refreshTokenCookie = null;
    mocks.store.accessTokenCookie = null;
    mocks.store.isTokenExpired = false;
    mocks.store.isAuthenticated = false;
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
    mocks.store.refreshTokenCookie = 'refresh-123';
    mocks.store.accessTokenCookie = null;
    mocks.store.isAuthenticated = true;
    mocks.auth.refresh.mockResolvedValueOnce(true);

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.refresh).toHaveBeenCalled();
  });

  it('redirects to login if refresh fails on protected route', async () => {
    mocks.store.refreshTokenCookie = 'refresh-123';
    mocks.store.accessTokenCookie = null;
    mocks.store.isAuthenticated = false;
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
    mocks.store.accessTokenCookie = 'valid';
    mocks.store.isTokenExpired = false;
    mocks.store.user = null;
    mocks.store.userId = 'user-1';
    mocks.store.isAuthenticated = true;
    mocks.auth.getUser.mockResolvedValueOnce(true);

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.getUser).toHaveBeenCalledWith('user-1');
    expect(mocks.navigateTo).not.toHaveBeenCalledWith('/auth/login');
  });

  it('logs out if getUser fails', async () => {
    mocks.store.accessTokenCookie = 'valid';
    mocks.store.isTokenExpired = false;
    mocks.store.user = null;
    mocks.store.userId = 'user-1';
    mocks.store.isAuthenticated = false;
    mocks.auth.getUser.mockRejectedValueOnce(new Error('Token Expired'));

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.logout).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });

  it('throws error and logs out if token is valid but no userId in token', async () => {
    mocks.store.accessTokenCookie = 'valid';
    mocks.store.isTokenExpired = false;
    mocks.store.user = null;
    mocks.store.userId = null;
    mocks.store.isAuthenticated = false;

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/users' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.auth.logout).toHaveBeenCalled();
    expect(mocks.navigateTo).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to users if accessing root while authenticated', async () => {
    mocks.store.isAuthenticated = true;

    const middleware = authMiddleware as RouteMiddleware;
    await middleware(
      { path: '/' } as RouteLocationNormalized,
      { path: '/' } as RouteLocationNormalized
    );

    expect(mocks.navigateTo).toHaveBeenCalledWith('/users');
  });
});
