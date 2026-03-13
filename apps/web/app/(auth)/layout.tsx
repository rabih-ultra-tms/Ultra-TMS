import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">{children}</div>
    </ErrorBoundary>
  );
}
