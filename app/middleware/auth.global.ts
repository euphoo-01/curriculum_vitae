export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.includes('.')) return;

  const authStore = useAuthStore();

  const getAccessToken = () => useCookie('access_token').value;
  const getRefreshToken = () => useCookie('refresh_token').value;

  const isAuthPage = to.path.startsWith('/auth');

  if (!getAccessToken() && getRefreshToken()) {
    try {
      await authStore.refresh();
    } catch {
      console.error('Middleware: Refresh failed');
    }
  }

  if (getAccessToken() && !authStore.user) {
    try {
      if (authStore.userId) {
        await authStore.getUser(authStore.userId);
      } else {
        throw new Error('No user ID in cookies');
      }
    } catch {
      console.error('Middleware: GetUser failed, logging out');
      await authStore.logout();
    }
  }

  const isAuthenticated = !!getAccessToken();

  if (!isAuthenticated && !isAuthPage) {
    return navigateTo('/auth/login');
  }

  if (isAuthenticated && (isAuthPage || to.path === '/')) {
    if (to.path !== '/users') {
      return navigateTo('/users');
    }
  }
});
