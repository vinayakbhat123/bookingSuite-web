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
   * POST /auth/otp/send?email={email}
   */
  async sendOtp(email: string): Promise<string> {
    return authApi.sendOtp(email);
  },

  /**
   * POST /auth/otp/verify
   */
  async verifyOtp(data: { email: string; otpCode: string }): Promise<LoginResponse> {
    return authApi.verifyOtp(data);
  },

  /**
   * POST /auth/logout
   */
  async logout(refreshToken?: string): Promise<void> {
    return authApi.logout(refreshToken);
  },
};
