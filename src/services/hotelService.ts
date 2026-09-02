import { adminApi, hotelsApi } from '../api';
import {
  HotelInfoResponse,
  HotelPriceDto,
  HotelRequest,
  HotelResponse,
  HotelSearchRequest,
  PageHotelPriceDto,
  RoomResponse,
} from '../types/api';

function parseBoolean(val: any): boolean | null {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  return null;
}

/**
 * Clean data normalizer for HotelResponse from the backend
 */
export function normalizeHotelResponse(raw: any): HotelResponse {
  if (!raw) {
    return {
      id: 0,
      hotelName: '',
      cityName: '',
      photos: [],
      amenities: [],
      contactInfo: { address: '', phoneNumber: '', email: '', location: '' },
      active: false,
    };
  }

  const id = Number(raw.id ?? raw.hotelId ?? 0);
  const hotelName = raw.hotelName ?? raw.name ?? raw.title ?? '';
  const cityName = raw.cityName ?? raw.city ?? raw.location ?? '';

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos
      .map((p: any) => (typeof p === 'string' ? p : p?.url || p?.photoUrl || ''))
      .filter(Boolean);
  } else if (Array.isArray(raw.images)) {
    photos = raw.images
      .map((p: any) => (typeof p === 'string' ? p : p?.url || p?.photoUrl || ''))
      .filter(Boolean);
  } else if (Array.isArray(raw.photoUrls)) {
    photos = raw.photoUrls.filter(Boolean);
  } else if (typeof raw.photos === 'string' && raw.photos.trim()) {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities
      .map((a: any) => (typeof a === 'string' ? a : a?.name || a?.amenity || ''))
      .filter(Boolean);
  } else if (Array.isArray(raw.amenityList)) {
    amenities = raw.amenityList.filter(Boolean);
  } else if (typeof raw.amenities === 'string' && raw.amenities.trim()) {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const contactInfo = {
    address: raw.contactInfo?.address ?? raw.address ?? '',
    phoneNumber:
      raw.contactInfo?.phoneNumber ??
      raw.contactInfo?.phone ??
      raw.phoneNumber ??
      raw.phone ??
      '',
    email: raw.contactInfo?.email ?? raw.email ?? '',
    location: raw.contactInfo?.location ?? raw.location ?? '',
  };

  let active = false;
  const directActive =
    parseBoolean(raw.active) ??
    parseBoolean(raw.isActive) ??
    parseBoolean(raw.isActivated) ??
    parseBoolean(raw.activated) ??
    parseBoolean(raw.enabled);

  if (directActive !== null) {
    active = directActive;
  } else if (typeof raw.status === 'string') {
    const s = raw.status.toUpperCase();
    if (s === 'ACTIVE' || s === 'ACTIVATED' || s === 'AVAILABLE') active = true;
    else if (s === 'INACTIVE' || s === 'DEACTIVATED' || s === 'DISABLED' || s === 'PENDING') active = false;
  } else if (typeof raw.hotelStatus === 'string') {
    const s = raw.hotelStatus.toUpperCase();
    if (s === 'ACTIVE' || s === 'ACTIVATED' || s === 'AVAILABLE') active = true;
    else if (s === 'INACTIVE' || s === 'DEACTIVATED' || s === 'DISABLED' || s === 'PENDING') active = false;
  }

  return {
    id,
    hotelName,
    cityName,
    photos,
    amenities,
    contactInfo,
    active,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Normalizer for Search Result DTOs
 */
export function normalizeHotelPriceDto(raw: any): HotelPriceDto {
  const hotelId = Number(raw.hotelId ?? raw.id ?? 0);
  const hotelName = raw.hotelName ?? raw.name ?? raw.title ?? '';
  const cityName = raw.cityName ?? raw.city ?? '';

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos
      .map((p: any) => (typeof p === 'string' ? p : p?.url || ''))
      .filter(Boolean);
  } else if (Array.isArray(raw.images)) {
    photos = raw.images
      .map((p: any) => (typeof p === 'string' ? p : p?.url || ''))
      .filter(Boolean);
  } else if (Array.isArray(raw.photoUrls)) {
    photos = raw.photoUrls.filter(Boolean);
  } else if (typeof raw.photos === 'string' && raw.photos.trim()) {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities
      .map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
      .filter(Boolean);
  } else if (typeof raw.amenities === 'string' && raw.amenities.trim()) {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const price = Number(raw.price ?? raw.basePrice ?? raw.minPrice ?? 0);

  return {
    hotelId,
    hotelName,
    cityName,
    photos,
    amenities,
    price,
  };
}

/**
 * Normalizer for Room Response DTOs
 */
export function normalizeRoomResponse(raw: any, fallbackHotelId = 0): RoomResponse {
  const id = Number(raw.id ?? raw.roomId ?? 0);
  const hotelId = Number(raw.hotelId ?? fallbackHotelId);
  const roomNumber = raw.roomNumber ?? raw.number ?? '';
  const roomType = raw.roomType || 'DOUBLE';
  const basePrice = Number(raw.basePrice ?? raw.price ?? 0);
  const totalCount = Number(raw.totalCount ?? raw.count ?? 1);
  const capacity = Number(raw.capacity ?? raw.maxGuests ?? 2);
  const floor = raw.floor !== undefined ? Number(raw.floor) : 1;

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos
      .map((p: any) => (typeof p === 'string' ? p : p?.url || ''))
      .filter(Boolean);
  } else if (typeof raw.photos === 'string' && raw.photos.trim()) {
    photos = raw.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let amenities: string[] = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities
      .map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
      .filter(Boolean);
  } else if (typeof raw.amenities === 'string' && raw.amenities.trim()) {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const roomStatus = raw.roomStatus || raw.status || 'AVAILABLE';

  return {
    id,
    hotelId,
    roomNumber,
    roomType,
    basePrice,
    totalCount,
    capacity,
    floor,
    photos,
    amenities,
    roomStatus,
    status: roomStatus,
  };
}

export const hotelService = {
  /**
   * GET /hotels/allhotels
   * Returns all registered hotels in the public catalog
   */
  async getAllHotels(): Promise<HotelResponse[]> {
    const data = await hotelsApi.getAllHotels();
    return data.map(normalizeHotelResponse);
  },

  /**
   * POST /hotels/search
   * Body: { city, startDate, endDate, roomsCount, pageNumber, pageSize }
   * Returns: { content: HotelPriceDto[], pageNumber, pageSize, totalElements, totalPages }
   */
  async searchHotels(params: HotelSearchRequest, signal?: AbortSignal): Promise<PageHotelPriceDto> {
    const res = await hotelsApi.searchHotels(params, signal);
    const content = (res?.content || []).map(normalizeHotelPriceDto);
    return {
      content,
      pageNumber: res?.pageNumber ?? params.pageNumber ?? 0,
      pageSize: res?.pageSize ?? params.pageSize ?? 20,
      totalElements: res?.totalElements ?? content.length,
      totalPages: res?.totalPages ?? Math.ceil((res?.totalElements ?? content.length) / (params.pageSize || 20)),
      last: res?.last ?? true,
      first: res?.first ?? true,
      size: res?.size ?? params.pageSize,
      number: res?.number ?? params.pageNumber,
      numberOfElements: res?.numberOfElements ?? content.length,
      empty: res?.empty ?? content.length === 0,
    };
  },

  /**
   * GET /hotels/{hotelId}
   * Retrieve single hotel profile
   */
  async getHotelById(hotelId: number): Promise<HotelResponse> {
    const raw = await hotelsApi.getHotelById(hotelId);
    return normalizeHotelResponse(raw);
  },

  /**
   * GET /hotels/{hotelId}/info
   * Retrieve hotel and its rooms in a single unified call
   */
  async getHotelInfo(hotelId: number): Promise<HotelInfoResponse> {
    const raw = await hotelsApi.getHotelInfo(hotelId);
    return {
      hotel: normalizeHotelResponse(raw.hotel || raw),
      rooms: (raw.rooms || []).map((r) => normalizeRoomResponse(r, hotelId)),
    };
  },

  /**
   * GET /hotels/{hotelId}/details?startDate={startDate}&endDate={endDate}
   * Retrieve dynamic date-based stay pricing and room availability from backend
   */
  async getHotelDetailsWithPricing(
    hotelId: number,
    startDate: string,
    endDate: string
  ): Promise<import('../types/api').HotelDetailResponse> {
    const raw = await hotelsApi.getHotelDetails(hotelId, startDate, endDate);
    return {
      hotelId: Number(raw?.hotelId || hotelId),
      hotelName: raw?.hotelName || '',
      cityName: raw?.cityName || '',
      address: raw?.address || '',
      photos: Array.isArray(raw?.photos) ? raw.photos : [],
      amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
      calculatedTotalPrice: Number(raw?.calculatedTotalPrice || 0),
      rooms: Array.isArray(raw?.rooms) ? raw.rooms : [],
    };
  },

  /**
   * POST /admin/hotels
   * Create a new hotel
   */
  async createHotel(data: HotelRequest): Promise<HotelResponse> {
    const raw = await adminApi.createHotel(data);
    const result = normalizeHotelResponse(raw);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
    } catch {}
    return result;
  },

  /**
   * PUT /admin/hotels/{id}
   * Update hotel details
   */
  async updateHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    const raw = await adminApi.updateHotel(id, data);
    const result = normalizeHotelResponse(raw);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
    } catch {}
    return result;
  },

  /**
   * DELETE /admin/hotels/{id}
   * Delete a hotel
   */
  async deleteHotel(id: number): Promise<void> {
    await adminApi.deleteHotel(id);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
    } catch {}
  },

  /**
   * PATCH /admin/hotels/{id}/activate
   */
  async activateHotel(id: number): Promise<HotelResponse> {
    const raw = await adminApi.activateHotel(id);
    let result: HotelResponse;
    if (raw && typeof raw === 'object' && (raw.id || raw.hotelName)) {
      result = normalizeHotelResponse(raw);
    } else {
      result = {
        id,
        hotelName: '',
        cityName: '',
        photos: [],
        amenities: [],
        contactInfo: { address: '', phoneNumber: '', email: '', location: '' },
        active: true,
      };
    }
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
    } catch {}
    return result;
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   */
  async deactivateHotel(id: number): Promise<HotelResponse> {
    const raw = await adminApi.deactivateHotel(id);
    const result = normalizeHotelResponse(raw);
    try {
      window.dispatchEvent(new CustomEvent('bookingsuite_hotels_updated'));
    } catch {}
    return result;
  },

  /**
   * GET /hotels/allhotels & /admin/hotels/owner
   * Catalog used across Admin Dashboard and Manager Pages
   */
  async getAdminHotels(): Promise<HotelResponse[]> {
    try {
      const ownerList = await adminApi.getOwnerHotels();
      if (Array.isArray(ownerList) && ownerList.length > 0) {
        return ownerList.map(normalizeHotelResponse);
      }
    } catch {}
    return this.getAllHotels();
  },

  /**
   * GET /admin/hotels/owner
   * Get hotels owned by logged-in manager/admin
   */
  async getOwnerHotels(): Promise<HotelResponse[]> {
    try {
      const list = await adminApi.getOwnerHotels();
      return Array.isArray(list) ? list.map(normalizeHotelResponse) : [];
    } catch {
      return [];
    }
  },

  async getAdminHotelById(id: number): Promise<HotelResponse> {
    return this.getHotelById(id);
  },

  async createAdminHotel(data: HotelRequest): Promise<HotelResponse> {
    return this.createHotel(data);
  },

  async updateAdminHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    return this.updateHotel(id, data);
  },

  async deleteAdminHotel(id: number): Promise<void> {
    return this.deleteHotel(id);
  },
};
