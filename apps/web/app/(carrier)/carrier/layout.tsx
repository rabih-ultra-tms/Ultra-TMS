'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCarrierAuthStore } from '@/lib/store/carrier-auth.store';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Home,
  Package,
  FileText,
  Users,
  CreditCard,
  Zap,
  User,
} from 'lucide-react';

interface CarrierLayoutProps {
  children: ReactNode;
}

export default function CarrierLayout({ children }: CarrierLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, clearAuth, user } = useCarrierAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ['/carrier/login', '/carrier/register'];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // Check if we're on a public route or authenticated
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/carrier/login');
    }
    setIsLoading(false);
  }, [isAuthenticated, pathname, isPublicRoute, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/carrier/login');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  // For public routes, render without navigation
  if (isPublicRoute) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo / Title */}
            <div className="text-lg font-semibold text-slate-900">
              Carrier Portal
            </div>

            {/* Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => router.push('/carrier/dashboard')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/carrier/loads')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Loads
                </button>
                <button
                  onClick={() => router.push('/carrier/documents')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </button>
                <button
                  onClick={() => router.push('/carrier/drivers')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Drivers
                </button>
                <button
                  onClick={() => router.push('/carrier/payments')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Payments
                </button>
                <button
                  onClick={() => router.push('/carrier/quick-pay')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Quick Pay
                </button>
                <button
                  onClick={() => router.push('/carrier/profile')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </div>
            )}

            {/* User Actions */}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-sm text-slate-600">{user.email}</span>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
