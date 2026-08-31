import { apiClient } from '../lib/apiClient';
import { BookingRequest, BookingResponse, GuestRequest } from '../types/api';

export const bookingService = {
  /**
   * POST /bookings/init
   * Initialize a booking with hotelId, roomId, checkInDate, checkOutDate, roomsCount
   */
  async initBooking(data: BookingRequest): Promise<BookingResponse> {
    const res = await apiClient.post<any, BookingResponse>('/bookings/init', data);
    return res;
  },

  /**
   * POST /bookings/{bookingId}/addGuests
   * Add guest information array to an existing booking
   */
  async addGuests(bookingId: number, guests: GuestRequest[]): Promise<BookingResponse> {
    const res = await apiClient.post<any, BookingResponse>(`/bookings/${bookingId}/addGuests`, guests);
    return res;
  },

  /**
   * POST /bookings/{bookingId}/cancel
   * Cancel an existing booking
   */
  async cancelBooking(bookingId: number): Promise<BookingResponse> {
    const res = await apiClient.post<any, BookingResponse>(`/bookings/${bookingId}/cancel`);
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

  /**
   * GET /admin/hotels/{hotelId}/bookings
   * Retrieve all bookings for a specific hotel (for managers/admins)
   */
  async getAdminHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    const res = await apiClient.get<any, BookingResponse[]>(`/admin/hotels/${hotelId}/bookings`);
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  async getHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    return this.getAdminHotelBookings(hotelId);
  },
};
