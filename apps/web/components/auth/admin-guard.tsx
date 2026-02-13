"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import { AUTH_CONFIG } from "@/lib/config/auth";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function normalizeRole(role: string) {
  return role.replace(/-/g, "_").toUpperCase();
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();

  const isAdmin = React.useMemo(() => {
    // Check both roles array
    const rolesFromArray = currentUser?.roles?.map((role) => {
      if (typeof role === 'string') return role;
      return (role as { name?: string })?.name || '';
    }) ?? [];
    const roleName = (currentUser as { roleName?: string })?.roleName ? [(currentUser as { roleName?: string }).roleName] : [];
    
    const allRoles = [...rolesFromArray, ...roleName]
      .filter(Boolean)
      .map((role) => normalizeRole(role as string));
    
    return allRoles.some((role) => ADMIN_ROLES.has(role));
  }, [currentUser]);

  React.useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace(`${AUTH_CONFIG.defaultRedirect}?unauthorized=true`);
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
