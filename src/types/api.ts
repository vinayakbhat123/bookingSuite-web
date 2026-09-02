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

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// Standard Backend Response Envelope
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  error?: string;
  status?: number;
}

// HOTEL CONTRACTS
export interface HotelContactInfo {
  address: string;
  phoneNumber: string;
  email: string;
  location?: string;
}

export type HotelContactRequest = HotelContactInfo;

export interface HotelRequest {
  id?: number;
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

export type Hotel = HotelResponse;

export interface RoomDetailDto {
  id: number;
  roomType: string;
  basePrice: number;
  capacity: number;
  floor?: number;
  photos: string[];
  amenities: string[];
}

export interface HotelDetailResponse {
  hotelId: number;
  hotelName: string;
  cityName: string;
  address: string;
  photos: string[];
  amenities: string[];
  calculatedTotalPrice: number;
  rooms: RoomDetailDto[];
}

export interface HotelInfoResponse {
  hotel: HotelResponse;
  rooms: RoomResponse[];
}

// SEARCH CONTRACTS
export interface HotelSearchRequest {
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  roomsCount: number;
  pageNumber?: number;
  pageSize?: number;
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
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
  size?: number;
  number?: number;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export type HotelSearchResponse = PageHotelPriceDto;

// ROOM CONTRACTS
export interface RoomRequest {
  id?: number;
  roomType: RoomType | string;
  basePrice: number;
  totalCount: number;
  floor: number;
  capacity: number;
  status?: RoomStatus | string;
  roomStatus?: RoomStatus | string;
  photos?: string[];
  amenities?: string[];
}

export interface RoomResponse {
  id: number;
  hotelId: number;
  roomNumber?: string;
  roomType: RoomType | string;
  basePrice: number;
  totalCount: number;
  floor: number;
  capacity: number;
  photos: string[];
  amenities: string[];
  status?: RoomStatus | string;
  roomStatus?: RoomStatus | string;
}

export type Room = RoomResponse;

// INVENTORY CONTRACTS
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
  closed?: boolean;
  surgeFactor?: number;
  totalCount?: number;
  date?: string;
  price?: number;
}

// REPORT CONTRACTS
export interface HotelReport {
  TotalBooking?: number;
  TotalRevenue?: number;
  AverageRevenue?: number;
  totalBooking?: number;
  totalBookings?: number;
  totalRevenue?: number;
  averageRevenue?: number;
}

// BOOKING CONTRACTS
export interface GuestRequest {
  id?: number;
  name: string;
  gender: Gender | string;
  age: number;
}

export type GuestResponse = GuestRequest;

export interface BookingRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomsCount: number;
}

export interface BookingResponse {
  id: number;
  bookingId?: number;
  hotelId?: number;
  hotelName?: string;
  cityName?: string;
  roomId?: number;
  roomType?: RoomType | string;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
  status: BookingStatus | string;
  bookingStatus?: BookingStatus | string;
  guests: GuestRequest[];
  price?: number;
  amount?: number;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  stripeSessionId?: string;
  paymentSessionUrl?: string;
  hotel?: HotelResponse;
  room?: RoomResponse;
}

// USER CONTRACTS
export interface UserProfileRequest {
  name: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender | string;
  bio?: string;
}

export interface UserProfileResponse {
  name: string;
  email: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender | string;
  bio?: string;
}

export interface UserResponse {
  id?: number;
  name: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender | string;
  bio?: string;
  roles?: Role[];
  role?: Role;
  createdAt?: string;
}

// AUTH CONTRACTS
export interface SignupRequest {
  name: string;
  email: string;
  password?: string;
  roles?: Role[];
}

export interface AuthResponse {
  id?: number;
  name?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string;
}

export interface LoginResponse {
  AccessToken: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserResponse;
  roles?: Role[];
}
