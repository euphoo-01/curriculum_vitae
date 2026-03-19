import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, type AuthUser } from '../../app/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with null user', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
  });

  it('sets user correctly', () => {
    const store = useAuthStore();
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
    } as AuthUser;
    store.setUser(mockUser);
    expect(store.user).toEqual(mockUser);
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
  });
});
