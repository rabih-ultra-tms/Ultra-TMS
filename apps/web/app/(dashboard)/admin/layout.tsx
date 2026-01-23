import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { AdminGuard } from "@/components/auth/admin-guard";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function decodeRoles(token?: string): string[] {
  if (!token) return [];
  try {
    const rawToken = token.includes("%") ? decodeURIComponent(token) : token;
    const payloadSegment = rawToken.split(".")[1];
    if (!payloadSegment) return [];
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as {
      role?: string;
      roleName?: string;
      roles?: string[];
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_CONFIG.accessTokenCookie);

  if (!authCookie?.value) {
    redirect(AUTH_CONFIG.loginPath);
  }

  const roles = decodeRoles(authCookie.value);
  const hasAdminRole = roles.some((role) => ADMIN_ROLES.has(role));

  if (!hasAdminRole) {
    const redirectUrl = new URL(AUTH_CONFIG.defaultRedirect, "http://localhost");
    redirectUrl.searchParams.set("unauthorized", "true");
    redirect(redirectUrl.pathname + redirectUrl.search);
  }

  return <AdminGuard>{children}</AdminGuard>;
}
