import { apiFetch } from './client';
import { InventoryResponse, UpdateInventoryRequest } from '../types/api';

export const inventoryApi = {
  /**
   * GET /admin/inventory/rooms/{roomId}
   * Returns InventoryResponse[] (unwrapped from { success, message, data: [...], timestamp })
   */
  async getRoomInventory(roomId: number): Promise<InventoryResponse[]> {
    const res = await apiFetch<InventoryResponse[]>(`/admin/inventory/rooms/${roomId}`, {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * PATCH /admin/inventory/room/{roomId}
   * Body: { startDate, endDate, closed, surgeFactor }
   */
  async updateRoomInventory(roomId: number, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    return apiFetch<InventoryResponse>(`/admin/inventory/room/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
