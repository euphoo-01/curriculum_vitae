import { defineStore } from 'pinia';
import { useApollo } from '#imports';
import { jwtDecode } from 'jwt-decode';
import {
  LoginDocument,
  UpdateTokenDocument,
  GetUserDocument,
  SignupDocument,
} from '../../graphql/generated/graphql';
import type {
  AuthInput,
  UpdateTokenResult,
  LoginQuery,
} from '../../graphql/generated/graphql';

export type AuthUser = LoginQuery['login']['user'];

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const useAuthStore = defineStore('auth', () => {
  let refreshPromise: Promise<UpdateTokenResult> | null = null;

  const { onLogin, onLogout } = useApollo();
  const { $apollo } = useNuxtApp();
  const client = $apollo.defaultClient;

  const refreshTokenCookie = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  const accessTokenCookie = useCookie<string | null>('access_token', {
    path: '/',
  });

  const user = ref<AuthUser | null>(null);

  const decodedToken = computed<JwtPayload | null>(() => {
    if (!accessTokenCookie.value) return null;
    try {
      return jwtDecode<JwtPayload>(accessTokenCookie.value);
    } catch {
      return null;
    }
  });

  const userId = computed(() => decodedToken.value?.sub || null);

  const isTokenExpired = computed(() => {
    if (!decodedToken.value?.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.value.exp < currentTime + 10;
  });

  const isAuthenticated = computed(
    () => !!accessTokenCookie.value && !isTokenExpired.value
  );

  const setUser = (newUser: AuthUser) => {
    user.value = newUser;
  };

  const clearUser = () => {
    user.value = null;
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
      console.error('Store: GetUser error', e);
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

  const register = async (auth: AuthInput) => {
    const { data } = await client.mutate({
      mutation: SignupDocument,
      variables: { auth },
    });
    if (data?.signup) {
      accessTokenCookie.value = data.signup.access_token;
      refreshTokenCookie.value = data.signup.refresh_token;
      await onLogin(data.signup.access_token);
      setUser(data.signup.user);
      return data.signup;
    }
  };

  const logout = async () => {
    try {
      await onLogout();
    } catch (e) {
      console.error('Error on Apollo logout', e);
    } finally {
      clearUser();
    }
  };

  const refresh = async () => {
    if (!refreshTokenCookie.value)
      throw new Error('No refresh token available');
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        await onLogin(refreshTokenCookie.value || '', 'default', true);

        const { data } = await client.mutate({
          mutation: UpdateTokenDocument,
        });

        if (data?.updateToken) {
          accessTokenCookie.value = data.updateToken.access_token;
          refreshTokenCookie.value = data.updateToken.refresh_token;

          await onLogin(data.updateToken.access_token, 'default', true);

          return data.updateToken;
        }
        throw new Error('Refresh mutation returned no data');
      } catch (e) {
        console.error('Store: Refresh error', e);
        clearUser();
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
    isTokenExpired,
    accessTokenCookie,
    refreshTokenCookie,
    setUser,
    clearUser,
    getUser,
    login,
    logout,
    refresh,
    register,
  };
});
