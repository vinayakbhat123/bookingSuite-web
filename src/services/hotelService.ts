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
      active: true,
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

  const active =
    raw.active !== undefined
      ? Boolean(raw.active)
      : raw.isActive !== undefined
      ? Boolean(raw.isActive)
      : raw.status === 'INACTIVE'
      ? false
      : true;

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
  async searchHotels(params: HotelSearchRequest): Promise<PageHotelPriceDto> {
    const res = await hotelsApi.searchHotels(params);
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
   * POST /admin/hotels
   * Create a new hotel
   */
  async createHotel(data: HotelRequest): Promise<HotelResponse> {
    const raw = await adminApi.createHotel(data);
    return normalizeHotelResponse(raw);
  },

  /**
   * PUT /admin/hotels/{id}
   * Update hotel details
   */
  async updateHotel(id: number, data: HotelRequest): Promise<HotelResponse> {
    const raw = await adminApi.updateHotel(id, data);
    return normalizeHotelResponse(raw);
  },

  /**
   * DELETE /admin/hotels/{id}
   * Delete a hotel
   */
  async deleteHotel(id: number): Promise<void> {
    return adminApi.deleteHotel(id);
  },

  /**
   * PATCH /admin/hotels/{id}/activate
   */
  async activateHotel(id: number): Promise<HotelResponse> {
    const raw = await adminApi.activateHotel(id);
    return normalizeHotelResponse(raw);
  },

  /**
   * PATCH /admin/hotels/{id}/deactivate
   */
  async deactivateHotel(id: number): Promise<HotelResponse> {
    const raw = await adminApi.deactivateHotel(id);
    return normalizeHotelResponse(raw);
  },

  /**
   * GET /admin/hotels/owner
   * Get hotels owned by logged-in manager/admin
   */
  async getAdminHotels(): Promise<HotelResponse[]> {
    const list = await adminApi.getOwnerHotels();
    return list.map(normalizeHotelResponse);
  },

  async getOwnerHotels(): Promise<HotelResponse[]> {
    return this.getAdminHotels();
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
