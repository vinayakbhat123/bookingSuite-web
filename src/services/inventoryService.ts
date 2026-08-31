import { apiClient } from '../lib/apiClient';
import { InventoryResponse, UpdateInventoryRequest } from '../types/api';

export const inventoryService = {
  /**
   * GET /admin/inventory/rooms/{roomId}
   * Retrieve inventory timeline for a given room
   */
  async getRoomInventory(roomId: number): Promise<InventoryResponse[]> {
    const res = await apiClient.get<any, InventoryResponse[]>(`/admin/inventory/rooms/${roomId}`);
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * PATCH /admin/inventory/room/{roomId}
   * Update room inventory parameters (totalCount, surgeFactor, closed, date)
   */
  async updateRoomInventory(roomId: number, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    const res = await apiClient.patch<any, InventoryResponse>(`/admin/inventory/room/${roomId}`, data);
    return res;
  },
};
