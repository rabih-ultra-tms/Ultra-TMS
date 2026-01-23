import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "./lib/config/auth";

const rbacRules = [
  {
    pattern: /^\/admin(\/|$)/,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];

function decodeRoles(token?: string): string[] {
  if (!token) return [];

  try {
    const rawToken = token.includes("%") ? decodeURIComponent(token) : token;
    const payloadSegment = rawToken.split(".")[1];
    if (!payloadSegment) return [];

    const normalizedSegment = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const decodeBase64 = (value: string) => {
      if (typeof atob === "function") {
        return atob(value);
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "base64").toString("utf-8");
      }
      return "";
    };
    const decoded = decodeBase64(normalizedSegment);
    const payload = JSON.parse(decoded) as {
      role?: string;
      roleName?: string;
      roles?: string[];
    };

    const collected = [payload.role, payload.roleName, ...(payload.roles ?? [])].filter(
      Boolean,
    ) as string[];
    const normalize = (role: string) => role.replace(/-/g, "_").toUpperCase();
    return Array.from(new Set(collected.map(normalize)));
  } catch {
    return [];
  }
}

const alwaysPublicPatterns = [
  /^\/_next/,
  /^\/favicon/,
  /^\/public/,
  /\.(ico|png|jpg|jpeg|svg|css|js)$/,
];

function isPublicPath(pathname: string): boolean {
  if (alwaysPublicPatterns.some((pattern) => pattern.test(pathname))) {
    return true;
  }

  return AUTH_CONFIG.publicPaths.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get(AUTH_CONFIG.accessTokenCookie);

  if (!authToken) {
    const loginUrl = new URL(AUTH_CONFIG.loginPath, request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matchedRule = rbacRules.find((rule) => rule.pattern.test(pathname));

  if (matchedRule) {
    const roles = decodeRoles(authToken?.value);
    const required = matchedRule.roles.map((role) => role.replace(/-/g, "_").toUpperCase());

    console.log('[RBAC Middleware]', {
      pathname,
      userRoles: roles,
      requiredRoles: required,
      tokenValue: authToken?.value?.substring(0, 50) + '...',
    });

    // SUPER_ADMIN bypasses all checks
    if (roles.includes('SUPER_ADMIN')) {
      return NextResponse.next();
    }

    const hasRole = roles.some((role) => required.includes(role));
    if (!hasRole) {
      console.log('[RBAC Middleware] Access denied - redirecting');
      const redirectUrl = new URL(AUTH_CONFIG.defaultRedirect, request.url);
      redirectUrl.searchParams.set("unauthorized", "true");
      return NextResponse.redirect(redirectUrl);
    }
    
    console.log('[RBAC Middleware] Access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
