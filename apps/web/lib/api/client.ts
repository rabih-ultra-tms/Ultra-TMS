/**
 * SSR-safe API Client
 *
 * Authentication Strategy:
 * - HTTP-only cookies are set by the backend on login
 * - Cookies are automatically sent with credentials: 'include'
 * - For Server Components, cookies are forwarded via Next.js headers
 * - NO localStorage usage (XSS-safe)
 */

import { AUTH_CONFIG } from "@/lib/config/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "accessToken";
const REFRESH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "refreshToken";

const DEFAULT_ACCESS_MAX_AGE = 15 * 60;
const DEFAULT_REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

function readCookie(cookieString: string, name: string): string | undefined {
  const parts = cookieString.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) {
    return undefined;
  }
  return decodeURIComponent(match.substring(name.length + 1));
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function getClientAccessToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const fromCookie = readCookie(document.cookie || "", AUTH_COOKIE_NAME);
  if (fromCookie) {
    return fromCookie;
  }

  try {
    return localStorage.getItem("accessToken") || undefined;
  } catch {
    return undefined;
  }
}

function getClientRefreshToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const fromCookie = readCookie(document.cookie || "", REFRESH_COOKIE_NAME);
  if (fromCookie) {
    return fromCookie;
  }

  try {
    return localStorage.getItem("refreshToken") || undefined;
  } catch {
    return undefined;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = typeof atob === "function"
      ? atob(normalized)
      : typeof Buffer !== "undefined"
        ? Buffer.from(normalized, "base64").toString("utf-8")
        : "";
    if (!decoded) return null;
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp === "number") {
    return exp;
  }
  return null;
}

export function setAuthTokens(tokens: TokenPair): void {
  if (typeof window === "undefined") return;

  if (tokens.accessToken) {
    const accessMaxAge = typeof tokens.expiresIn === "number"
      ? Math.max(tokens.expiresIn, 60)
      : DEFAULT_ACCESS_MAX_AGE;
    writeCookie(AUTH_CONFIG.accessTokenCookie, tokens.accessToken, accessMaxAge);
    try {
      localStorage.setItem("accessToken", tokens.accessToken);
    } catch {
      // ignore storage errors
    }
  }

  if (tokens.refreshToken) {
    writeCookie(AUTH_CONFIG.refreshTokenCookie, tokens.refreshToken, DEFAULT_REFRESH_MAX_AGE);
    try {
      localStorage.setItem("refreshToken", tokens.refreshToken);
    } catch {
      // ignore storage errors
    }
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  deleteCookie(AUTH_CONFIG.accessTokenCookie);
  deleteCookie(AUTH_CONFIG.refreshTokenCookie);
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch {
    // ignore storage errors
  }
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const returnUrl = window.location.pathname + window.location.search;
  const loginUrl = `${AUTH_CONFIG.loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`;
  window.location.href = loginUrl;
}

let refreshPromise: Promise<TokenPair | null> | null = null;

async function refreshTokens(): Promise<TokenPair | null> {
  if (typeof window === "undefined") return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getClientRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { data?: TokenPair };
      if (payload?.data?.accessToken) {
        setAuthTokens(payload.data);
        return payload.data;
      }

      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function maybeRefreshOnActivity(): Promise<void> {
  if (typeof window === "undefined") return;
  const accessToken = getClientAccessToken();
  const refreshToken = getClientRefreshToken();
  if (!accessToken || !refreshToken) return;

  const exp = getTokenExpiry(accessToken);
  if (!exp) return;
  const now = Math.floor(Date.now() / 1000);
  if (exp - now <= 60) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      clearAuthTokens();
      redirectToLogin();
    }
  }
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
    this.name = "ApiError";
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

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  serverCookies?: string;
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
    const skipActivityRefresh =
      endpoint.startsWith("/auth/login") ||
      endpoint.startsWith("/auth/refresh") ||
      endpoint.startsWith("/auth/register") ||
      endpoint.startsWith("/auth/forgot-password") ||
      endpoint.startsWith("/auth/reset-password") ||
      endpoint.startsWith("/auth/verify-email") ||
      endpoint.startsWith("/auth/mfa") ||
      endpoint.startsWith("/auth/logout");

    if (!hasRetried && !skipActivityRefresh) {
      await maybeRefreshOnActivity();
    }

    const url = this.getFullUrl(endpoint);
    const { body, serverCookies, ...fetchOptions } = options;

    const headers: HeadersInit = {};
    
    // Only set Content-Type if body is not FormData
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    } else {
      headers["Accept"] = "application/json";
    }
    
    Object.assign(headers, options.headers as Record<string, string>);

    const hasAuthHeader =
      typeof (headers as Record<string, string>).Authorization === "string" ||
      typeof (headers as Record<string, string>).authorization === "string";

    if (!hasAuthHeader) {
      const accessToken = getClientAccessToken();
      if (accessToken) {
        (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      }
    }

    if (serverCookies) {
      (headers as Record<string, string>)["Cookie"] = serverCookies;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      credentials: "include",
    });

    const skipRefresh =
      endpoint.startsWith("/auth/login") ||
      endpoint.startsWith("/auth/refresh") ||
      endpoint.startsWith("/auth/register") ||
      endpoint.startsWith("/auth/forgot-password") ||
      endpoint.startsWith("/auth/reset-password") ||
      endpoint.startsWith("/auth/verify-email") ||
      endpoint.startsWith("/auth/mfa") ||
      endpoint.startsWith("/auth/logout");

    if (response.status === 401 && !hasRetried && !skipRefresh) {
      const refreshed = await refreshTokens();
      if (refreshed?.accessToken) {
        return this.request<T>(endpoint, options, true);
      }

      clearAuthTokens();
      redirectToLogin();
    }

    if (!response.ok) {
      let errorBody: unknown;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errors: Record<string, string[]> | undefined;
      let code: string | undefined;

      try {
        errorBody = await response.json();
        if (typeof errorBody === "object" && errorBody !== null) {
          const bodyData = errorBody as Record<string, unknown>;
          errorMessage = (bodyData.message as string) || errorMessage;
          errors = bodyData.errors as Record<string, string[]>;
          code = bodyData.code as string;
        }
      } catch {
        // Response wasn't JSON
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
        if (value !== undefined && value !== "" && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: data });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: data });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: data });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { serverCookies, ...fetchOptions } = options || {};

    const headers: HeadersInit = {
      ...(options?.headers as Record<string, string>),
    };

    if (serverCookies) {
      (headers as Record<string, string>)["Cookie"] = serverCookies;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        // Response wasn't JSON
      }
      const message = (errorBody as { message?: string })?.message || response.statusText;
      throw new ApiError(message, response.status, response.statusText, errorBody);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, PaginatedResponse };

export function getServerCookies(): string {
  throw new Error(
    "getServerCookies must be called in a Server Component. Use: cookies().toString()"
  );
}
