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

function getLocalCachedHotels(): HotelResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_HOTELS_KEY);
    return raw ? JSON.parse(raw).map(normalizeHotelResponse) : [];
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

export const hotelService = {
  /**
   * POST /hotels/search
   * Search hotels by city, date range, rooms count with pagination.
   * Returns paginated hotel results containing hotel ID, hotel name, city name, and price.
   */
  async searchHotels(data: HotelSearchRequest): Promise<PageHotelPriceDto> {
    let backendResult: PageHotelPriceDto | null = null;
    try {
      const res = await apiClient.post<any, any>('/hotels/search', data);
      const rawContent = res?.content ?? (res as any)?.data?.content ?? (Array.isArray(res) ? res : (Array.isArray((res as any)?.data) ? (res as any).data : null));
      
      if (Array.isArray(rawContent)) {
        const normalizedContent = rawContent.map((item) => normalizeHotelPriceDto(item));
        backendResult = {
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
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    try {
      const res = await apiClient.get<any, any>(`/hotels/${hotelId}/info`);
      if (res) {
        // Case 1: Wrapped { hotel: HotelResponse, rooms: RoomResponse[] }
        if (res.hotel) {
          const hotel = normalizeHotelResponse(res.hotel);
          const rooms = Array.isArray(res.rooms)
            ? res.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }

        // Case 2: Wrapped { data: { hotel, rooms } }
        if (res.data?.hotel) {
          const hotel = normalizeHotelResponse(res.data.hotel);
          const rooms = Array.isArray(res.data.rooms)
            ? res.data.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }

        // Case 3: Flat { id, hotelName, cityName, ..., rooms: [...] }
        if (res.id || res.hotelId || res.hotelName || res.name) {
          const hotel = normalizeHotelResponse(res);
          const rooms = Array.isArray(res.rooms)
            ? res.rooms.map((r: any) => normalizeRoomResponse(r, hotelId))
            : [];
          return { hotel, rooms };
        }
      }
    } catch (err) {
      console.warn(`/hotels/${hotelId}/info endpoint failed, querying admin fallback:`, err);
    }

    // Fallback: Query admin endpoints
    const hotel = await this.getAdminHotelById(hotelId);
    let rooms: RoomResponse[] = [];
    try {
      const roomRes = await apiClient.get<any, any>(`/admin/hotels/${hotelId}/room`);
      const rawRooms = Array.isArray(roomRes)
        ? roomRes
        : (Array.isArray(roomRes?.content) ? roomRes.content : (Array.isArray(roomRes?.data) ? roomRes.data : []));
      rooms = rawRooms.map((r: any) => normalizeRoomResponse(r, hotelId));
    } catch {
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
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (Array.isArray(res?.content)) {
        rawList = res.content;
      } else if (Array.isArray(res?.hotels)) {
        rawList = res.hotels;
      } else if (Array.isArray(res?.data)) {
        rawList = res.data;
      } else if (Array.isArray(res?.data?.content)) {
        rawList = res.data.content;
      }
      serverHotels = rawList.map(normalizeHotelResponse);
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
      const res = await apiClient.post<any, any>('/admin/hotels', data);
      const raw = res?.data || res;
      if (raw && (raw.id || raw.hotelId || raw.hotelName || raw.name)) {
        createdHotel = normalizeHotelResponse(raw);
      }
    } catch (err) {
      console.warn('Backend createAdminHotel failed or returned non-standard response:', err);
    }

    if (!createdHotel) {
      createdHotel = {
        id: Date.now(),
        hotelName: data.hotelName,
        cityName: data.cityName,
        photos: data.photos || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        amenities: data.amenities || ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'],
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
      const res = await apiClient.get<any, any>(`/admin/hotels/${id}`);
      const raw = res?.data || res;
      if (raw && (raw.id || raw.hotelId || raw.hotelName || raw.name)) {
        return normalizeHotelResponse(raw);
      }
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
      const res = await apiClient.put<any, any>(`/admin/hotels/${id}`, data);
      const raw = res?.data || res;
      if (raw && (raw.id || raw.hotelId || raw.hotelName || raw.name)) {
        updatedHotel = normalizeHotelResponse(raw);
      }
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
   * Activate hotel (one-time activation)
   */
  async activateHotel(id: number): Promise<HotelResponse | void> {
    try {
      const res = await apiClient.patch<any, any>(`/admin/hotels/${id}/activate`);
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: true } : h)));
      return res ? normalizeHotelResponse(res?.data || res) : undefined;
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
      const res = await apiClient.patch<any, any>(`/admin/hotels/${id}/deactivate`);
      const cached = getLocalCachedHotels();
      saveLocalCachedHotels(cached.map((h) => (h.id === id ? { ...h, active: false } : h)));
      return res ? normalizeHotelResponse(res?.data || res) : undefined;
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
      let rawList: any[] = [];
      if (Array.isArray(res)) rawList = res;
      else if (Array.isArray(res?.content)) rawList = res.content;
      else if (Array.isArray(res?.hotels)) rawList = res.hotels;
      else if (Array.isArray(res?.data)) rawList = res.data;
      else if (Array.isArray(res?.data?.content)) rawList = res.data.content;
      
      if (rawList.length > 0) {
        return rawList.map(normalizeHotelResponse);
      }
    } catch (err) {
      console.warn('Backend /admin/hotels/owner request failed:', err);
    }
    return this.getAdminHotels();
  },
};


