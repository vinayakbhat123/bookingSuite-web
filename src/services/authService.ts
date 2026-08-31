import { apiClient, getRefreshToken, setAccessToken, setRefreshToken } from '../lib/apiClient';
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
   * Call refreshToken to fetch new accessToken
   */
  async refresh(refreshToken?: string): Promise<LoginResponse> {
    const tokenToUse = refreshToken || getRefreshToken();
    if (!tokenToUse) {
      throw new Error('No refresh token available');
    }
    const res = await apiClient.post<any, any>('/auth/refresh', {
      refreshToken: tokenToUse,
    });
    const data = res?.data || res;
    const newAccessToken = data?.AccessToken || data?.accessToken;
    const newRefreshToken = data?.refreshToken || tokenToUse;
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
    }
    return {
      AccessToken: newAccessToken || '',
      refreshToken: newRefreshToken,
      roles: data?.roles,
      user: data?.user,
    };
  },

  /**
   * POST /auth/logout
   * Logout using a refresh token
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      const tokenToUse = refreshToken || getRefreshToken();
      if (tokenToUse) {
        await apiClient.post('/auth/logout', {
          refreshToken: tokenToUse,
        });
      } else {
        await apiClient.post('/auth/logout', {
          refreshToken: '',
        });
      }
    } catch (err) {
      console.warn('Backend POST /auth/logout notice:', err);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },
};
