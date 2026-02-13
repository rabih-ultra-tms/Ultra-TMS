import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { AdminGuard } from "@/components/auth/admin-guard";

const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

function decodeRoles(token?: string): string[] {
  if (!token) {
    return [];
  }
  try {
    const rawToken = token.includes("%") ? decodeURIComponent(token) : token;
    const parts = rawToken.split(".");

    if (parts.length !== 3) {
      return [];
    }

    const payloadSegment = parts[1];
    if (!payloadSegment) {
      return [];
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as {
      role?: string;
      roleName?: string;
      roles?: string[];
      sub?: string;
      email?: string;
    };

    const collected = [payload.role, payload.roleName, ...(payload.roles ?? [])]
      .filter(Boolean)
      .map((role) => String(role));

    const normalize = (role: string) => role.replace(/-/g, "_").toUpperCase();
    return Array.from(new Set(collected.map(normalize)));
  } catch {
    return [];
  }
}

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default async function SuperAdminLayout({
  children,
}: SuperAdminLayoutProps) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_CONFIG.accessTokenCookie);

  if (!authCookie?.value) {
    redirect(AUTH_CONFIG.loginPath);
  }

  const roles = decodeRoles(authCookie.value);
  const hasSuperAdminRole = roles.includes(SUPER_ADMIN_ROLE);

  if (!hasSuperAdminRole) {
    const redirectUrl = new URL(AUTH_CONFIG.defaultRedirect, "http://localhost");
    redirectUrl.searchParams.set("unauthorized", "true");
    redirect(redirectUrl.pathname + redirectUrl.search);
  }

  return <AdminGuard>{children}</AdminGuard>;
}
