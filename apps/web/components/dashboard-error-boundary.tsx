'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

export function DashboardErrorBoundary({
  children,
}: DashboardErrorBoundaryProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
