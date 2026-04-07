export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  const accessToken = useCookie('access_token').value;
  const refreshToken = useCookie('refresh_token').value;

  const isAuthPage = to.path.startsWith('/auth');

  let validToken = !!accessToken;

  if (!validToken && refreshToken) {
    try {
      await authStore.refresh();
      validToken = true;
    } catch (e) {
      console.error('Error while updating token:', e);
      validToken = false;
    }
  }

  if (validToken && !authStore.user) {
    if (authStore.userId) {
      try {
        await authStore.getUser(authStore.userId);
      } catch (e) {
        console.error('Error while fetching user:', e);

        if (refreshToken) {
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
    } else {
      await authStore.logout();
      validToken = false;
    }
  }

  if (!validToken && !isAuthPage) {
    return navigateTo('/auth/login');
  }

  if (validToken && (isAuthPage || to.path === '/')) {
    return navigateTo('/users');
  }
});
