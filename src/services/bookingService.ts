import { bookingsApi } from '../api';
import { BookingRequest, BookingResponse, GuestRequest } from '../types/api';

/**
 * Normalizer for BookingResponse ensuring consistent fields and non-zero price preservation
 */
export function normalizeBookingResponse(raw: any): BookingResponse {
  if (!raw) {
    return {
      id: 0,
      hotelId: 0,
      hotelName: '',
      cityName: '',
      roomId: 0,
      roomType: 'DOUBLE',
      checkInDate: '',
      checkOutDate: '',
      roomsCount: 1,
      status: 'RESERVED',
      bookingStatus: 'RESERVED',
      guests: [],
      price: 0,
      amount: 0,
      totalAmount: 0,
    };
  }

  const id = Number(raw.id ?? raw.bookingId ?? 0);
  const hotelId = Number(raw.hotelId ?? raw.hotel?.id ?? 0);
  const hotelName = raw.hotelName ?? raw.hotel?.hotelName ?? raw.hotel?.name ?? '';
  const cityName = raw.cityName ?? raw.hotel?.cityName ?? raw.hotel?.city ?? '';
  const roomId = Number(raw.roomId ?? raw.room?.id ?? 0);
  const roomType = raw.roomType ?? raw.room?.roomType ?? 'DOUBLE';
  const checkInDate = raw.checkInDate || '';
  const checkOutDate = raw.checkOutDate || '';
  const roomsCount = Number(raw.roomsCount ?? 1);
  const status = raw.status || raw.bookingStatus || 'RESERVED';
  const bookingStatus = status;

  // Authoritative price preservation from backend
  const parsedPrice = Number(raw.price ?? raw.totalAmount ?? raw.amount ?? 0);

  let guests: GuestRequest[] = [];
  if (Array.isArray(raw.guests)) {
    guests = raw.guests.map((g: any) => ({
      id: g.id,
      name: g.name || '',
      gender: g.gender || 'OTHER',
      age: Number(g.age || 18),
    }));
  }

  return {
    id,
    bookingId: id,
    hotelId,
    hotelName,
    cityName,
    roomId,
    roomType,
    checkInDate,
    checkOutDate,
    roomsCount,
    status,
    bookingStatus,
    guests,
    price: parsedPrice,
    amount: parsedPrice,
    totalAmount: parsedPrice,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    stripeSessionId: raw.stripeSessionId,
    hotel: raw.hotel,
    room: raw.room,
  };
}

export const bookingService = {
  /**
   * 1) POST /bookings/init
   */
  async initBooking(data: BookingRequest): Promise<BookingResponse> {
    const res = await bookingsApi.initBooking(data);
    return normalizeBookingResponse(res);
  },

  /**
   * 2) POST /bookings/{bookingId}/addGuests
   */
  async addGuests(bookingId: number, guests: GuestRequest[]): Promise<BookingResponse> {
    const res = await bookingsApi.addGuests(bookingId, guests);
    return normalizeBookingResponse(res);
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
    const res = await bookingsApi.cancelBooking(bookingId);
    return normalizeBookingResponse(res);
  },

  /**
   * GET /bookings/{bookingId}
   */
  async getBookingById(bookingId: number): Promise<BookingResponse> {
    const res = await bookingsApi.getBookingById(bookingId);
    return normalizeBookingResponse(res);
  },

  /**
   * POST /bookings/{bookingId}/payments/verify
   */
  async verifyPayment(bookingId: number, sessionId?: string): Promise<BookingResponse> {
    const res = await bookingsApi.verifyPayment(bookingId, sessionId);
    return normalizeBookingResponse(res);
  },

  /**
   * GET /users/mybookings
   */
  async getMyBookings(): Promise<BookingResponse[]> {
    const res = await bookingsApi.getMyBookings();
    return (Array.isArray(res) ? res : []).map(normalizeBookingResponse);
  },

  /**
   * GET /admin/hotels/{hotelId}/bookings
   */
  async getAdminHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    const res = await bookingsApi.getHotelBookings(hotelId);
    return (Array.isArray(res) ? res : []).map(normalizeBookingResponse);
  },

  async getHotelBookings(hotelId: number): Promise<BookingResponse[]> {
    const res = await bookingsApi.getHotelBookings(hotelId);
    return (Array.isArray(res) ? res : []).map(normalizeBookingResponse);
  },
};
