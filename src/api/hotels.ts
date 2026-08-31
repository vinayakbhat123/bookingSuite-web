import { apiFetch } from './client';
import {
  HotelInfoResponse,
  HotelResponse,
  HotelSearchRequest,
  PageHotelPriceDto,
} from '../types/api';

export const hotelsApi = {
  /**
   * GET /hotels/allhotels
   * Returns all hotels from the backend catalog (HotelResponse[])
   */
  async getAllHotels(): Promise<HotelResponse[]> {
    const res = await apiFetch<HotelResponse[]>('/hotels/allhotels', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : (res as any)?.content || [];
  },

  /**
   * POST /hotels/search
   * Body: { city, startDate, endDate, roomsCount, pageNumber, pageSize }
   * Returns: { content: [{ hotelId, hotelName, cityName, price }], pageNumber, pageSize, totalElements, totalPages }
   */
  async searchHotels(params: HotelSearchRequest): Promise<PageHotelPriceDto> {
    const res = await apiFetch<PageHotelPriceDto>('/hotels/search', {
      method: 'POST',
      body: JSON.stringify({
        city: params.city,
        startDate: params.startDate,
        endDate: params.endDate,
        roomsCount: params.roomsCount,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      }),
    });
    return res;
  },

  /**
   * GET /hotels/{hotelId}
   * Returns single Hotel details
   */
  async getHotelById(hotelId: number): Promise<HotelResponse> {
    return apiFetch<HotelResponse>(`/hotels/${hotelId}`, {
      method: 'GET',
    });
  },

  /**
   * GET /hotels/{hotelId}/info
   * Returns { hotel: HotelResponse, rooms: RoomResponse[] }
   * Single call used for hotel details page
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    return apiFetch<HotelInfoResponse>(`/hotels/${hotelId}/info`, {
      method: 'GET',
    });
  },
};
