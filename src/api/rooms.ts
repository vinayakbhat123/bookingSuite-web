import { apiFetch } from './client';
import { RoomRequest, RoomResponse } from '../types/api';

export const roomsApi = {
  /**
   * GET /hotels/{hotelId}/rooms/allrooms
   * Public: List all rooms for a hotel
   */
  async getRoomsByHotel(hotelId: number): Promise<RoomResponse[]> {
    const res = await apiFetch<RoomResponse[]>(`/hotels/${hotelId}/rooms/allrooms`, {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * GET /hotels/{hotelId}/rooms/{roomId}
   * Public: Get single room details
   */
  async getRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    return apiFetch<RoomResponse>(`/hotels/${hotelId}/rooms/${roomId}`, {
      method: 'GET',
    });
  },

  /**
   * POST /admin/hotels/{hotelId}/room
   * Admin: Create room in hotel
   */
  async createAdminRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    return apiFetch<RoomResponse>(`/admin/hotels/${hotelId}/room`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /admin/hotels/{hotelId}/room/{roomId}
   * Admin: Update room in hotel
   */
  async updateAdminRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    return apiFetch<RoomResponse>(`/admin/hotels/${hotelId}/room/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /admin/hotels/{hotelId}/room/{roomId}
   * Admin: Delete room in hotel
   */
  async deleteAdminRoom(hotelId: number, roomId: number): Promise<void> {
    return apiFetch<void>(`/admin/hotels/${hotelId}/room/${roomId}`, {
      method: 'DELETE',
    });
  },
};
