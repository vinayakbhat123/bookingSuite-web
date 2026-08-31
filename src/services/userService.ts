import { apiClient } from '../lib/apiClient';
import { BookingResponse, UserProfileRequest, UserResponse } from '../types/api';

export const userService = {
  /**
   * GET /users/me
   * Retrieve current authenticated user profile
   */
  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<any, UserResponse>('/users/me');
    return res;
  },

  /**
   * PUT /users/profile
   * Update profile fields: name, lastName, phoneNumber, birthDate, gender, bio
   */
  async updateProfile(data: UserProfileRequest): Promise<UserResponse> {
    const res = await apiClient.put<any, UserResponse>('/users/profile', data);
    return res;
  },

  /**
   * GET /users/mybookings
   * Retrieve all bookings for current authenticated user
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    const res = await apiClient.get<any, BookingResponse[]>('/users/mybookings');
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },
};

