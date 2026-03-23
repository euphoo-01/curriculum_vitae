import {
  LoginDocument,
  SignupDocument,
  UpdateTokenDocument,
  GetUserDocument,
} from '../../graphql/generated/graphql';
import type { AuthInput } from '../../graphql/generated/graphql';

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

export const useAuth = () => {
  const { onLogin, onLogout, clients } = useApollo();
  const authStore = useAuthStore();
  const client = clients?.default;

  if (!client) {
    console.warn('Apollo default client not found!');
  }

  const refreshTokenCookie = useCookie('auth_refresh_token', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

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

  const getUser = async (userId: string) => {
    try {
      const { data } = await client!.query({
        query: GetUserDocument,
        variables: { userId },
        fetchPolicy: 'no-cache',
      });

      if (data?.user) {
        authStore.setUser(data.user);
        return data.user;
      }
      throw new Error('Пользователь не найден');
    } catch (e) {
      throw parseError(e, 'Ошибка при получении данных пользователя');
    }
  };

  const login = async (auth: AuthInput) => {
    try {
      const { data } = await client!.query({
        query: LoginDocument,
        variables: { auth },
        fetchPolicy: 'no-cache',
      });

      if (data?.login) {
        await onLogin(data.login.access_token);
        refreshTokenCookie.value = data.login.refresh_token;
        authStore.setUser(data.login.user);
        return data.login;
      }
      throw new Error('Ошибка авторизации');
    } catch (e) {
      throw parseError(e, 'Ошибка авторизации');
    }
  };

  const register = async (auth: AuthInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: SignupDocument,
        variables: { auth },
      });

      if (data?.signup) {
        await onLogin(data.signup.access_token);
        refreshTokenCookie.value = data.signup.refresh_token;
        authStore.setUser(data.signup.user);
        return data.signup;
      }
      throw new Error('Ошибка регистрации');
    } catch (e) {
      throw parseError(e, 'Ошибка регистрации');
    }
  };

  const logout = async () => {
    await onLogout();
    refreshTokenCookie.value = null;
    authStore.clearUser();
  };

  const refresh = async () => {
    if (!refreshTokenCookie.value) {
      throw new Error('No refresh token available');
    }

    try {
      const { data } = await client!.mutate({
        mutation: UpdateTokenDocument,
        context: {
          headers: {
            Authorization: `Bearer ${refreshTokenCookie.value}`,
          },
        },
      });

      if (data?.updateToken) {
        await onLogin(data.updateToken.access_token);
        refreshTokenCookie.value = data.updateToken.refresh_token;
        return data.updateToken;
      }
      throw new Error('Не удалось обновить токен');
    } catch (e) {
      await logout();
      throw e;
    }
  };

  return {
    login,
    register,
    logout,
    refresh,
    getUser,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => !!authStore.user),
  };
};
