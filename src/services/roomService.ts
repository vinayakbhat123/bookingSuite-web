import { adminApi, inventoryApi, roomsApi } from '../api';
import { normalizeRoomResponse } from './hotelService';
import {
  InventoryResponse,
  RoomRequest,
  RoomResponse,
  UpdateInventoryRequest,
} from '../types/api';

export const roomService = {
  /**
   * GET /hotels/{hotelId}/rooms/allrooms
   * List all public rooms for a given hotel
   */
  async getRoomsByHotel(hotelId: number): Promise<RoomResponse[]> {
    const list = await roomsApi.getRoomsByHotel(hotelId);
    return list.map((r) => normalizeRoomResponse(r, hotelId));
  },

  /**
   * GET /hotels/{hotelId}/rooms/{roomId}
   * Retrieve single public room details
   */
  async getRoomById(hotelId: number, roomId: number): Promise<RoomResponse> {
    const raw = await roomsApi.getRoomById(hotelId, roomId);
    return normalizeRoomResponse(raw, hotelId);
  },

  /**
   * POST /admin/hotels/{hotelId}/room
   * Create a new room in a hotel (Manager / Admin)
   */
  async createRoom(hotelId: number, data: RoomRequest): Promise<RoomResponse> {
    const raw = await adminApi.createRoom(hotelId, data);
    const result = normalizeRoomResponse(raw, hotelId);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_rooms_updated'));
    } catch {}
    return result;
  },

  /**
   * PUT /admin/hotels/{hotelId}/room/{roomId}
   * Update an existing room (Manager / Admin)
   */
  async updateRoom(
    hotelId: number,
    roomId: number,
    data: RoomRequest
  ): Promise<RoomResponse> {
    const raw = await adminApi.updateRoom(hotelId, roomId, data);
    const result = normalizeRoomResponse(raw, hotelId);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_rooms_updated'));
    } catch {}
    return result;
  },

  /**
   * DELETE /admin/hotels/{hotelId}/room/{roomId}
   * Delete room from hotel (Manager / Admin)
   */
  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    await adminApi.deleteRoom(hotelId, roomId);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_rooms_updated'));
    } catch {}
  },

  /**
   * GET /admin/inventory/rooms/{roomId}
   * Retrieve real-time inventory calendar for a room
   */
  async getRoomInventory(roomId: number): Promise<InventoryResponse[]> {
    return inventoryApi.getRoomInventory(roomId);
  },

  /**
   * PATCH /admin/inventory/room/{roomId}
   * Update room inventory (surge factor, closed dates, total count)
   */
  async updateRoomInventory(
    roomId: number,
    data: UpdateInventoryRequest
  ): Promise<InventoryResponse> {
    return inventoryApi.updateRoomInventory(roomId, data);
  },
};
