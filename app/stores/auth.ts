import type { LoginQuery } from '../../graphql/generated/graphql';

export type AuthUser = LoginQuery['login']['user'];

export const useAuthStore = defineStore('auth', () => {
  const userIdCookie = useCookie<string | null>('auth_user_id', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  });

  const user = ref<AuthUser | null>(null);

  const setUser = (newUser: AuthUser) => {
    user.value = newUser;
    userIdCookie.value = newUser.id;
  };

  const clearUser = () => {
    user.value = null;
    userIdCookie.value = null;
  };

  return { user, setUser, clearUser, userId: userIdCookie };
});
