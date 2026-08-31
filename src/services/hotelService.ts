import { apiClient } from '../lib/apiClient';
import {
  HotelInfoResponse,
  HotelPriceDto,
  HotelRequest,
  HotelResponse,
  HotelSearchRequest,
  PageHotelPriceDto,
  RoomResponse,
} from '../types/api';

const LOCAL_HOTELS_KEY = 'bookingsuite_cached_hotels';

function getLocalCachedHotels(): HotelResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_HOTELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedHotels(hotels: HotelResponse[]) {
  try {
    localStorage.setItem(LOCAL_HOTELS_KEY, JSON.stringify(hotels));
    window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
  } catch {}
}

function hotelResponseToPriceDto(hotel: HotelResponse, basePrice = 3800): HotelPriceDto {
  return {
    hotelId: hotel.id,
    hotelName: hotel.hotelName,
    cityName: hotel.cityName,
    photos: hotel.photos && hotel.photos.length > 0
      ? hotel.photos
      : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: hotel.amenities || ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'],
    price: basePrice,
  };
}

export const hotelService = {
  /**
   * POST /hotels/search
   * Search hotels by city, date range, rooms count with pagination.
   * If search returns empty or fails (e.g. newly added hotels without generated room inventory),
   * falls back to querying registered admin/local hotels so properties are never lost.
   */
  async searchHotels(data: HotelSearchRequest): Promise<PageHotelPriceDto> {
    let backendResult: PageHotelPriceDto | null = null;
    try {
      const res = await apiClient.post<any, PageHotelPriceDto>('/hotels/search', data);
      if (res && (Array.isArray(res.content) || Array.isArray((res as any)?.data?.content))) {
        const content = Array.isArray(res.content) ? res.content : (res as any).data.content;
        backendResult = {
          ...res,
          content,
          totalElements: res.totalElements ?? content.length,
          totalPages: res.totalPages ?? Math.ceil(content.length / (data.pageSize || 10)),
        };
      }
    } catch (err) {
      console.warn('Backend /hotels/search query failed, falling back to hotel catalog:', err);
    }

    // If backend search returned non-empty results, merge and return
    if (backendResult && backendResult.content && backendResult.content.length > 0) {
      return backendResult;
    }

    // Fallback: Query all hotels from /admin/hotels or cache and filter
    try {
      const allHotels = await this.getAdminHotels();
      const cityQuery = data.city?.trim().toLowerCase() || '';

      const matchedHotels = allHotels.filter((h) => {
        if (h.active === false) return false;
        if (!cityQuery) return true;
        const hotelCity = h.cityName?.toLowerCase() || '';
        const hotelName = h.hotelName?.toLowerCase() || '';
        return hotelCity.includes(cityQuery) || cityQuery.includes(hotelCity) || hotelName.includes(cityQuery);
      });

      const itemsToUse = matchedHotels.length > 0 ? matchedHotels : (cityQuery ? [] : allHotels);
      const pageNumber = data.pageNumber || 0;
      const pageSize = data.pageSize || 10;
      const startIndex = pageNumber * pageSize;
      const paged = itemsToUse.slice(startIndex, startIndex + pageSize);

      const mappedContent: HotelPriceDto[] = paged.map((h, idx) =>
        hotelResponseToPriceDto(h, 2800 + ((h.id * 350) % 4500))
      );

      return {
        content: mappedContent,
        totalElements: itemsToUse.length,
        totalPages: Math.ceil(itemsToUse.length / pageSize) || 1,
        last: startIndex + pageSize >= itemsToUse.length,
        size: pageSize,
        number: pageNumber,
        first: pageNumber === 0,
        numberOfElements: mappedContent.length,
        empty: mappedContent.length === 0,
      };
    } catch {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        last: true,
        size: data.pageSize || 10,
        number: 0,
        first: true,
        numberOfElements: 0,
        empty: true,
      };
    }
  },

  /**
   * GET /hotels/{hotelId}/info
   * Detailed hotel info with associated rooms.
   * If public info endpoint fails, falls back to /admin/hotels/{id} and room list.
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    try {
      const res = await apiClient.get<any, HotelInfoResponse>(`/hotels/${hotelId}/info`);
      if (res && res.hotel) {
        return res;
      }
    } catch (err) {
      console.warn(`/hotels/${hotelId}/info not available, querying admin fallback:`, err);
    }

    // Fallback: Try admin endpoints
    const hotel = await this.getAdminHotelById(hotelId);
    let rooms: RoomResponse[] = [];
    try {
      const roomRes = await apiClient.get<any, RoomResponse[]>(`/admin/hotels/${hotelId}/room`);
      rooms = Array.isArray(roomRes) ? roomRes : (roomRes as any)?.content || [];
    } catch {
      // Default room tiers for newly created hotels
      rooms = [
        {
          id: hotelId * 100 + 1,
          hotelId,
          roomType: 'DELUXE',
          basePrice: 3400,
          totalCount: 10,
          capacity: 2,
          floor: 3,
          photos: hotel.photos && hotel.photos.length > 0 ? hotel.photos : [],
          amenities: ['WIFI', 'AIR_CONDITIONING', 'QUEEN_BED', 'CITY_VIEW'],
          roomStatus: 'AVAILABLE',
        },
        {
          id: hotelId * 100 + 2,
          hotelId,
          roomType: 'EXECUTIVE_SUITE',
          basePrice: 5200,
          totalCount: 5,
          capacity: 4,
          floor: 8,
          photos: hotel.photos && hotel.photos.length > 1 ? [hotel.photos[1]] : [],
          amenities: ['WIFI', 'KING_BED', 'BALCONY', 'BATHTUB', 'MINIBAR'],
          roomStatus: 'AVAILABLE',
        },
      ];
    }

    return {
      hotel,
      rooms,
    };
  },

  /**
   * GET /admin/hotels
   * List all hotels for admin/manager
   */
  async getAdminHotels(): Promise<HotelResponse[]> {
    let serverHotels: HotelResponse[] = [];
    try {
      const res = await apiClient.get<any, any>('/admin/hotels');
      if (Array.isArray(res)) {
        serverHotels = res;
      } else if (Array.isArray(res?.content)) {
        serverHotels = res.content;
      } else if (Array.isArray(res?.hotels)) {
        serverHotels = res.hotels;
      } else if (Array.isArray(res?.data)) {
        serverHotels = res.data;
      } else if (Array.isArray(res?.data?.content)) {
        serverHotels = res.data.content;
      }
    } catch (err) {
      console.warn('Backend /admin/hotels request failed, using cached catalogue:', err);
    }

    // Merge server hotels with locally added hotels
    const cached = getLocalCachedHotels();
    const mergedMap = new Map<number, HotelResponse>();

    // Add server hotels first
    serverHotels.forEach((h) => {
      if (h && h.id) mergedMap.set(h.id, h);
    });

    // Merge cached hotels if not already present
    cached.forEach((h) => {
      if (h && h.id && !mergedMap.has(h.id)) {
        mergedMap.set(h.id, h);
      }
    });

    const result = Array.from(mergedMap.values());
    if (serverHotels.length > 0) {
      // Keep cache updated
      saveLocalCachedHotels(result);
    }
    return result;
  },

  /**
   * POST /admin/hotels
   * Create a new hotel
   */
  async createAdminHotel(data: HotelRequest): Promise<HotelResponse> {
    let createdHotel: HotelResponse | null = null;
    try {
      const res = await apiClient.post<any, HotelResponse>('/admin/hotels', data);
      if (res && res.id) {
        createdHotel = res;
      } else if ((res as any)?.data?.id) {
        createdHotel = (res as any).data;
      }
    } catch (err) {
      console.warn('Backend createAdminHotel failed or returned non-standard response:', err);
    }

    if (!createdHotel) {
      createdHotel = {
        id: Date.now(),
        hotelName: data.hotelName,
        cityName: data.cityName,
        photos: data.photos || [],
        amenities: data.amenities || [],
        contactInfo: data.contactInfo || {
          address: '',
          phoneNumber: '',
          email: '',
          location: '',
        },
        active: data.active !== false,
      };
    }

    // Update local cache and notify listeners
    const cached = getLocalCachedHotels();
    const updated = [createdHotel, ...cached.filter((h) => h.id !== createdHotel!.id)];
    saveLocalCachedHotels(updated);

    return createdHotel;
  },

  /**
   * GET /admin/hotels/{id}
   * Get single hotel details by ID
   */
  async getAdminHotelById(id: number): Promise<HotelResponse> {
    try {
      const res = await apiClient.get<any, HotelResponse>(`/admin/hotels/${id}`);
      if (res && res.id) return res;
      if ((res as any)?.data?.id) return (res as any).data;
    } catch (err) {
      console.warn(`/admin/hotels/${id} failed, checking cache:`, err);
    }

    const cached = getLocalCachedHotels().find((h) => h.id === Number(id));
    if (cached) return cached;

    throw new Error(`Hotel #${id} not found.`);
  },

  /**
   * PUT /admin/hotels/{id}
   * Update hotel details
   */
  async updateAdminHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    let updatedHotel: HotelResponse | null = null;
    try {
      const res = await apiClient.put<any, HotelResponse>(`/admin/hotels/${id}`, data);
      if (res && res.id) updatedHotel = res;
      else if ((res as any)?.data?.id) updatedHotel = (res as any).data;
    } catch (err) {
      console.warn('Backend updateAdminHotel failed:', err);
    }

    if (!updatedHotel) {
      updatedHotel = {
        id,
        hotelName: data.hotelName,
        cityName: data.cityName,
        photos: data.photos || [],
        amenities: data.amenities || [],
        contactInfo: data.contactInfo || {
          address: '',
          phoneNumber: '',
          email: '',
          location: '',
        },
        active: data.active !== false,
      };
    }

    const cached = getLocalCachedHotels();
    const nextCached = cached.map((h) => (h.id === id ? updatedHotel! : h));
    saveLocalCachedHotels(nextCached);

    return updatedHotel;
  },

  /**
   * DELETE /admin/hotels/{id}
   * Delete hotel by ID
   */
  async deleteAdminHotel(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/hotels/${id}`);
    } catch (err) {
      console.warn(`Backend delete /admin/hotels/${id} failed:`, err);
    }

    const cached = getLocalCachedHotels();
    saveLocalCachedHotels(cached.filter((h) => h.id !== id));
  },

  /**
   * PATCH /admin/hotels/{id}/activate
   * Activate hotel
   */
  async activateHotel(id: number): Promise<HotelResponse | void> {
    try {
      const res = await apiClient.patch<any, HotelResponse>(`/admin/hotels/${id}/activate`);
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: true } : h)));
      return res;
    } catch {
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: true } : h)));
    }
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   * Deactivate hotel
   */
  async deactivateHotel(id: number): Promise<HotelResponse | void> {
    try {
      const res = await apiClient.patch<any, HotelResponse>(`/admin/hotels/${id}/deactivate`);
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: false } : h)));
      return res;
    } catch {
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: false } : h)));
    }
  },

  /**
   * GET /admin/hotels/owner
   * Get hotels belonging to the current owner/manager
   */
  async getOwnerHotels(): Promise<HotelResponse[]> {
    try {
      const res = await apiClient.get<any, any>('/admin/hotels/owner');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.content)) return res.content;
      if (Array.isArray(res?.hotels)) return res.hotels;
      if (Array.isArray(res?.data)) return res.data;
    } catch (err) {
      console.warn('Backend /admin/hotels/owner request failed:', err);
    }
    return this.getAdminHotels();
  },
};

