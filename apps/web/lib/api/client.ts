/**
 * SSR-safe API Client
 *
 * Authentication Strategy:
 * - HTTP-only cookies are set by the backend on login
 * - Cookies are automatically sent with credentials: 'include'
 * - For Server Components, cookies are forwarded via Next.js headers
 * - NO localStorage usage (XSS-safe)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

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
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const { body, serverCookies, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (serverCookies) {
      (headers as Record<string, string>)["Cookie"] = serverCookies;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

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
