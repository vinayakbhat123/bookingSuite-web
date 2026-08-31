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

export function normalizeHotelResponse(raw: any): HotelResponse {
  if (!raw) {
    return {
      id: 0,
      hotelName: 'Grand Hotel',
      cityName: 'India',
      photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      amenities: ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'],
      contactInfo: { address: '', phoneNumber: '', email: '', location: '' },
      active: true,
    };
  }

  const id = Number(raw.id ?? raw.hotelId ?? 0);
  const hotelName = raw.hotelName || raw.name || raw.title || `Hotel #${id || '1'}`;
  const cityName = raw.cityName || raw.city || raw.location || 'India';

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos.map((p: any) => (typeof p === 'string' ? p : p?.url || p?.photoUrl || '')).filter(Boolean);
  } else if (Array.isArray(raw.images)) {
    photos = raw.images.map((p: any) => (typeof p === 'string' ? p : p?.url || p?.photoUrl || '')).filter(Boolean);
  } else if (Array.isArray(raw.photoUrls)) {
    photos = raw.photoUrls.filter(Boolean);
  } else if (typeof raw.photos === 'string') {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (photos.length === 0) {
    photos = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities.map((a: any) => (typeof a === 'string' ? a : a?.name || a?.amenity || '')).filter(Boolean);
  } else if (Array.isArray(raw.amenityList)) {
    amenities = raw.amenityList.filter(Boolean);
  } else if (typeof raw.amenities === 'string') {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (amenities.length === 0) {
    amenities = ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'];
  }

  const contactInfo = {
    address: raw.contactInfo?.address || raw.address || '',
    phoneNumber: raw.contactInfo?.phoneNumber || raw.contactInfo?.phone || raw.phoneNumber || raw.phone || '',
    email: raw.contactInfo?.email || raw.email || '',
    location: raw.contactInfo?.location || raw.location || '',
  };

  const active = raw.active !== undefined
    ? Boolean(raw.active)
    : (raw.isActive !== undefined ? Boolean(raw.isActive) : (raw.status === 'INACTIVE' ? false : true));

  return {
    id,
    hotelName,
    cityName,
    photos,
    amenities,
    contactInfo,
    active,
  };
}

export function normalizeHotelPriceDto(raw: any, defaultPrice = 3800): HotelPriceDto {
  const hotelId = Number(raw.hotelId ?? raw.id ?? 0);
  const hotelName = raw.hotelName || raw.name || raw.title || `Hotel #${hotelId || '1'}`;
  const cityName = raw.cityName || raw.city || 'India';

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos.map((p: any) => (typeof p === 'string' ? p : p?.url || '')).filter(Boolean);
  } else if (Array.isArray(raw.images)) {
    photos = raw.images.map((p: any) => (typeof p === 'string' ? p : p?.url || '')).filter(Boolean);
  } else if (Array.isArray(raw.photoUrls)) {
    photos = raw.photoUrls.filter(Boolean);
  } else if (typeof raw.photos === 'string') {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (photos.length === 0) {
    photos = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities.map((a: any) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean);
  } else if (typeof raw.amenities === 'string') {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (amenities.length === 0) {
    amenities = ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'];
  }

  const price = Number(raw.price ?? raw.basePrice ?? raw.minPrice ?? defaultPrice);

  return {
    hotelId,
    hotelName,
    cityName,
    photos,
    amenities,
    price,
  };
}

export function normalizeRoomResponse(raw: any, fallbackHotelId = 0): RoomResponse {
  const id = Number(raw.id ?? raw.roomId ?? Date.now());
  const hotelId = Number(raw.hotelId ?? fallbackHotelId);
  const roomType = raw.roomType || 'DELUXE';
  const basePrice = Number(raw.basePrice ?? raw.price ?? 3500);
  const totalCount = Number(raw.totalCount ?? raw.count ?? 10);
  const capacity = Number(raw.capacity ?? raw.maxGuests ?? 2);
  const floor = raw.floor !== undefined ? Number(raw.floor) : 2;

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos.map((p: any) => (typeof p === 'string' ? p : p?.url || '')).filter(Boolean);
  } else if (typeof raw.photos === 'string') {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities.map((a: any) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean);
  } else if (typeof raw.amenities === 'string') {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const roomStatus = raw.roomStatus || raw.status || 'AVAILABLE';

  return {
    id,
    hotelId,
    roomType,
    basePrice,
    totalCount,
    capacity,
    floor,
    photos,
    amenities,
    roomStatus,
  };
}

export const hotelService = {
  /**
   * POST /hotels/search
   * Search hotels by city, date range, rooms count with pagination.
   * Returns paginated hotel results containing hotel ID, hotel name, city name, and price.
   */
  async searchHotels(data: HotelSearchRequest): Promise<PageHotelPriceDto> {
    try {
      const res = await apiClient.post<any, any>('/hotels/search', data);
      const rawContent = res?.content ?? (res as any)?.data?.content ?? (Array.isArray(res) ? res : (Array.isArray((res as any)?.data) ? (res as any).data : null));
      
      if (Array.isArray(rawContent)) {
        const normalizedContent = rawContent.map((item) => normalizeHotelPriceDto(item));
        return {
          content: normalizedContent,
          totalElements: res?.totalElements ?? res?.total ?? normalizedContent.length,
          totalPages: res?.totalPages ?? (Math.ceil(normalizedContent.length / (data.pageSize || 10)) || 1),
          size: data.pageSize || 10,
          number: data.pageNumber || 0,
          last: (data.pageNumber || 0) + 1 >= (res?.totalPages || 1),
          first: (data.pageNumber || 0) === 0,
          numberOfElements: normalizedContent.length,
          empty: normalizedContent.length === 0,
        };
      }
    } catch {
      // If backend search endpoint is not available or returns empty, query catalogue
    }

    const allHotels = await this.getAdminHotels();
    const cityQuery = data.city?.trim().toLowerCase() || '';

    const matchedHotels = allHotels.filter((h) => {
      if (!cityQuery) return true;
      const hotelCity = h.cityName?.toLowerCase() || '';
      const hotelName = h.hotelName?.toLowerCase() || '';
      return hotelCity.includes(cityQuery) || cityQuery.includes(hotelCity) || hotelName.includes(cityQuery);
    });

    const itemsToUse = matchedHotels.length > 0 ? matchedHotels : allHotels;
    const pageNumber = data.pageNumber || 0;
    const pageSize = data.pageSize || 10;
    const startIndex = pageNumber * pageSize;
    const paged = itemsToUse.slice(startIndex, startIndex + pageSize);

    const mappedContent: HotelPriceDto[] = paged.map((h) =>
      normalizeHotelPriceDto(h, 2800 + ((h.id * 350) % 4500))
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
  },

  /**
   * GET /hotels/{hotelId}/info
   * Detailed hotel info with associated rooms.
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    try {
      const res = await apiClient.get<any, any>(`/hotels/${hotelId}/info`);
      if (res) {
        if (res.hotel) {
          const hotel = normalizeHotelResponse(res.hotel);
          const rooms = Array.isArray(res.rooms)
            ? res.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }

        if (res.data?.hotel) {
          const hotel = normalizeHotelResponse(res.data.hotel);
          const rooms = Array.isArray(res.data.rooms)
            ? res.data.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }

        if (res.id || res.hotelId || res.hotelName || res.name) {
          const hotel = normalizeHotelResponse(res);
          const rooms = Array.isArray(res.rooms)
            ? res.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }
      }
    } catch {
      // Fallback: Query admin hotel + room endpoints
    }

    const hotel = await this.getAdminHotelById(hotelId);
    let rooms: RoomResponse[] = [];
    try {
      const roomRes = await apiClient.get<any, any>(`/admin/hotels/${hotelId}/room`);
      const rawRooms = Array.isArray(roomRes)
        ? roomRes
        : (Array.isArray(roomRes?.content) ? roomRes.content : (Array.isArray(roomRes?.data) ? roomRes.data : []));
      rooms = rawRooms.map((r: any) => normalizeRoomResponse(r, hotelId));
    } catch {
      rooms = [];
    }

    return {
      hotel,
      rooms,
    };
  },

  /**
   * GET /admin/hotels
   * List all hotels for admin/manager/catalog directly from backend
   */
  async getAdminHotels(): Promise<HotelResponse[]> {
    const res = await apiClient.get<any, any>('/admin/hotels');
    let rawList: any[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (Array.isArray(res?.content)) {
      rawList = res.content;
    } else if (Array.isArray(res?.data)) {
      rawList = res.data;
    } else if (Array.isArray(res?.hotels)) {
      rawList = res.hotels;
    } else if (Array.isArray(res?.data?.content)) {
      rawList = res.data.content;
    } else if (res && typeof res === 'object' && (res.id || res.hotelName || res.name)) {
      rawList = [res];
    }
    return rawList.map(normalizeHotelResponse);
  },

  /**
   * POST /admin/hotels
   * Create a new hotel
   */
  async createAdminHotel(data: HotelRequest): Promise<HotelResponse> {
    const res = await apiClient.post<any, any>('/admin/hotels', data);
    const raw = res?.data || res;
    return normalizeHotelResponse(raw || data);
  },

  /**
   * GET /admin/hotels/{id}
   * Get single hotel details by ID
   */
  async getAdminHotelById(id: number): Promise<HotelResponse> {
    const res = await apiClient.get<any, any>(`/admin/hotels/${id}`);
    const raw = res?.data || res;
    return normalizeHotelResponse(raw);
  },

  /**
   * PUT /admin/hotels/{id}
   * Update hotel details
   */
  async updateAdminHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    const res = await apiClient.put<any, any>(`/admin/hotels/${id}`, data);
    const raw = res?.data || res;
    return normalizeHotelResponse(raw || { id, ...data });
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
   * Activate hotel (one-time activation)
   */
  async activateHotel(id: number): Promise<HotelResponse | void> {
    const res = await apiClient.patch<any, any>(`/admin/hotels/${id}/activate`);
    return res ? normalizeHotelResponse(res?.data || res) : undefined;
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   * Deactivate hotel
   */
  async deactivateHotel(id: number): Promise<HotelResponse | void> {
    const res = await apiClient.patch<any, any>(`/admin/hotels/${id}/deactivate`);
    return res ? normalizeHotelResponse(res?.data || res) : undefined;
  },

  /**
   * GET /admin/hotels/owner
   * Get hotels belonging to the current owner/manager
   */
  async getOwnerHotels(): Promise<HotelResponse[]> {
    const res = await apiClient.get<any, any>('/admin/hotels/owner');
    let rawList: any[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (Array.isArray(res?.content)) {
      rawList = res.content;
    } else if (Array.isArray(res?.data)) {
      rawList = res.data;
    } else if (Array.isArray(res?.hotels)) {
      rawList = res.hotels;
    } else if (Array.isArray(res?.data?.content)) {
      rawList = res.data.content;
    } else if (res && typeof res === 'object' && (res.id || res.hotelName || res.name)) {
      rawList = [res];
    }
    return rawList.map(normalizeHotelResponse);
  },
};


