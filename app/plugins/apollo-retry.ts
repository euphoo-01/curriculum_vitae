import { defineNuxtPlugin } from '#app';
import { useApollo } from '#imports';
import { useAuth } from '~/composables/useAuth';
import type { ApolloError } from '@apollo/client/core';

interface GraphQLResponseError {
  extensions?: {
    code?: string;
    response?: {
      statusCode?: number;
    };
  };
  message?: string;
}

export default defineNuxtPlugin(() => {
  const { clients } = useApollo();
  const client = clients?.default;
  if (!client) return;

  const originalQuery = client.query.bind(client);
  const originalMutate = client.mutate.bind(client);

  const handleGraphQLError = async <T>(
    e: unknown,
    retryFn: () => Promise<T>,
    options:
      | Parameters<typeof originalQuery>[0]
      | Parameters<typeof originalMutate>[0]
  ): Promise<T> => {
    if ((options.context as Record<string, unknown> | undefined)?.isRefresh) {
      throw e;
    }

    const apolloError = e as ApolloError;
    const isUnauthorized =
      apolloError.graphQLErrors?.some(
        (err: GraphQLResponseError) =>
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.message?.toLowerCase().includes('unauthorized') ||
          err.extensions?.response?.statusCode === 401
      ) || apolloError.message?.toLowerCase().includes('unauthorized');

    if (isUnauthorized) {
      const auth = useAuth();
      try {
        await auth.refresh();
        return await retryFn();
      } catch (refreshErr) {
        await auth.logout();
        throw refreshErr;
      }
    }
    throw e;
  };

  client.query = (async (options: Parameters<typeof originalQuery>[0]) => {
    try {
      return await originalQuery(options);
    } catch (e) {
      return handleGraphQLError(e, () => originalQuery(options), options);
    }
  }) as typeof client.query;

  client.mutate = (async (options: Parameters<typeof originalMutate>[0]) => {
    try {
      return await originalMutate(options);
    } catch (e) {
      return handleGraphQLError(e, () => originalMutate(options), options);
    }
  }) as typeof client.mutate;
});
