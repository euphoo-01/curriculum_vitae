import { defineNuxtPlugin } from '#app';
import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client/core';

export default defineNuxtPlugin((nuxtApp) => {
  const client = nuxtApp.$apollo.defaultClient;

  const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.message.includes('401')
        ) {
          if (operation.operationName === 'UpdateToken') {
            return;
          }
          const authStore = useAuthStore();

          if (!authStore.refreshTokenCookie) return;

          return fromPromise(
            authStore.refresh().catch((refreshError) => {
              authStore.logout();
              navigateTo('/auth/login');
              throw refreshError;
            })
          )
            .filter((value) => Boolean(value))
            .flatMap(() => {
              return forward(operation);
            });
        }
      }
    }
  });

  client.setLink(errorLink.concat(client.link));
});
