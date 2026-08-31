import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, LoginResponse } from '../types/api';

const DEFAULT_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

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

// Global subscribers for live API inspection
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
      // ignore
    }
  });
};

export const getStoredBaseUrl = (): string => {
  return localStorage.getItem('bookingsuite_api_base_url') || DEFAULT_BASE_URL;
};

export const setStoredBaseUrl = (url: string): void => {
  const sanitized = url.trim().replace(/\/$/, '');
  localStorage.setItem('bookingsuite_api_base_url', sanitized);
  apiClient.defaults.baseURL = sanitized;
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('bookingsuite_access_token');
};

export const setAccessToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('bookingsuite_access_token', token);
  } else {
    localStorage.removeItem('bookingsuite_access_token');
  }
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('bookingsuite_refresh_token');
};

export const setRefreshToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('bookingsuite_refresh_token', token);
  } else {
    localStorage.removeItem('bookingsuite_refresh_token');
  }
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getStoredBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach AccessToken
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Track start time
    (config as any).__startTime = Date.now();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap data, handle 401 & token refresh, log activity
apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any)?.__startTime || Date.now();
    const durationMs = Date.now() - startTime;

    const logEntry: ApiLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      method: (response.config.method || 'GET').toUpperCase(),
      url: response.config.url || '',
      status: response.status,
      requestData: response.config.data ? tryParseJson(response.config.data) : undefined,
      responseData: response.data,
      durationMs,
    };
    notifyLog(logEntry);

    // If backend uses generic envelope { success: true, data: T } or returns direct T
    if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const startTime = (originalRequest as any)?.__startTime || Date.now();
    const durationMs = Date.now() - startTime;

    const logEntry: ApiLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      method: (originalRequest?.method || 'GET').toUpperCase(),
      url: originalRequest?.url || '',
      status: error.response?.status,
      requestData: originalRequest?.data ? tryParseJson(originalRequest.data) : undefined,
      responseData: error.response?.data,
      error: error.message || 'Request failed',
      durationMs,
    };
    notifyLog(logEntry);

    // Handle 401 Unauthorized token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(extractErrorMessage(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();

      return new Promise(async (resolve, reject) => {
        try {
          // Attempt token refresh with POST /auth/refresh
          const refreshRes = await axios.post<ApiResponse<LoginResponse> | LoginResponse>(
            `${getStoredBaseUrl()}/auth/refresh`,
            { refreshToken: currentRefreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          let newAccessToken = '';
          const responseData = refreshRes.data as any;
          if (responseData?.data?.AccessToken) {
            newAccessToken = responseData.data.AccessToken;
          } else if (responseData?.data?.accessToken) {
            newAccessToken = responseData.data.accessToken;
          } else if (responseData?.AccessToken) {
            newAccessToken = responseData.AccessToken;
          } else if (responseData?.accessToken) {
            newAccessToken = responseData.accessToken;
          }

          const newRefreshToken = responseData?.data?.refreshToken || responseData?.data?.RefreshToken || responseData?.refreshToken || responseData?.RefreshToken;
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          if (newAccessToken) {
            setAccessToken(newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            processQueue(null, newAccessToken);
            resolve(apiClient(originalRequest));
          } else {
            throw new Error('Refresh response missing AccessToken');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          setAccessToken(null);
          setRefreshToken(null);
          // Let the application know the session has expired
          window.dispatchEvent(new CustomEvent('bookingsuite:session-expired'));
          reject(extractErrorMessage(error));
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(extractErrorMessage(error));
  }
);

function tryParseJson(str: any) {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data) {
    const d = error.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
    if (Array.isArray(d.errors) && d.errors.length > 0) {
      return d.errors.map((e: any) => e.defaultMessage || e.message || JSON.stringify(e)).join(', ');
    }
  }
  if (error?.message) {
    if (error.message.includes('Network Error')) {
      return `Cannot connect to backend server at ${getStoredBaseUrl()}. Please ensure your Spring Boot app is running.`;
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
