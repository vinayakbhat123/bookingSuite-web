import { apiClient } from '../lib/apiClient';
import {
  HotelInfoResponse,
  HotelRequest,
  HotelResponse,
  HotelSearchRequest,
  PageHotelPriceDto,
} from '../types/api';

export const hotelService = {
  /**
   * POST /hotels/search
   * Search hotels by city, date range, rooms count with pagination
   */
  async searchHotels(data: HotelSearchRequest): Promise<PageHotelPriceDto> {
    const res = await apiClient.post<any, PageHotelPriceDto>('/hotels/search', data);
    return res;
  },

  /**
   * GET /hotels/{hotelId}/info
   * Detailed hotel info with associated rooms
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    const res = await apiClient.get<any, HotelInfoResponse>(`/hotels/${hotelId}/info`);
    return res;
  },

  /**
   * GET /admin/hotels
   * List all hotels for admin/manager
   */
  async getAdminHotels(): Promise<HotelResponse[]> {
    const res = await apiClient.get<any, HotelResponse[]>('/admin/hotels');
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * POST /admin/hotels
   * Create a new hotel
   */
  async createAdminHotel(data: HotelRequest): Promise<HotelResponse> {
    const res = await apiClient.post<any, HotelResponse>('/admin/hotels', data);
    return res;
  },

  /**
   * GET /admin/hotels/{id}
   * Get single hotel details by ID
   */
  async getAdminHotelById(id: number): Promise<HotelResponse> {
    const res = await apiClient.get<any, HotelResponse>(`/admin/hotels/${id}`);
    return res;
  },

  /**
   * PUT /admin/hotels/{id}
   * Update hotel details
   */
  async updateAdminHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    const res = await apiClient.put<any, HotelResponse>(`/admin/hotels/${id}`, data);
    return res;
  },

  /**
   * DELETE /admin/hotels/{id}
   * Delete hotel by ID
   */
  async deleteAdminHotel(id: number): Promise<void> {
    await apiClient.delete(`/admin/hotels/${id}`);
  },

  /**
   * PATCH /admin/hotels/{id}/activate
   * Activate hotel
   */
  async activateHotel(id: number): Promise<HotelResponse | void> {
    const res = await apiClient.patch<any, HotelResponse>(`/admin/hotels/${id}/activate`);
    return res;
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   * Deactivate hotel
   */
  async deactivateHotel(id: number): Promise<HotelResponse | void> {
    const res = await apiClient.patch<any, HotelResponse>(`/admin/hotels/${id}/deactivate`);
    return res;
  },

  /**
   * GET /admin/hotels/owner
   * Get hotels belonging to the current owner/manager
   */
  async getOwnerHotels(): Promise<HotelResponse[]> {
    const res = await apiClient.get<any, HotelResponse[]>('/admin/hotels/owner');
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },
};
