import {
  LoginDocument,
  SignupDocument,
  UpdateTokenDocument,
  GetUserDocument,
} from '../../graphql/generated/graphql';
import type {
  AuthInput,
  UpdateTokenResult,
  LoginQuery,
} from '../../graphql/generated/graphql';

export type AuthUser = LoginQuery['login']['user'];

interface GraphQLErrorExtension {
  response?: {
    message?: string | string[];
  };
}

interface GraphQLValidationError {
  message: string;
  extensions?: GraphQLErrorExtension;
}

interface ApolloErrorWithGraphQLErrors extends Error {
  graphQLErrors?: GraphQLValidationError[];
}

let refreshPromise: Promise<UpdateTokenResult> | null = null;

export const useAuthStore = defineStore('auth', () => {
  const { onLogin, onLogout } = useApollo();
  const { $apollo } = useNuxtApp();
  const client = $apollo.defaultClient;

  if (!client) {
    console.warn('Apollo default client not found!');
  }

  const userIdCookie = useCookie<string | null>('auth_user_id', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

  const refreshTokenCookie = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

  const accessTokenCookie = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

  const user = ref<AuthUser | null>(null);

  const userId = userIdCookie;

  const isAuthenticated = computed(() => !!user.value);

  const setUser = (newUser: AuthUser) => {
    user.value = newUser;
    userIdCookie.value = newUser.id;
  };

  const clearUser = () => {
    user.value = null;
    userIdCookie.value = null;
  };

  const parseError = (e: unknown, defaultMessage: string): Error => {
    const errorWithGraphQLErrors = e as ApolloErrorWithGraphQLErrors;
    if (errorWithGraphQLErrors.graphQLErrors?.length) {
      const error = errorWithGraphQLErrors.graphQLErrors[0];
      if (error) {
        const validationMessages = error.extensions?.response?.message;
        if (Array.isArray(validationMessages)) {
          return new Error(validationMessages.join(', '));
        } else if (typeof validationMessages === 'string') {
          return new Error(validationMessages);
        }
        return new Error(error.message);
      }
    }
    return e instanceof Error ? e : new Error(defaultMessage);
  };

  const getUser = async (uid: string) => {
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
      throw new Error('Пользователь не найден');
    } catch (e) {
      throw parseError(e, 'Ошибка при получении данных пользователя');
    }
  };

  const login = async (auth: AuthInput) => {
    try {
      const { data } = await client.query({
        query: LoginDocument,
        variables: { auth },
        fetchPolicy: 'no-cache',
      });

      if (data?.login) {
        await onLogin(data.login.access_token);
        accessTokenCookie.value = data.login.access_token;
        refreshTokenCookie.value = data.login.refresh_token;
        setUser(data.login.user);
        return data.login;
      }
      throw new Error('Ошибка авторизации');
    } catch (e) {
      throw parseError(e, 'Ошибка авторизации');
    }
  };

  const register = async (auth: AuthInput) => {
    try {
      const { data } = await client.mutate({
        mutation: SignupDocument,
        variables: { auth },
      });

      if (data?.signup) {
        await onLogin(data.signup.access_token);
        accessTokenCookie.value = data.signup.access_token;
        refreshTokenCookie.value = data.signup.refresh_token;
        setUser(data.signup.user);
        return data.signup;
      }
      throw new Error('Ошибка регистрации');
    } catch (e) {
      throw parseError(e, 'Ошибка регистрации');
    }
  };

  const logout = async () => {
    await onLogout();
    accessTokenCookie.value = null;
    refreshTokenCookie.value = null;
    clearUser();
    navigateTo('/auth/login');
  };

  const refresh = async () => {
    if (!refreshTokenCookie.value) {
      throw new Error('No refresh token available');
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const { data } = await client.mutate({
          mutation: UpdateTokenDocument,
        });

        if (data?.updateToken) {
          await onLogin(data.updateToken.access_token);
          accessTokenCookie.value = data.updateToken.access_token;
          refreshTokenCookie.value = data.updateToken.refresh_token;
          return data.updateToken;
        }
        throw new Error('Refresh tokens failed');
      } catch (e) {
        await logout();
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
    register,
    logout,
    refresh,
  };
});
