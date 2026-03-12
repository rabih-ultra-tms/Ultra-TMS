'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

function ResetPasswordSkeleton() {
  return (
    <AuthLayout title="Reset password" subtitle="Set a new password">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </AuthLayout>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  if (!token) {
    return (
      <AuthLayout
        title="Reset password"
        subtitle="Your reset link is invalid or has expired"
      >
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              This password reset link is missing a valid token. This can happen
              if the link has expired, was already used, or was copied
              incorrectly.
            </AlertDescription>
          </Alert>
          <p className="text-center text-sm text-muted-foreground">
            Need a new reset link? Request one below.
          </p>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new reset link</Link>
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Set a new password">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
