import { apiClient } from '../lib/apiClient';
import { RoomRequest, RoomResponse } from '../types/api';

export const roomService = {
  /**
   * GET /admin/hotels/{hotelId}/room
   * List all rooms for a hotel
   */
  async getAdminRooms(hotelId: number): Promise<RoomResponse[]> {
    const res = await apiClient.get<any, RoomResponse[]>(`/admin/hotels/${hotelId}/room`);
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * POST /admin/hotels/{hotelId}/room
   * Create a room in a hotel
   */
  async createAdminRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    const res = await apiClient.post<any, RoomResponse>(`/admin/hotels/${hotelId}/room`, data);
    return res;
  },

  /**
   * GET /admin/hotels/{hotelId}/room/{roomId}`
   * Get single room details
   */
  async getAdminRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    const res = await apiClient.get<any, RoomResponse>(`/admin/hotels/${hotelId}/room/${roomId}`);
    return res;
  },

  /**
   * PUT /admin/hotels/{hotelId}/room/{roomId}`
   * Update room details
   */
  async updateAdminRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    const res = await apiClient.put<any, RoomResponse>(`/admin/hotels/${hotelId}/room/${roomId}`, data);
    return res;
  },

  /**
   * DELETE /admin/hotels/{hotelId}/room/{roomId}`
   * Delete room
   */
  async deleteAdminRoom(hotelId: number, roomId: number): Promise<void> {
    await apiClient.delete(`/admin/hotels/${hotelId}/room/${roomId}`);
  },

  async getRoomsByHotel(hotelId: number): Promise<RoomResponse[]> {
    return this.getAdminRooms(hotelId);
  },

  async createRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    return this.createAdminRoom(hotelId, data);
  },

  async getRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    return this.getAdminRoomById(hotelId, roomId);
  },

  async updateRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    return this.updateAdminRoom(hotelId, roomId, data);
  },

  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    return this.deleteAdminRoom(hotelId, roomId);
  },
};
