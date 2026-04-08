export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.includes('.')) return;

  const authStore = useAuthStore();
  const isAuthPage = to.path.startsWith('/auth');

  if (
    authStore.refreshTokenCookie &&
    (!authStore.accessTokenCookie || authStore.isTokenExpired)
  ) {
    try {
      await authStore.refresh();
    } catch {
      console.error('Middleware: Refresh failed. User needs to login again.');
    }
  }

  if (
    authStore.accessTokenCookie &&
    !authStore.isTokenExpired &&
    !authStore.user
  ) {
    try {
      if (authStore.userId) {
        await authStore.getUser(authStore.userId.toString());
      } else {
        throw new Error(
          'Invalid JWT: No user ID found inside the token payload.'
        );
      }
    } catch {
      console.error('Middleware: GetUser failed, logging out');
      await authStore.logout();
    }
  }

  const isAuth = authStore.isAuthenticated;

  if (!isAuth && !isAuthPage) {
    return navigateTo('/auth/login');
  }

  if (isAuth && (isAuthPage || to.path === '/')) {
    if (to.path !== '/users') {
      return navigateTo('/users');
    }
  }
});
