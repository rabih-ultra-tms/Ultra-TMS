'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  portalApi,
  setPortalTokens,
  clearPortalTokens,
  getPortalAccessToken,
  PortalApiError,
} from '@/lib/api/portal-client';
import { toast } from 'sonner';

interface PortalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  tenantId: string;
  status: string;
}

interface PortalLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: PortalUser;
}

export const portalAuthKeys = {
  all: ['portal-auth'] as const,
  user: () => [...portalAuthKeys.all, 'user'] as const,
};

export function usePortalUser() {
  return useQuery({
    queryKey: portalAuthKeys.user(),
    queryFn: async () => {
      const token = getPortalAccessToken();
      if (!token) return null;
      const response = await portalApi.get<{ data: PortalUser }>('/portal/auth/me');
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePortalLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await portalApi.post<PortalLoginResponse>(
        '/portal/auth/login',
        data,
        { skipAuth: true },
      );
      return response;
    },
    onSuccess: (response) => {
      setPortalTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(portalAuthKeys.user(), response.user);
      router.push('/portal/dashboard');
      toast.success('Welcome back!');
    },
    onError: (error: PortalApiError) => {
      toast.error(error.message || 'Invalid credentials');
    },
  });
}

export function usePortalLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => portalApi.post('/portal/auth/logout'),
    onSettled: () => {
      clearPortalTokens();
      queryClient.clear();
      router.push('/portal/login');
    },
  });
}
