import { CsrfMiddleware } from './csrf.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('CsrfMiddleware (SEC-029: SameSite Protection)', () => {
  let middleware: CsrfMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let cookieSetCalls: any[] = [];

  beforeEach(() => {
    middleware = new CsrfMiddleware();
    cookieSetCalls = [];

    req = {
      method: 'GET',
      originalUrl: '/api/v1/test',
      cookies: {},
      headers: {},
    };

    res = {
      cookie: jest.fn((name: string, value: string, options: any) => {
        cookieSetCalls.push({ name, value, options });
        return res;
      }),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('SameSite Cookie Attribute', () => {
    it('sets CSRF token cookie with sameSite=lax', () => {
      (req as any).method = 'GET';
      middleware.use(req as Request, res as Response, next);

      const csrfCookie = cookieSetCalls.find((c) => c.name === 'csrfToken');
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie.options.sameSite).toBe('lax');
      expect(csrfCookie.options.httpOnly).toBe(false); // JS-readable for CSRF header
      expect(csrfCookie.options.secure).toBe(
        process.env.NODE_ENV === 'production'
      );
    });

    it('sets rotated CSRF token with sameSite=lax on state-changing requests', () => {
      (req as any).method = 'POST';
      (req as any).cookies = { csrfToken: 'existing-token' };
      (req as any).headers = { 'x-csrf-token': 'existing-token' };

      middleware.use(req as Request, res as Response, next);

      const csrfCookie = cookieSetCalls.find(
        (c) => c.name === 'csrfToken' && c.options.sameSite === 'lax'
      );
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie.options.sameSite).toBe('lax');
    });
  });

  describe('CSRF Token Validation', () => {
    it('allows GET requests without CSRF token validation', () => {
      (req as any).method = 'GET';
      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects POST requests with missing CSRF token', () => {
      (req as any).method = 'POST';
      (req as any).originalUrl = '/api/v1/some-endpoint';
      (req as any).cookies = { csrfToken: 'token-value' };
      // No header token provided

      middleware.use(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'CSRF token validation failed',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects POST requests with mismatched CSRF tokens', () => {
      (req as any).method = 'POST';
      (req as any).originalUrl = '/api/v1/some-endpoint';
      (req as any).cookies = { csrfToken: 'cookie-token' };
      (req as any).headers = { 'x-csrf-token': 'header-token' };

      middleware.use(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows POST requests with matching CSRF tokens', () => {
      (req as any).method = 'POST';
      (req as any).originalUrl = '/api/v1/some-endpoint';
      (req as any).cookies = { csrfToken: 'valid-token' };
      (req as any).headers = { 'x-csrf-token': 'valid-token' };

      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Auth Endpoint Exclusions', () => {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/refresh',
      '/health',
    ];

    authEndpoints.forEach((endpoint) => {
      it(`skips CSRF validation for ${endpoint}`, () => {
        (req as any).method = 'POST';
        (req as any).originalUrl = endpoint;
        // No CSRF tokens provided

        middleware.use(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });
  });
});
