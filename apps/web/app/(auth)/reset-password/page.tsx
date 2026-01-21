"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  if (!token) {
    return (
      <AuthLayout title="Reset password" subtitle="Missing reset token">
        <Alert variant="destructive">
          <AlertDescription>Invalid or missing reset token.</AlertDescription>
        </Alert>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
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
    <React.Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
