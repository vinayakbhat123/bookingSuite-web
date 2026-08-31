import { authApi } from '../api';
import { LoginRequest, LoginResponse, SignupRequest, UserResponse } from '../types/api';

export const authService = {
  /**
   * POST /auth/signup
   */
  async signup(data: SignupRequest): Promise<UserResponse> {
    return authApi.signup(data);
  },

  /**
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return authApi.login(data);
  },

  /**
   * POST /auth/refresh
   */
  async refresh(refreshToken?: string): Promise<LoginResponse> {
    return authApi.refresh(refreshToken);
  },

  /**
   * POST /auth/logout
   */
  async logout(refreshToken?: string): Promise<void> {
    return authApi.logout(refreshToken);
  },
};
