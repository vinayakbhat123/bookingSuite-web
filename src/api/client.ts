/**
 * Core API Client with Envelope Unwrapping, In-Memory Token Management,
 * Automatic 401 Refresh & Retry, and Credential Forwarding.
 */

const DEFAULT_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// In-memory token storage (persisted in sync with sessionStorage/localStorage for page reload safety)
let inMemoryAccessToken: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem('bookingsuite_access_token') || null
    : null;

let inMemoryRefreshToken: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem('bookingsuite_refresh_token') || null
    : null;

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bookingsuite_api_base_url') || DEFAULT_BASE_URL;
  }
  return DEFAULT_BASE_URL;
};

export const setBaseUrl = (url: string): void => {
  const sanitized = url.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('bookingsuite_api_base_url', sanitized);
  }
};

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('bookingsuite_access_token', token);
    } else {
      localStorage.removeItem('bookingsuite_access_token');
    }
  }
};

export const getRefreshToken = (): string | null => inMemoryRefreshToken;

export const setRefreshToken = (token: string | null): void => {
  inMemoryRefreshToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('bookingsuite_refresh_token', token);
    } else {
      localStorage.removeItem('bookingsuite_refresh_token');
    }
  }
};

/// Global API Log Entry Interface for Dev Inspector & Monitoring
export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  requestData?: any;
  responseData?: any;
  error?: string;
  durationMs: number;
}

type LogListener = (log: ApiLogEntry) => void;
const logListeners: Set<LogListener> = new Set();

export const subscribeToApiLogs = (listener: LogListener) => {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
};

const notifyLog = (entry: ApiLogEntry) => {
  logListeners.forEach((fn) => {
    try {
      fn(entry);
    } catch {
      // Ignore listener error
    }
  });
};

function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForLogging);
  const sensitiveKeys = new Set([
    'password',
    'accesstoken',
    'refreshtoken',
    'token',
    'otp',
    'otpcode',
    'code',
    'authorization',
    'secret',
    'clientsecret',
    'stripekey',
  ]);
  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.has(k.toLowerCase())) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeForLogging(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

// Single-flight shared Promise for token refreshing across concurrent 401s
let refreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken || '' }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Refresh failed with status ${res.status}`);
      }

      const body = await res.json();
      const rawPayload = body?.data !== undefined ? body.data : body;
      const newAccessToken =
        rawPayload?.AccessToken ||
        rawPayload?.accessToken ||
        body?.AccessToken ||
        body?.accessToken ||
        null;

      const newRefreshToken =
        rawPayload?.refreshToken ||
        rawPayload?.RefreshToken ||
        body?.refreshToken ||
        null;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
      }
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } catch {
      setAccessToken(null);
      setRefreshToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bookingsuite:session-expired'));
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
  params?: Record<string, any>;
  _retry?: boolean;
}

/**
 * Single typed apiFetch<T>() helper that:
 * 1. Appends query params & base URL
 * 2. Attaches Authorization header when AccessToken is present
 * 3. Sends credentials: 'include' (for httpOnly cookies)
 * 4. Automatically refreshes token on 401 using a single-flight shared Promise and retries once
 * 5. Universal envelope unwrapping for standard Spring ApiResponse { success, message, data, timestamp }
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const startTime = Date.now();
  const baseUrl = getBaseUrl();

  // Normalize path & build full URL
  let fullUrl = path.startsWith('http')
    ? path
    : `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach in-memory AccessToken
  const token = getAccessToken();
  if (token && !options.skipAuth && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = (options.method || 'GET').toUpperCase();

  try {
    const response = await fetch(fullUrl, {
      ...options,
      method,
      headers,
      credentials: 'include', // refresh token in httpOnly cookie
    });

    const durationMs = Date.now() - startTime;

    // Handle 401 Unauthorized token refresh & retry (unless it's an auth endpoint or already retried)
    if (
      response.status === 401 &&
      !options._retry &&
      !path.includes('/auth/login') &&
      !path.includes('/auth/refresh') &&
      !path.includes('/auth/signup') &&
      !path.includes('/auth/otp')
    ) {
      const newToken = await executeTokenRefresh();
      if (!newToken) {
        throw new Error('Session expired. Please sign in again.');
      }
      return apiFetch<T>(path, { ...options, _retry: true });
    }

    // Parse Response
    let responseBody: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      const text = await response.text();
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = text;
      }
    }

    const logEntry: ApiLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      method,
      url: fullUrl,
      status: response.status,
      requestData: options.body ? sanitizeForLogging(tryParseJson(options.body)) : undefined,
      responseData: sanitizeForLogging(responseBody?.data !== undefined ? responseBody.data : responseBody),
      durationMs,
    };
    notifyLog(logEntry);

    // Treat 2xx and 302/304 with valid body as successful response from Spring Boot
    const isSuccess = response.ok || response.status === 302 || response.status === 304;

    if (!isSuccess) {
      const errorMsg =
        responseBody?.message ||
        responseBody?.error ||
        (Array.isArray(responseBody?.errors)
          ? responseBody.errors
              .map((e: any) => e.defaultMessage || e.message || e)
              .join(', ')
          : null) ||
        `HTTP ${response.status}: ${response.statusText}`;

      throw new Error(errorMsg);
    }

    // Robust Universal Envelope Unwrapping:
    // If response contains standard Spring envelope { success, message, data, timestamp } -> unwrap data
    if (
      responseBody &&
      typeof responseBody === 'object' &&
      'data' in responseBody &&
      responseBody.data !== undefined &&
      ('success' in responseBody || 'timestamp' in responseBody || 'message' in responseBody)
    ) {
      return responseBody.data as T;
    }

    return responseBody as T;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const logEntry: ApiLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      method,
      url: fullUrl,
      error: error?.message || 'Network request failed',
      durationMs,
    };
    notifyLog(logEntry);
    throw error;
  }
}

function tryParseJson(str: any) {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
