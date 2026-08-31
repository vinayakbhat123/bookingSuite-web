import { apiFetch } from './client';
import {
  BookingResponse,
  HotelReport,
  HotelRequest,
  HotelResponse,
  InventoryResponse,
  RoomRequest,
  RoomResponse,
  UpdateInventoryRequest,
} from '../types/api';

export const adminApi = {
  /**
   * POST /admin/hotels
   * Body: HotelRequest -> returns HotelResponse / HotelRequest (raw DTO)
   */
  async createHotel(data: HotelRequest): Promise<HotelResponse> {
    return apiFetch<HotelResponse>('/admin/hotels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /admin/hotels/{id}
   * Body: HotelRequest
   */
  async updateHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    return apiFetch<HotelResponse>(`/admin/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /admin/hotels/{id}
   */
  async deleteHotel(id: number): Promise<void> {
    return apiFetch<void>(`/admin/hotels/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * PATCH /admin/hotels/{id}/activate
   */
  async activateHotel(id: number): Promise<HotelResponse> {
    return apiFetch<HotelResponse>(`/admin/hotels/${id}/activate`, {
      method: 'PATCH',
    });
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   */
  async deactivateHotel(id: number): Promise<HotelResponse> {
    return apiFetch<HotelResponse>(`/admin/hotels/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  /**
   * GET /admin/hotels/owner
   * Returns hotels owned by logged-in admin
   */
  async getOwnerHotels(): Promise<HotelResponse[]> {
    const res = await apiFetch<HotelResponse[]>('/admin/hotels/owner', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
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

  /**
   * GET /admin/hotels/{hotelId}/report?startDate=&endDate=
   * Returns: { TotalBooking, TotalRevenue, AverageRevenue }
   */
  async getHotelReport(
    hotelId: number,
    startDate?: string,
    endDate?: string
  ): Promise<HotelReport> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiFetch<HotelReport>(`/admin/hotels/${hotelId}/report`, {
      method: 'GET',
      params,
    });
  },

  /**
   * POST /admin/hotels/{hotelId}/room
   */
  async createRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    return apiFetch<RoomResponse>(`/admin/hotels/${hotelId}/room`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /admin/hotels/{hotelId}/room/{roomId}
   */
  async updateRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    return apiFetch<RoomResponse>(`/admin/hotels/${hotelId}/room/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /admin/hotels/{hotelId}/room/{roomId}
   */
  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    return apiFetch<void>(`/admin/hotels/${hotelId}/room/${roomId}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /admin/inventory/rooms/{roomId}
   */
  async getRoomInventory(roomId: number): Promise<InventoryResponse[]> {
    const res = await apiFetch<InventoryResponse[]>(`/admin/inventory/rooms/${roomId}`, {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * PATCH /admin/inventory/room/{roomId}
   */
  async updateRoomInventory(roomId: number, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    return apiFetch<InventoryResponse>(`/admin/inventory/room/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
