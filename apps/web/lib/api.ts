/* eslint-disable no-undef */
// API Client for Ultra-TMS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';

interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  apiPrefix?: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private apiPrefix: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.apiPrefix = this.normalizePrefix(options.apiPrefix ?? API_PREFIX);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    };
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private normalizePrefix(prefix?: string): string {
    if (!prefix) return '';
    return `/${prefix.replace(/^\/+|\/+$/g, '')}`;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const isAbsolute = /^https?:\/\//i.test(endpoint);
    const cleanedEndpoint = endpoint.replace(/^\/+/, '');
    const prefixWithoutSlash = this.apiPrefix.replace(/^\/+/, '');
    const alreadyPrefixed = prefixWithoutSlash
      ? cleanedEndpoint === prefixWithoutSlash || cleanedEndpoint.startsWith(`${prefixWithoutSlash}/`)
      : false;

    const path = isAbsolute
      ? endpoint
      : alreadyPrefixed
        ? `/${cleanedEndpoint}`
        : `${this.apiPrefix}/${cleanedEndpoint}`;

    const url = isAbsolute
      ? new URL(path)
      : new URL(path, `${this.baseUrl.replace(/\/+$/, '')}/`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    
    return JSON.parse(text);
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...fetchOptions.headers,
      },
    });
    
    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    // Don't set Content-Type header for FormData - browser will set it with boundary
    const headers = { ...fetchOptions.headers };
    
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      method: 'POST',
      headers,
      body: formData,
    });
    
    return this.handleResponse<T>(response);
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Named export for custom instances
export { ApiClient };

// Default export
export default apiClient;
