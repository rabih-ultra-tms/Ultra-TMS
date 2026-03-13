import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuthStore } from '@/lib/store/portal-auth.store';
import { portalClient } from '@/lib/api/portal-client';

export function usePortalAuth() {
  const router = useRouter();
  const {
    token,
    user,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setToken,
  } = usePortalAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await portalClient.login(email, password);
        storeLogin(result.token, '', result.user);
        router.push('/portal/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [storeLogin, router]
  );

  const logout = useCallback(async () => {
    try {
      await portalClient.logout();
    } catch (error) {
      console.warn('Logout API failed (expected in dev):', error);
    } finally {
      storeLogout();
      router.push('/portal/login');
    }
  }, [storeLogout, router]);

  const refreshTokenFn = useCallback(async () => {
    try {
      const result = await portalClient.refreshToken();
      setToken(result.token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      storeLogout();
      router.push('/portal/login');
    }
  }, [storeLogout, router, setToken]);

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    refreshToken: refreshTokenFn,
  };
}
