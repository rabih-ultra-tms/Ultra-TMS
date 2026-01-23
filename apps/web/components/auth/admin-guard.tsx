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
    const rolesFromArray = currentUser?.roles?.map((role) => role.name) ?? [];
    const roles = [...rolesFromArray]
      .filter(Boolean)
      .map((role) => normalizeRole(role));
    return roles.some((role) => ADMIN_ROLES.has(role));
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
