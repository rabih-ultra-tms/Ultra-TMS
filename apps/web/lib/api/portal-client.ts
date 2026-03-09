/**
 * Portal API Client
 *
 * Separate from the main apiClient — uses portal-specific JWT cookie
 * for Customer Portal authentication.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const PORTAL_ACCESS_COOKIE = 'portal_access_token';
const PORTAL_REFRESH_COOKIE = 'portal_refresh_token';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const parts = document.cookie.split(';').map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : undefined;
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setPortalTokens(accessToken: string, refreshToken?: string) {
  writeCookie(PORTAL_ACCESS_COOKIE, accessToken, 2 * 60 * 60); // 2h
  if (refreshToken) {
    writeCookie(PORTAL_REFRESH_COOKIE, refreshToken, 7 * 24 * 60 * 60); // 7d
  }
}

export function clearPortalTokens() {
  deleteCookie(PORTAL_ACCESS_COOKIE);
  deleteCookie(PORTAL_REFRESH_COOKIE);
}

export function getPortalAccessToken(): string | undefined {
  return readCookie(PORTAL_ACCESS_COOKIE);
}

export function getPortalRefreshToken(): string | undefined {
  return readCookie(PORTAL_REFRESH_COOKIE);
}

export class PortalApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PortalApiError';
    this.status = status;
  }
}

async function portalRequest<T>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!options.skipAuth) {
    const token = getPortalAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse error
    }
    throw new PortalApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const portalApi = {
  get: <T>(endpoint: string) => portalRequest<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown, options?: { skipAuth?: boolean }) =>
    portalRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    portalRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    portalRequest<T>(endpoint, { method: 'DELETE' }),
};
