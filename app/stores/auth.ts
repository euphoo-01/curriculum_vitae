import {
  LoginDocument,
  UpdateTokenDocument,
  GetUserDocument,
} from '../../graphql/generated/graphql';
import type {
  AuthInput,
  UpdateTokenResult,
  LoginQuery,
} from '../../graphql/generated/graphql';

export type AuthUser = LoginQuery['login']['user'];

let refreshPromise: Promise<UpdateTokenResult> | null = null;

export const useAuthStore = defineStore('auth', () => {
  const { onLogin, onLogout } = useApollo();
  const { $apollo } = useNuxtApp();
  const client = $apollo.defaultClient;

  const userIdCookie = useCookie<string | null>('auth_user_id', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  const refreshTokenCookie = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  const accessTokenCookie = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  const user = ref<AuthUser | null>(null);

  const userId = computed(() => userIdCookie.value);
  const isAuthenticated = computed(() => !!accessTokenCookie.value);

  const setUser = (newUser: AuthUser) => {
    user.value = newUser;
    userIdCookie.value = newUser.id;
  };

  const clearUser = () => {
    user.value = null;
    userIdCookie.value = null;
    accessTokenCookie.value = null;
    refreshTokenCookie.value = null;
  };

  const getUser = async (uid: string) => {
    if (!uid) return;
    try {
      const { data } = await client.query({
        query: GetUserDocument,
        variables: { userId: uid },
        fetchPolicy: 'no-cache',
      });
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error('Store: GetUser error', e.message);
      } else {
        console.error('Store: GetUser error. Unknown error');
      }

      throw e;
    }
  };

  const login = async (auth: AuthInput) => {
    const { data } = await client.query({
      query: LoginDocument,
      variables: { auth },
    });
    if (data?.login) {
      accessTokenCookie.value = data.login.access_token;
      refreshTokenCookie.value = data.login.refresh_token;
      await onLogin(data.login.access_token);
      setUser(data.login.user);
      return data.login;
    }
  };

  const logout = async () => {
    try {
      await onLogout();
    } catch (e) {
      if (e instanceof Error) {
        console.error('Error on Apollo logout', e.message);
      } else {
        console.error('Error on Apollo logout');
      }
    } finally {
      clearUser();
    }
  };

  const refresh = async () => {
    if (!refreshTokenCookie.value) throw new Error('No refresh token');
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const { data } = await client.mutate({ mutation: UpdateTokenDocument });
        if (data?.updateToken) {
          accessTokenCookie.value = data.updateToken.access_token;
          refreshTokenCookie.value = data.updateToken.refresh_token;
          await onLogin(data.updateToken.access_token);
          return data.updateToken;
        }
        throw new Error('Refresh failed');
      } catch (e) {
        if (e instanceof Error) {
          console.error('Store: Refresh error', e.message);
        } else {
          console.error('Store: Refresh error: Unknown Error');
        }
        throw e;
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  };

  return {
    user,
    userId,
    isAuthenticated,
    setUser,
    clearUser,
    getUser,
    login,
    logout,
    refresh,
  };
});
