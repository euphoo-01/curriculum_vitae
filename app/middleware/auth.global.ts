export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  const authStore = useAuthStore();
  const { getToken } = useApollo();
  const token = await getToken();
  const refreshTokenCookie = useCookie('auth_refresh_token');

  const isAuthPage = to.path.startsWith('/auth');

  let validToken = !!token;

  if (!token && refreshTokenCookie.value) {
    try {
      await auth.refresh();
      validToken = true;
    } catch {
      validToken = false;
    }
  }

  if (validToken && !authStore.user && authStore.userId) {
    try {
      await auth.getUser(authStore.userId);
    } catch {
      if (refreshTokenCookie.value) {
        try {
          await auth.refresh();
          await auth.getUser(authStore.userId);
        } catch {
          await auth.logout();
          validToken = false;
        }
      } else {
        await auth.logout();
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
