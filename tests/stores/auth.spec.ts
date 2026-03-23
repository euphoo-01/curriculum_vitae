import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, type AuthUser } from '../../app/stores/auth';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

mockNuxtImport('useCookie', () => {
  return () => {
    return { value: null };
  };
});

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with null user', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
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
  });
});
