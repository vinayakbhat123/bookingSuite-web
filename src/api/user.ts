import { apiFetch } from './client';
import { BookingResponse, UserProfileRequest, UserResponse } from '../types/api';

export const userApi = {
  /**
   * GET /users/me
   * Returns user profile details: { name, email, lastName, phoneNumber, birthDate, gender, bio }
   */
  async getMe(): Promise<UserResponse> {
    return apiFetch<UserResponse>('/users/me', {
      method: 'GET',
    });
  },

  /**
   * PATCH /users/profile
   * Body: UserProfileRequest ({ name, lastName, phoneNumber, birthDate, gender, bio })
   */
  async updateProfile(data: UserProfileRequest): Promise<UserResponse> {
    await apiFetch<string>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return this.getMe();
  },

  /**
   * GET /users/mybookings
   * Returns BookingResponse[]
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    const res = await apiFetch<BookingResponse[]>('/users/mybookings', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },
};
