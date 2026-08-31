/**
 * Bridge layer ensuring backward compatibility with any legacy imports
 * while redirecting directly to the unified typed src/api client.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  apiFetch,
  ApiLogEntry,
  getAccessToken,
  getBaseUrl,
  getRefreshToken,
  setAccessToken,
  setBaseUrl,
  setRefreshToken,
  subscribeToApiLogs,
} from '../api/client';

export type { ApiLogEntry };
export {
  apiFetch,
  getAccessToken,
  getBaseUrl,
  getRefreshToken,
  setAccessToken,
  setBaseUrl,
  setRefreshToken,
  subscribeToApiLogs,
};

export const getStoredBaseUrl = getBaseUrl;
export const setStoredBaseUrl = setBaseUrl;

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getBaseUrl();
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      response.data.data !== undefined &&
      ('success' in response.data || 'timestamp' in response.data || 'message' in response.data)
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    return Promise.reject(extractErrorMessage(error));
  }
);

export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data) {
    const d = error.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
    if (Array.isArray(d.errors) && d.errors.length > 0) {
      return d.errors
        .map((e: any) => e.defaultMessage || e.message || JSON.stringify(e))
        .join(', ');
    }
  }
  if (error?.message) {
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return `Cannot connect to backend server at ${getBaseUrl()}. Please ensure your Spring Boot server is running.`;
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
