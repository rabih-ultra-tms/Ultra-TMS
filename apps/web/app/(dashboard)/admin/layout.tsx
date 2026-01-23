import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { AdminGuard } from "@/components/auth/admin-guard";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function decodeRoles(token?: string): string[] {
  if (!token) {
    console.log('[decodeRoles] No token provided');
    return [];
  }
  try {
    const rawToken = token.includes("%") ? decodeURIComponent(token) : token;
    const parts = rawToken.split(".");
    console.log('[decodeRoles] Token parts:', parts.length);
    
    if (parts.length !== 3) {
      console.error('[decodeRoles] Invalid token format - expected 3 parts, got', parts.length);
      return [];
    }

    const payloadSegment = parts[1];
    if (!payloadSegment) {
      console.error('[decodeRoles] Missing payload segment');
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
    
    console.log('[decodeRoles] Full JWT Payload:', payload);

    const collected = [payload.role, payload.roleName, ...(payload.roles ?? [])]
      .filter(Boolean)
      .map((role) => String(role));
    
    const normalize = (role: string) => role.replace(/-/g, "_").toUpperCase();
    const normalizedRoles = Array.from(new Set(collected.map(normalize)));
    
    console.log('[decodeRoles] Collected roles:', collected);
    console.log('[decodeRoles] Normalized roles:', normalizedRoles);
    
    return normalizedRoles;
  } catch (error) {
    console.error('[decodeRoles] Error decoding JWT:', error);
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
    console.log('[Admin Layout] No auth cookie found');
    redirect(AUTH_CONFIG.loginPath);
  }

  const roles = decodeRoles(authCookie.value);
  const hasAdminRole = roles.some((role) => ADMIN_ROLES.has(role));

  console.log('[Admin Layout] Decoded roles:', roles);
  console.log('[Admin Layout] Admin roles check:', { roles, hasAdminRole, ADMIN_ROLES: Array.from(ADMIN_ROLES) });

  if (!hasAdminRole) {
    console.log('[Admin Layout] Access denied - user does not have admin role');
    const redirectUrl = new URL(AUTH_CONFIG.defaultRedirect, "http://localhost");
    redirectUrl.searchParams.set("unauthorized", "true");
    redirect(redirectUrl.pathname + redirectUrl.search);
  }

  return <AdminGuard>{children}</AdminGuard>;
}
