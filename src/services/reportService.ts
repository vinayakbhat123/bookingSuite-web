import { apiClient } from '../lib/apiClient';
import { HotelReport } from '../types/api';

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
}

export const reportService = {
  /**
   * GET /admin/hotels/{hotelId}/report
   * Get total booking, total revenue, and average revenue for a hotel
   */
  async getHotelReport(
    hotelId: number,
    startDateOrParams?: string | ReportQueryParams,
    endDate?: string
  ): Promise<HotelReport> {
    let params: ReportQueryParams | undefined;
    if (typeof startDateOrParams === 'string') {
      params = { startDate: startDateOrParams, endDate };
    } else {
      params = startDateOrParams;
    }
    const res = await apiClient.get<any, HotelReport>(`/admin/hotels/${hotelId}/report`, {
      params,
    });
    return res;
  },
};
