import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { adminApi } from './admin';
import { authApi } from './auth';
import { bookingsApi } from './bookings';
import { hotelsApi } from './hotels';
import { inventoryApi } from './inventory';
import { roomsApi } from './rooms';
import { userApi } from './user';
import {
  BookingRequest,
  BookingResponse,
  GuestRequest,
  HotelInfoResponse,
  HotelReport,
  HotelRequest,
  HotelResponse,
  HotelSearchRequest,
  InventoryResponse,
  PageHotelPriceDto,
  RoomRequest,
  RoomResponse,
  UpdateInventoryRequest,
  UserProfileRequest,
  UserResponse,
} from '../types/api';

// QUERY KEYS
export const queryKeys = {
  hotels: ['hotels'] as const,
  hotel: (id: number | string) => ['hotel', Number(id)] as const,
  hotelInfo: (id: number | string) => ['hotel', Number(id), 'info'] as const,
  ownerHotels: ['hotels', 'owner'] as const,
  hotelSearch: (params: HotelSearchRequest) => ['hotels', 'search', params] as const,
  rooms: (hotelId: number | string) => ['rooms', Number(hotelId)] as const,
  room: (hotelId: number | string, roomId: number | string) =>
    ['rooms', Number(hotelId), Number(roomId)] as const,
  inventory: (roomId: number | string) => ['inventory', Number(roomId)] as const,
  bookings: ['bookings'] as const,
  hotelBookings: (hotelId: number | string) => ['bookings', 'hotel', Number(hotelId)] as const,
  user: ['user', 'me'] as const,
  hotelReport: (hotelId: number | string, startDate?: string, endDate?: string) =>
    ['hotel', Number(hotelId), 'report', startDate, endDate] as const,
};

// ==================== HOTEL HOOKS ====================

/**
 * Fetch all hotels: key ['hotels']
 */
export function useHotels(options?: Partial<UseQueryOptions<HotelResponse[], Error>>) {
  return useQuery<HotelResponse[], Error>({
    queryKey: queryKeys.hotels,
    queryFn: () => hotelsApi.getAllHotels(),
    ...options,
  });
}

/**
 * Fetch single hotel: key ['hotel', id]
 */
export function useHotel(
  hotelId: number | string,
  options?: Partial<UseQueryOptions<HotelResponse, Error>>
) {
  const idNum = Number(hotelId);
  return useQuery<HotelResponse, Error>({
    queryKey: queryKeys.hotel(idNum),
    queryFn: () => hotelsApi.getHotelById(idNum),
    enabled: Boolean(idNum && idNum > 0),
    ...options,
  });
}

/**
 * Fetch single hotel info (hotel + rooms): key ['hotel', id, 'info']
 */
export function useHotelInfo(
  hotelId: number | string,
  options?: Partial<UseQueryOptions<HotelInfoResponse, Error>>
) {
  const idNum = Number(hotelId);
  return useQuery<HotelInfoResponse, Error>({
    queryKey: queryKeys.hotelInfo(idNum),
    queryFn: () => hotelsApi.getHotelInfo(idNum),
    enabled: Boolean(idNum && idNum > 0),
    ...options,
  });
}

/**
 * Search hotels with pagination
 */
export function useHotelSearch(
  params: HotelSearchRequest,
  options?: Partial<UseQueryOptions<PageHotelPriceDto, Error>>
) {
  return useQuery<PageHotelPriceDto, Error>({
    queryKey: queryKeys.hotelSearch(params),
    queryFn: () => hotelsApi.searchHotels(params),
    ...options,
  });
}

/**
 * Fetch hotels owned by admin
 */
export function useOwnerHotels(options?: Partial<UseQueryOptions<HotelResponse[], Error>>) {
  return useQuery<HotelResponse[], Error>({
    queryKey: queryKeys.ownerHotels,
    queryFn: () => adminApi.getOwnerHotels(),
    ...options,
  });
}

// ==================== ROOM HOOKS ====================

/**
 * Fetch rooms for hotel: key ['rooms', hotelId]
 */
export function useRooms(
  hotelId: number | string,
  options?: Partial<UseQueryOptions<RoomResponse[], Error>>
) {
  const idNum = Number(hotelId);
  return useQuery<RoomResponse[], Error>({
    queryKey: queryKeys.rooms(idNum),
    queryFn: () => roomsApi.getRoomsByHotel(idNum),
    enabled: Boolean(idNum && idNum > 0),
    ...options,
  });
}

/**
 * Fetch room by id
 */
export function useRoom(
  hotelId: number | string,
  roomId: number | string,
  options?: Partial<UseQueryOptions<RoomResponse, Error>>
) {
  const hId = Number(hotelId);
  const rId = Number(roomId);
  return useQuery<RoomResponse, Error>({
    queryKey: queryKeys.room(hId, rId),
    queryFn: () => roomsApi.getRoomById(hId, rId),
    enabled: Boolean(hId > 0 && rId > 0),
    ...options,
  });
}

// ==================== INVENTORY HOOKS ====================

/**
 * Fetch inventory timeline for room: key ['inventory', roomId]
 */
export function useRoomInventory(
  roomId: number | string,
  options?: Partial<UseQueryOptions<InventoryResponse[], Error>>
) {
  const rId = Number(roomId);
  return useQuery<InventoryResponse[], Error>({
    queryKey: queryKeys.inventory(rId),
    queryFn: () => inventoryApi.getRoomInventory(rId),
    enabled: Boolean(rId && rId > 0),
    ...options,
  });
}

// ==================== BOOKING HOOKS ====================

/**
 * Fetch user bookings: key ['bookings']
 */
export function useBookings(options?: Partial<UseQueryOptions<BookingResponse[], Error>>) {
  return useQuery<BookingResponse[], Error>({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.getMyBookings(),
    ...options,
  });
}

/**
 * Fetch bookings for a hotel: key ['bookings', 'hotel', hotelId]
 */
export function useHotelBookings(
  hotelId: number | string,
  options?: Partial<UseQueryOptions<BookingResponse[], Error>>
) {
  const hId = Number(hotelId);
  return useQuery<BookingResponse[], Error>({
    queryKey: queryKeys.hotelBookings(hId),
    queryFn: () => adminApi.getHotelBookings(hId),
    enabled: Boolean(hId && hId > 0),
    ...options,
  });
}

// ==================== USER HOOKS ====================

export function useUserProfile(options?: Partial<UseQueryOptions<UserResponse, Error>>) {
  return useQuery<UserResponse, Error>({
    queryKey: queryKeys.user,
    queryFn: () => userApi.getMe(),
    ...options,
  });
}

// ==================== REPORT HOOKS ====================

export function useHotelReport(
  hotelId: number | string,
  startDate?: string,
  endDate?: string,
  options?: Partial<UseQueryOptions<HotelReport, Error>>
) {
  const hId = Number(hotelId);
  return useQuery<HotelReport, Error>({
    queryKey: queryKeys.hotelReport(hId, startDate, endDate),
    queryFn: () => adminApi.getHotelReport(hId, startDate, endDate),
    enabled: Boolean(hId && hId > 0),
    ...options,
  });
}

// ==================== MUTATIONS ====================

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation<BookingResponse, Error, BookingRequest>({
    mutationFn: (data) => bookingsApi.initBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useAddGuests() {
  const queryClient = useQueryClient();
  return useMutation<BookingResponse, Error, { bookingId: number; guests: GuestRequest[] }>({
    mutationFn: ({ bookingId, guests }) => bookingsApi.addGuests(bookingId, guests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation<BookingResponse, Error, number>({
    mutationFn: (bookingId) => bookingsApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation<HotelResponse, Error, HotelRequest>({
    mutationFn: (data) => adminApi.createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels });
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerHotels });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation<HotelResponse, Error, { id: number; data: HotelRequest }>({
    mutationFn: ({ id, data }) => adminApi.updateHotel(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels });
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerHotels });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotel(vars.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotelInfo(vars.id) });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminApi.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels });
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerHotels });
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation<RoomResponse, Error, { hotelId: number; data: RoomRequest }>({
    mutationFn: ({ hotelId, data }) => adminApi.createRoom(hotelId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms(vars.hotelId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotelInfo(vars.hotelId) });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation<RoomResponse, Error, { hotelId: number; roomId: number; data: RoomRequest }>({
    mutationFn: ({ hotelId, roomId, data }) => adminApi.updateRoom(hotelId, roomId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms(vars.hotelId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(vars.hotelId, vars.roomId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotelInfo(vars.hotelId) });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { hotelId: number; roomId: number }>({
    mutationFn: ({ hotelId, roomId }) => adminApi.deleteRoom(hotelId, roomId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms(vars.hotelId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotelInfo(vars.hotelId) });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation<InventoryResponse, Error, { roomId: number; data: UpdateInventoryRequest }>({
    mutationFn: ({ roomId, data }) => adminApi.updateRoomInventory(roomId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(vars.roomId) });
    },
  });
}
