import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "./lib/config/auth";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
