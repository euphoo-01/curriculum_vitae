export default defineNuxtRouteMiddleware(async (to) => {
  const { getToken } = useApollo();
  const token = await getToken();
  const refreshTokenCookie = useCookie('auth_refresh_token');
  const auth = useAuth();

  const isAuthPage = to.path.startsWith('/auth');

  if (!token && refreshTokenCookie.value) {
    try {
      await auth.refresh();
      if (isAuthPage || to.path === '/') {
        return navigateTo('/users');
      }
      return;
    } catch {
      if (!isAuthPage) {
        return navigateTo('/auth/login');
      }
      return;
    }
  }

  const validToken = await getToken();
  if (!validToken && !isAuthPage) {
    return navigateTo('/auth/login');
  }

  if (validToken && (isAuthPage || to.path === '/')) {
    return navigateTo('/users');
  }
});
