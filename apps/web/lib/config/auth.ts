/**
 * Auth configuration - update these to match your backend
 */
export const AUTH_CONFIG = {
  accessTokenCookie: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "accessToken",
  refreshTokenCookie: process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "refreshToken",
  csrfTokenCookie: process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME || "csrfToken",
  csrfHeaderName: "X-CSRF-Token",
  // Default tenant ID for development (should be replaced with subdomain resolution in production)
  defaultTenantId: process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "default-tenant",
  publicPaths: [
    "/login",
    "/superadmin/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/v1/auth",
    "/api/health",
  ],
  loginPath: "/login",
  defaultRedirect: "/dashboard",
} as const;
