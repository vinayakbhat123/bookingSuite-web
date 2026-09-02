import { apiFetch } from './client';
import { BookingRequest, BookingResponse, GuestRequest } from '../types/api';

export const bookingsApi = {
  /**
   * 1) POST /bookings/init
   * Body: { hotelId, roomId, checkInDate, checkOutDate, roomsCount }
   * Response: BookingResponse
   */
  async initBooking(data: BookingRequest): Promise<BookingResponse> {
    return apiFetch<BookingResponse>('/bookings/init', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 2) POST /bookings/{bookingId}/addGuests
   * Body: [{ name, gender, age }]
   * Response: BookingResponse
   */
  async addGuests(bookingId: number, guests: GuestRequest[]): Promise<BookingResponse> {
    return apiFetch<BookingResponse>(`/bookings/${bookingId}/addGuests`, {
      method: 'POST',
      body: JSON.stringify(guests),
    });
  },

  /**
   * 3) POST /bookings/{bookingId}/payments
   * Response: data is a Stripe checkout URL / paymentSessionUrl
   */
  async initiatePayment(bookingId: number): Promise<{ paymentUrl?: string; sessionUrl?: string; [key: string]: any }> {
    const res = await apiFetch<any>(`/bookings/${bookingId}/payments`, {
      method: 'POST',
    });

    let paymentUrl = '';
    if (typeof res === 'string' && res.startsWith('http')) {
      paymentUrl = res;
    } else if (res && typeof res === 'object') {
      paymentUrl =
        res.paymentUrl ||
        res.paymentSessionUrl ||
        res.sessionUrl ||
        res.url ||
        res.checkoutUrl ||
        '';
    }

    return {
      paymentUrl,
      sessionUrl: paymentUrl,
      ...(typeof res === 'object' ? res : {}),
    };
  },

  /**
   * 4) POST /bookings/{bookingId}/cancel
   * Response: BookingResponse
   */
  async cancelBooking(bookingId: number): Promise<BookingResponse> {
    return apiFetch<BookingResponse>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * GET /users/mybookings
   * Retrieve all bookings for current user
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    const res = await apiFetch<BookingResponse[]>('/users/mybookings', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * GET /bookings/{bookingId}
   * Retrieve single booking details
   */
  async getBookingById(bookingId: number): Promise<BookingResponse> {
    return apiFetch<BookingResponse>(`/bookings/${bookingId}`, {
      method: 'GET',
    });
  },

  /**
   * POST /bookings/{bookingId}/payments/verify
   * Verifies Stripe checkout session status and confirms booking
   */
  async verifyPayment(bookingId: number, sessionId?: string): Promise<BookingResponse> {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    return apiFetch<BookingResponse>(`/bookings/${bookingId}/payments/verify${query}`, {
      method: 'POST',
    });
  },

  /**
   * GET /admin/hotels/{hotelId}/bookings
   */
  async getHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    const res = await apiFetch<BookingResponse[]>(`/admin/hotels/${hotelId}/bookings`, {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },
};
