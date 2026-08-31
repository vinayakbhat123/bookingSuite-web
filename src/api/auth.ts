import { apiFetch, setAccessToken, setRefreshToken } from './client';
import { ApiResponse, LoginRequest, LoginResponse, SignupRequest, UserResponse } from '../types/api';

export const authApi = {
  /**
   * POST /auth/signup
   * Body: { name, email, password }
   * Response: { success, message, data: { id, name, email }, timestamp }
   */
  async signup(data: SignupRequest): Promise<UserResponse> {
    return apiFetch<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * POST /auth/login
   * Body: { email, password }
   * Response: { success, message, data: { AccessToken }, timestamp }
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });

    const accessToken = res?.AccessToken || (res as any)?.accessToken;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (res?.refreshToken) {
      setRefreshToken(res.refreshToken);
    }

    return {
      AccessToken: accessToken,
      accessToken: accessToken,
      refreshToken: res?.refreshToken,
      user: res?.user,
      roles: res?.roles,
    };
  },

  /**
   * POST /auth/refresh
   * Body: { refreshToken }
   * Response: { success, message, data: { AccessToken }, timestamp }
   */
  async refresh(refreshToken?: string): Promise<LoginResponse> {
    const res = await apiFetch<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken || '' }),
    });

    const accessToken = res?.AccessToken || (res as any)?.accessToken;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (res?.refreshToken) {
      setRefreshToken(res.refreshToken);
    }

    return {
      AccessToken: accessToken,
      accessToken: accessToken,
      refreshToken: res?.refreshToken,
      user: res?.user,
      roles: res?.roles,
    };
  },

  /**
   * POST /auth/logout
   * Body: { refreshToken }
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      await apiFetch<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshToken || '' }),
      });
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },
};
