import { inventoryApi } from '../api';
import { InventoryResponse, UpdateInventoryRequest } from '../types/api';

export const inventoryService = {
  /**
   * GET /admin/inventory/rooms/{roomId}
   */
  async getRoomInventory(roomId: number): Promise<InventoryResponse[]> {
    return inventoryApi.getRoomInventory(roomId);
  },

  /**
   * PATCH /admin/inventory/room/{roomId}
   */
  async updateRoomInventory(
    roomId: number,
    data: UpdateInventoryRequest
  ): Promise<InventoryResponse> {
    return inventoryApi.updateRoomInventory(roomId, data);
  },
};
