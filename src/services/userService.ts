import { userApi } from '../api';
import { BookingResponse, UserProfileRequest, UserResponse } from '../types/api';

export const userService = {
  /**
   * GET /users/me
   */
  async getMe(): Promise<UserResponse> {
    return userApi.getMe();
  },

  /**
   * PUT /users/profile
   */
  async updateProfile(data: UserProfileRequest): Promise<UserResponse> {
    return userApi.updateProfile(data);
  },

  /**
   * GET /users/mybookings
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    return userApi.getMyBookings();
  },
};
