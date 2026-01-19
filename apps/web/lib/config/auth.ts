/**
 * Auth configuration - update these to match your backend
 */
export const AUTH_CONFIG = {
  accessTokenCookie: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "accessToken",
  csrfTokenCookie: process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME || "csrfToken",
  csrfHeaderName: "X-CSRF-Token",
  publicPaths: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/health",
  ],
  loginPath: "/login",
  defaultRedirect: "/dashboard",
} as const;
