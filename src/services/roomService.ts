import { apiClient } from '../lib/apiClient';
import { RoomRequest, RoomResponse } from '../types/api';

export const roomService = {
  /**
   * GET /hotels/{hotelId}/rooms/allrooms
   * Public: List all rooms for a hotel
   */
  async getPublicRooms(hotelId: number): Promise<RoomResponse[]> {
    try {
      const res = await apiClient.get<any, any>(`/hotels/${hotelId}/rooms/allrooms`);
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (Array.isArray(res?.content)) {
        rawList = res.content;
      } else if (Array.isArray(res?.data)) {
        rawList = res.data;
      } else if (Array.isArray(res?.rooms)) {
        rawList = res.rooms;
      }
      return rawList;
    } catch {
      return this.getAdminRooms(hotelId);
    }
  },

  /**
   * GET /hotels/{hotelId}/rooms/{roomId}
   * Public: Get single room details
   */
  async getPublicRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    try {
      const res = await apiClient.get<any, any>(`/hotels/${hotelId}/rooms/${roomId}`);
      return res?.data || res;
    } catch {
      return this.getAdminRoomById(hotelId, roomId);
    }
  },

  /**
   * GET /admin/hotels/{hotelId}/room
   * Admin: List all rooms for a hotel
   */
  async getAdminRooms(hotelId: number): Promise<RoomResponse[]> {
    try {
      const res = await apiClient.get<any, any>(`/admin/hotels/${hotelId}/room`);
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (Array.isArray(res?.content)) {
        rawList = res.content;
      } else if (Array.isArray(res?.data)) {
        rawList = res.data;
      } else if (Array.isArray(res?.rooms)) {
        rawList = res.rooms;
      }
      return rawList;
    } catch {
      return [];
    }
  },

  /**
   * POST /admin/hotels/{hotelId}/room
   * Create a room in a hotel
   */
  async createAdminRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    const res = await apiClient.post<any, any>(`/admin/hotels/${hotelId}/room`, data);
    return res?.data || res;
  },

  /**
   * GET /admin/hotels/{hotelId}/room/{roomId}
   * Get single room details
   */
  async getAdminRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    const res = await apiClient.get<any, any>(`/admin/hotels/${hotelId}/room/${roomId}`);
    return res?.data || res;
  },

  /**
   * PUT /admin/hotels/{hotelId}/room/{roomId}
   * Update room details
   */
  async updateAdminRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    const res = await apiClient.put<any, any>(`/admin/hotels/${hotelId}/room/${roomId}`, data);
    return res?.data || res;
  },

  /**
   * DELETE /admin/hotels/{hotelId}/room/{roomId}
   * Delete room
   */
  async deleteAdminRoom(hotelId: number, roomId: number): Promise<void> {
    await apiClient.delete(`/admin/hotels/${hotelId}/room/${roomId}`);
  },

  async getRoomsByHotel(hotelId: number): Promise<RoomResponse[]> {
    const publicRooms = await this.getPublicRooms(hotelId);
    if (publicRooms && publicRooms.length > 0) {
      return publicRooms;
    }
    return this.getAdminRooms(hotelId);
  },

  async createRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    return this.createAdminRoom(hotelId, data);
  },

  async getRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    try {
      const room = await this.getPublicRoomById(hotelId, roomId);
      if (room && (room.id || room.roomType)) {
        return room;
      }
    } catch {
      // Ignored
    }
    return this.getAdminRoomById(hotelId, roomId);
  },

  async updateRoom(hotelId: number, roomId: number, data: RoomRequest): Promise<RoomResponse> {
    return this.updateAdminRoom(hotelId, roomId, data);
  },

  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    return this.deleteAdminRoom(hotelId, roomId);
  },
};
