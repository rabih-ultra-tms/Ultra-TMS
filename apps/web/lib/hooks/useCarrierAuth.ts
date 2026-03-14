import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrierAuthStore } from '@/lib/store/carrier-auth.store';
import { carrierClient } from '@/lib/api/carrier-client';

export interface CarrierUser {
  id: string;
  email: string;
  name: string;
  carrierId: string;
}

export interface CarrierAuthState {
  token: string | null;
  user: CarrierUser | null;
  carrierId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCarrierAuth(): CarrierAuthState {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    token,
    user,
    carrierId,
    isAuthenticated,
    setAuth,
    clearAuth,
    setToken,
  } = useCarrierAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await carrierClient.login(email, password);
        setAuth(result.token, result.user, result.user.carrierId);
        router.push('/carrier/dashboard');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        console.error('Login failed:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await carrierClient.logout();
    } catch (err) {
      console.warn('Logout API failed (expected in dev):', err);
    } finally {
      clearAuth();
      router.push('/carrier/login');
      setIsLoading(false);
    }
  }, [clearAuth, router]);

  const refreshTokenFn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await carrierClient.refreshToken();
      setToken(result.token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Token refresh failed';
      setError(errorMessage);
      console.error('Token refresh failed:', err);
      clearAuth();
      router.push('/carrier/login');
    } finally {
      setIsLoading(false);
    }
  }, [setToken, clearAuth, router]);

  return {
    token,
    user: user as CarrierUser | null,
    carrierId,
    isAuthenticated,
    login,
    logout,
    refreshToken: refreshTokenFn,
    isLoading,
    error,
  };
}
