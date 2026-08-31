export type Role = 'GUEST' | 'HOTEL_MANAGER' | 'ADMIN' | 'SUPPORT' | 'OWNER';

export type BookingStatus =
  | 'PAYMENTS_PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'GUESTS_ADDED'
  | 'RESERVED'
  | 'EXPIRED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_SHOW';

export type RoomType =
  | 'SINGLE'
  | 'DOUBLE'
  | 'STANDARD_QUEEN'
  | 'DELUXE'
  | 'EXECUTIVE_SUITE'
  | 'FAMILY_TWIN'
  | 'PRESIDENTIAL_PENTHOUSE';

export type RoomStatus =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  error?: string;
  status?: number;
}

export interface HotelContactInfo {
  address: string;
  phoneNumber: string;
  email: string;
  location?: string;
}

export interface HotelRequest {
  hotelName: string;
  cityName: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
  active?: boolean;
}

export interface HotelResponse {
  id: number;
  hotelName: string;
  cityName: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomRequest {
  roomType: RoomType;
  basePrice: number;
  totalCount: number;
  capacity: number;
  floor?: number;
  roomStatus?: RoomStatus;
  status?: RoomStatus;
  photos?: string[];
  amenities?: string[];
}

export interface RoomResponse {
  id: number;
  hotelId?: number;
  roomType: RoomType;
  basePrice: number;
  totalCount: number;
  capacity: number;
  floor?: number;
  roomStatus: RoomStatus;
  status?: RoomStatus;
  photos: string[];
  amenities: string[];
}

export interface HotelInfoResponse {
  hotel: HotelResponse;
  rooms: RoomResponse[];
}

export interface HotelSearchRequest {
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  roomsCount: number;
  pageNumber: number;
  pageSize: number;
  dateRangeValid?: boolean;
}

export interface HotelPriceDto {
  hotelId: number;
  hotelName: string;
  cityName: string;
  price: number;
  photos?: string[];
  amenities?: string[];
}

export interface PageHotelPriceDto {
  content: HotelPriceDto[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface BookingRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
}

export interface GuestRequest {
  name: string;
  gender: string;
  age: number;
}

export interface BookingResponse {
  id: number;
  bookingId?: number;
  hotelId?: number;
  hotelName?: string;
  roomId?: number;
  roomType?: RoomType;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
  amount?: number;
  totalAmount?: number;
  bookingStatus: BookingStatus;
  guests?: GuestRequest[];
  createdAt?: string;
  paymentSessionUrl?: string;
  hotel?: HotelResponse;
  room?: RoomResponse;
}

export interface InventoryResponse {
  id?: number;
  roomId?: number;
  date: string;
  bookedCount: number;
  reservedCount: number;
  totalCount: number;
  surgeFactor: number;
  price: number;
  closed: boolean;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InventoryDto = InventoryResponse;

export interface UpdateInventoryRequest {
  startDate?: string;
  endDate?: string;
  date?: string;
  totalCount?: number;
  surgeFactor?: number;
  closed?: boolean;
}

export interface HotelReport {
  TotalBooking?: number;
  totalBookings?: number;
  totalBooking?: number;
  TotalRevenue?: number;
  totalRevenue?: number;
  AverageRevenue?: number;
  averageRevenue?: number;
}

export interface UserProfileRequest {
  name: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
  roles?: Role[];
  role?: Role;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password?: string;
  roles?: Role[];
}

export interface LoginResponse {
  AccessToken: string;
  refreshToken?: string;
  user?: UserResponse;
  roles?: Role[];
}
