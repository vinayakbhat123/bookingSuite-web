import { adminApi } from '../api';
import { HotelReport } from '../types/api';

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
}

export const reportService = {
  /**
   * GET /admin/hotels/{hotelId}/report?startDate=&endDate=
   * Returns: { TotalBooking, TotalRevenue, AverageRevenue }
   */
  async getHotelReport(
    hotelId: number,
    startDateOrParams?: string | ReportQueryParams,
    endDate?: string
  ): Promise<HotelReport> {
    let startDate: string | undefined;
    let end: string | undefined;

    if (typeof startDateOrParams === 'string') {
      startDate = startDateOrParams;
      end = endDate;
    } else if (startDateOrParams) {
      startDate = startDateOrParams.startDate;
      end = startDateOrParams.endDate;
    }

    return adminApi.getHotelReport(hotelId, startDate, end);
  },
};
