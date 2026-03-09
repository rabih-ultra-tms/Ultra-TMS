'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PortalHeader } from '@/components/portal/portal-header';
import { getPortalAccessToken } from '@/lib/api/portal-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/portal/login';

  useEffect(() => {
    const token = getPortalAccessToken();
    if (!token && !isLoginPage) {
      router.replace('/portal/login');
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PortalAuthGate>{children}</PortalAuthGate>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
