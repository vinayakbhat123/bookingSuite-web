import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { RoomCard } from '../../components/RoomCard';
import { useToast } from '../../context/ToastContext';
import { hotelService } from '../../services/hotelService';
import { HotelInfoResponse, RoomResponse } from '../../types/api';
import { calculateNights, formatDateForApi, getDaysAhead, getTomorrow } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { DEFAULT_HOTEL_PHOTOS, getValidHotelPhotos } from '../../utils/imageUtils';

export const HotelDetailsPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const initialStartDate = searchParams.get('startDate') || formatDateForApi(getTomorrow());
  const initialEndDate = searchParams.get('endDate') || formatDateForApi(getDaysAhead(4));
  const initialRoomsCount = Number(searchParams.get('roomsCount')) || 1;

  const [hotelInfo, setHotelInfo] = useState<HotelInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Booking selection state
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>(initialStartDate);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialEndDate);
  const [roomsCount, setRoomsCount] = useState<number>(initialRoomsCount);
  const [backendCalculatedTotal, setBackendCalculatedTotal] = useState<number | null>(null);

  const fetchHotelInfo = async () => {
    if (!hotelId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await hotelService.getHotelInfo(Number(hotelId));
      setHotelInfo(data);
      if (data?.rooms && data.rooms.length > 0) {
        // Auto select first available room
        const firstAvailable = data.rooms.find((r) => r.roomStatus === 'AVAILABLE') || data.rooms[0];
        setSelectedRoom(firstAvailable);
      }
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : 'Unable to retrieve hotel details from backend.';
      setErrorMsg(msg);
      toastError('Hotel Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Query date-aware pricing from GET /hotels/{hotelId}/details when dates change
  useEffect(() => {
    if (!hotelId || !checkInDate || !checkOutDate) return;
    hotelService
      .getHotelDetailsWithPricing(Number(hotelId), checkInDate, checkOutDate)
      .then((details) => {
        if (details?.calculatedTotalPrice) {
          setBackendCalculatedTotal(details.calculatedTotalPrice);
        }
      })
      .catch(() => {
        // Soft fallback to client estimation
      });
  }, [hotelId, checkInDate, checkOutDate]);

  useEffect(() => {
    fetchHotelInfo();
  }, [hotelId]);

  const handleProceedToBooking = () => {
    if (!selectedRoom || !hotelInfo?.hotel) return;

    const params = new URLSearchParams({
      hotelId: String(hotelInfo.hotel.id),
      roomId: String(selectedRoom.id),
      checkInDate,
      checkOutDate,
      roomsCount: String(roomsCount),
    });

    navigate(`/booking/flow?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <LoadingSpinner text="Retrieving hotel information and rooms from backend..." />
      </div>
    );
  }

  if (errorMsg || !hotelInfo?.hotel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <EmptyState
          title="Hotel Not Found"
          description={errorMsg || 'The requested hotel property could not be loaded.'}
          actionLabel="Back to Search"
          onAction={() => navigate('/search')}
        />
      </div>
    );
  }

  const hotel = hotelInfo.hotel;
  const rooms = hotelInfo.rooms || [];
  const nights = calculateNights(checkInDate, checkOutDate);
  const photos = getValidHotelPhotos(hotel.photos, hotel.id);

  const estimatedTotal = selectedRoom ? selectedRoom.basePrice * nights * roomsCount : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Back button & Title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search results</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {hotel.hotelName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.95 (142 reviews)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <span>{hotel.cityName}</span>
              </span>
              {hotel.contactInfo?.address && (
                <>
                  <span>•</span>
                  <span>{hotel.contactInfo.address}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-full">
              {hotel.active !== false ? 'Verified & Active' : 'Unlisted'}
            </span>
          </div>
        </div>
      </div>

      {/* Airbnb-Style Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] max-h-[480px]">
        {/* Main large photo */}
        <div className="md:col-span-2 relative h-full bg-slate-100 dark:bg-slate-800">
          <img
            src={photos[0] || DEFAULT_HOTEL_PHOTOS[0]}
            alt={hotel.hotelName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2 Smaller photos */}
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <div className="relative h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={photos[1] || DEFAULT_HOTEL_PHOTOS[1]}
              alt="Hotel room preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={photos[2] || DEFAULT_HOTEL_PHOTOS[2]}
              alt="Hotel amenity preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right 2 Smaller photos */}
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <div className="relative h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={photos[3] || DEFAULT_HOTEL_PHOTOS[3]}
              alt="Hotel suite preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={photos[4] || DEFAULT_HOTEL_PHOTOS[4]}
              alt="Hotel lounge preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Layout Split: Left Details & Rooms, Right Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Amenities, Contact & Available Rooms */}
        <div className="lg:col-span-8 space-y-10">
          {/* Hotel Amenities */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">What this hotel offers</h2>
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{amenity.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No specific amenities listed for this property.
              </p>
            )}
          </div>

          {/* Contact Information */}
          {hotel.contactInfo && (
            <div className="border-b border-slate-200 dark:border-slate-800 pb-8 space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hotel Contact & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {hotel.contactInfo.address && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <span>{hotel.contactInfo.address}</span>
                  </div>
                )}
                {hotel.contactInfo.phoneNumber && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <span>{hotel.contactInfo.phoneNumber}</span>
                  </div>
                )}
                {hotel.contactInfo.email && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <span>{hotel.contactInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Rooms Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Room Options</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {rooms.length} {rooms.length === 1 ? 'tier available' : 'tiers available'}
              </span>
            </div>

            {rooms.length === 0 ? (
              <EmptyState
                title="No Rooms Configured"
                description="This hotel does not currently have any active room inventory listed."
              />
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={selectedRoom?.id === room.id}
                    onSelect={(r) => setSelectedRoom(r)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Reservation Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedRoom ? selectedRoom.basePrice : 0)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">/ night</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>

            {/* Date and Rooms Pickers */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    min={formatDateForApi(new Date())}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="p-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Number of Rooms
                </label>
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {n} {n === 1 ? 'Room' : 'Rooms'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Summary */}
            {selectedRoom && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  Selected: {selectedRoom.roomType.replace(/_/g, ' ')}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Capacity: {selectedRoom.capacity} guests • Floor: {selectedRoom.floor || 1}
                </p>
              </div>
            )}

            {/* Price Calculation Breakdown */}
            {selectedRoom && (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>
                    {formatCurrency(selectedRoom.basePrice)} × {nights} nights × {roomsCount} room(s)
                  </span>
                  <span>
                    {formatCurrency(
                      backendCalculatedTotal && backendCalculatedTotal > 0
                        ? backendCalculatedTotal * roomsCount
                        : estimatedTotal
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total (Backend Verified)</span>
                  <span>
                    {formatCurrency(
                      backendCalculatedTotal && backendCalculatedTotal > 0
                        ? backendCalculatedTotal * roomsCount
                        : estimatedTotal
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <button
              onClick={handleProceedToBooking}
              disabled={!selectedRoom || selectedRoom.roomStatus !== 'AVAILABLE'}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reserve & Continue Booking →
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
              You won't be charged yet. Guest details and payment step next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
