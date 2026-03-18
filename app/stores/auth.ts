import type { LoginQuery } from '../../graphql/generated/graphql';

export type AuthUser = LoginQuery['login']['user'];

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);

  const setUser = (newUser: AuthUser) => {
    user.value = newUser;
  };

  const clearUser = () => {
    user.value = null;
  };

  return { user, setUser, clearUser };
});
