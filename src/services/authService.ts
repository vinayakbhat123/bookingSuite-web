import { apiClient, setAccessToken, setRefreshToken } from '../lib/apiClient';
import { ApiResponse, LoginRequest, LoginResponse, SignupRequest } from '../types/api';

export const authService = {
  /**
   * POST /auth/signup
   */
  async signup(data: SignupRequest): Promise<ApiResponse> {
    const res = await apiClient.post<any, ApiResponse>('/auth/signup', data);
    return res;
  },

  /**
   * POST /auth/login
   * Login returns LoginResponse whose access-token property is exactly AccessToken
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<any, LoginResponse>('/auth/login', data);
    if (res?.AccessToken) {
      setAccessToken(res.AccessToken);
      if (res.refreshToken) {
        setRefreshToken(res.refreshToken);
      }
    }
    return res;
  },

  /**
   * POST /auth/refresh
   */
  async refresh(refreshToken?: string): Promise<LoginResponse> {
    const res = await apiClient.post<any, LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    if (res?.AccessToken) {
      setAccessToken(res.AccessToken);
      if (res.refreshToken) {
        setRefreshToken(res.refreshToken);
      }
    }
    return res;
  },

  /**
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore logout network errors
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },
};
