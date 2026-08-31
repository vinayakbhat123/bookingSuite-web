import { bookingsApi } from '../api';
import { BookingRequest, BookingResponse, GuestRequest } from '../types/api';

export const bookingService = {
  /**
   * 1) POST /bookings/init
   */
  async initBooking(data: BookingRequest): Promise<BookingResponse> {
    return bookingsApi.initBooking(data);
  },

  /**
   * 2) POST /bookings/{bookingId}/addGuests
   */
  async addGuests(bookingId: number, guests: GuestRequest[]): Promise<BookingResponse> {
    return bookingsApi.addGuests(bookingId, guests);
  },

  /**
   * 3) POST /bookings/{bookingId}/payments
   */
  async initiatePayment(bookingId: number): Promise<{ paymentUrl?: string; sessionUrl?: string; [key: string]: any }> {
    return bookingsApi.initiatePayment(bookingId);
  },

  /**
   * 4) POST /bookings/{bookingId}/cancel
   */
  async cancelBooking(bookingId: number): Promise<BookingResponse> {
    return bookingsApi.cancelBooking(bookingId);
  },

  /**
   * GET /users/mybookings
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    return bookingsApi.getMyBookings();
  },

  /**
   * GET /admin/hotels/{hotelId}/bookings
   */
  async getAdminHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    return bookingsApi.getHotelBookings(hotelId);
  },

  async getHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    return bookingsApi.getHotelBookings(hotelId);
  },
};
