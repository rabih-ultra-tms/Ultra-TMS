import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * SEC-003: CSRF Protection using Double-Submit Cookie Pattern.
 *
 * How it works:
 * 1. On every response, set a non-HttpOnly cookie with a random CSRF token
 *    (non-HttpOnly so JavaScript can read it to include in headers)
 * 2. On state-changing requests (POST, PUT, PATCH, DELETE), verify that
 *    the X-CSRF-Token header matches the cookie value
 * 3. An attacker's cross-origin request cannot read the cookie value
 *    (same-origin policy), so they can't forge the header
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt — they should not mutate state.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    const method = req.method.toUpperCase();

    // Always ensure a CSRF cookie exists
    const existingToken = req.cookies?.[CSRF_COOKIE_NAME];
    if (!existingToken) {
      const newToken = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE_NAME, newToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    // Skip validation for safe methods
    if (safeMethods.includes(method)) {
      return next();
    }

    // Skip CSRF for auth endpoints (login/register don't have a cookie yet)
    const path = req.originalUrl || req.url;
    if (
      path.includes('/auth/login') ||
      path.includes('/auth/register') ||
      path.includes('/auth/forgot-password') ||
      path.includes('/auth/reset-password') ||
      path.includes('/auth/verify-email') ||
      path.includes('/auth/refresh') ||
      path.includes('/health')
    ) {
      return next();
    }

    // Validate CSRF token
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      res.status(403).json({
        statusCode: 403,
        message: 'CSRF token validation failed',
        error: 'Forbidden',
      });
      return;
    }

    // Rotate the CSRF token after each state-changing request
    const newToken = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    next();
  }
}
