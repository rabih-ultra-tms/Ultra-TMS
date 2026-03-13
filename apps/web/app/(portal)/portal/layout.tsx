'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuthStore } from '@/lib/store/portal-auth.store';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, logout } = usePortalAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated and not on public routes
    const pathname = window.location.pathname;
    const publicRoutes = ['/portal/login', '/portal/track'];

    if (!isAuthenticated && !publicRoutes.some((r) => pathname.startsWith(r))) {
      router.push('/portal/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/portal/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-lg font-semibold text-slate-900">Portal</div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Logged in</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
