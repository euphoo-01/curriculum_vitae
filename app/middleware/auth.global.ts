export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const { getToken } = useApollo();
  const refreshTokenCookie = useCookie('auth_refresh_token');

  const isAuthPage = to.path.startsWith('/auth');

  const token = await getToken();
  let validToken = !!token || !!authStore.user;

  if (!validToken && refreshTokenCookie.value) {
    try {
      await authStore.refresh();
      validToken = true;
    } catch {
      validToken = false;
    }
  }

  if (validToken && !authStore.user && authStore.userId) {
    try {
      await authStore.getUser(authStore.userId);
    } catch {
      if (refreshTokenCookie.value) {
        try {
          await authStore.refresh();
          await authStore.getUser(authStore.userId);
        } catch {
          await authStore.logout();
          validToken = false;
        }
      } else {
        await authStore.logout();
        validToken = false;
      }
    }
  }

  if (!validToken && !isAuthPage) {
    return navigateTo('/auth/login');
  }

  if (validToken && (isAuthPage || to.path === '/')) {
    return navigateTo('/users');
  }
});
