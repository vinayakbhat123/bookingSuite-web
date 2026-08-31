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
   * PUT /users/profile
   * Body: UserProfileRequest ({ name, lastName, phoneNumber, birthDate, gender, bio })
   */
  async updateProfile(data: UserProfileRequest): Promise<UserResponse> {
    return apiFetch<UserResponse>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
