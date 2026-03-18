/* eslint-disable no-undef */
/**
 * SSR-safe API Client
 *
 * SEC-001 Authentication Strategy:
 * - HttpOnly cookies are set by the backend on login/refresh
 * - Cookies are automatically sent with credentials: 'include'
 * - JavaScript CANNOT read or write auth tokens (XSS-safe)
 * - For Server Components, cookies are forwarded via Next.js headers
 * - On 401, the client attempts a silent refresh via /auth/refresh
 * - NO localStorage, NO client-side cookie manipulation for tokens
 */

import { AUTH_CONFIG } from '@/lib/config/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * SEC-003: Read the CSRF token from the non-HttpOnly cookie.
 * The backend sets this cookie; we read it and send it back
 * as the X-CSRF-Token header for double-submit cookie validation.
 */
function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const parts = document.cookie.split(';').map((p) => p.trim());
  const match = parts.find((p) => p.startsWith('csrfToken='));
  return match
    ? decodeURIComponent(match.substring('csrfToken='.length))
    : undefined;
}

/**
 * @deprecated No-op. Tokens are now managed as HttpOnly cookies by the backend.
 * Kept for backwards compatibility during migration — will be removed in a future sprint.
 */
export function setAuthTokens(_tokens?: unknown): void {
  // No-op: HttpOnly cookies are set by the backend
}

/**
 * @deprecated No-op. Tokens are now cleared by the backend on logout.
 * Kept for backwards compatibility during migration — will be removed in a future sprint.
 */
export function clearAuthTokens(): void {
  // No-op: HttpOnly cookies are cleared by the backend on logout
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const returnUrl = window.location.pathname + window.location.search;
  const loginUrl = `${AUTH_CONFIG.loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`;
  window.location.href = loginUrl;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * SEC-001: Attempt to refresh tokens via HttpOnly cookies.
 * The backend reads the refresh token from the cookie and sets new HttpOnly cookies.
 * Returns true if refresh succeeded, false otherwise.
 */
async function refreshTokens(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      // SEC-003: CSRF token not needed for /auth/refresh (exempt in middleware)

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: refreshHeaders,
        credentials: 'include',
        body: JSON.stringify({}),
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;
  public readonly errors?: Record<string, string[]>;
  public readonly code?: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    body?: unknown,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.errors = errors;
    this.code = code;
  }

  isStatus(status: number): boolean {
    return this.status === status;
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  serverCookies?: string;
}

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/mfa',
  '/auth/logout',
];

function isAuthEndpoint(endpoint: string): boolean {
  return AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    hasRetried = false
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { body, serverCookies, ...fetchOptions } = options;

    const headers: Record<string, string> = {};

    // Only set Content-Type if body is not FormData
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    } else {
      headers['Accept'] = 'application/json';
    }

    Object.assign(headers, options.headers as Record<string, string>);

    // SEC-001: Do NOT inject Authorization header from cookies.
    // HttpOnly cookies are sent automatically via credentials: 'include'.
    // Only forward explicit server-side cookies for SSR.
    if (serverCookies) {
      (headers as Record<string, string>)['Cookie'] = serverCookies;
    }

    // SEC-003: Inject CSRF token header for state-changing requests
    const requestMethod = (fetchOptions.method || 'GET').toUpperCase();
    if (
      requestMethod !== 'GET' &&
      requestMethod !== 'HEAD' &&
      requestMethod !== 'OPTIONS'
    ) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        (headers as Record<string, string>)[AUTH_CONFIG.csrfHeaderName] =
          csrfToken;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
      credentials: 'include',
    });

    // On 401, attempt a silent token refresh (unless this is an auth endpoint or already retried)
    if (response.status === 401 && !hasRetried && !isAuthEndpoint(endpoint)) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return this.request<T>(endpoint, options, true);
      }

      redirectToLogin();
    }

    if (!response.ok) {
      let errorBody: unknown;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errors: Record<string, string[]> | undefined;
      let code: string | undefined;

      try {
        errorBody = await response.json();
        if (typeof errorBody === 'object' && errorBody !== null) {
          const bodyData = errorBody as Record<string, unknown>;
          errorMessage = (bodyData.message as string) || errorMessage;
          errors = bodyData.errors as Record<string, string[]>;
          code = bodyData.code as string;
        }
      } catch {
        // Ignore JSON parse errors for error responses
      }

      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText,
        errorBody,
        errors,
        code
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options?: RequestOptions
  ): Promise<T> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { serverCookies, ...fetchOptions } = options || {};

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (serverCookies) {
      (headers as Record<string, string>)['Cookie'] = serverCookies;
    }

    // SEC-003: Inject CSRF token for upload (POST)
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      (headers as Record<string, string>)[AUTH_CONFIG.csrfHeaderName] =
        csrfToken;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorBody: unknown;
      let errors: Record<string, string[]> | undefined;
      let code: string | undefined;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        errorBody = await response.json();
        if (typeof errorBody === 'object' && errorBody !== null) {
          const bodyData = errorBody as Record<string, unknown>;
          errorMessage = (bodyData.message as string) || errorMessage;
          errors = bodyData.errors as Record<string, string[]>;
          code = bodyData.code as string;
        }
      } catch {
        // Ignore JSON parse errors for error responses
      }
      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText,
        errorBody,
        errors,
        code
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, PaginatedResponse };

export function getServerCookies(): string {
  throw new Error(
    'getServerCookies must be called in a Server Component. Use: cookies().toString()'
  );
}
