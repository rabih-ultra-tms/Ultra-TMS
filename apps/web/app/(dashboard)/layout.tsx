import * as React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AUTH_CONFIG } from "@/lib/config/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_CONFIG.accessTokenCookie);

  if (!authCookie?.value) {
    redirect(AUTH_CONFIG.loginPath);
  }

  return <DashboardShell>{children}</DashboardShell>;
}
