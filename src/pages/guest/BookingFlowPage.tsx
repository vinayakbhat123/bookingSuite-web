import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { hotelService } from '../../services/hotelService';
import { paymentService } from '../../services/paymentService';
import {
  BookingRequest,
  BookingResponse,
  GuestRequest,
  HotelInfoResponse,
  RoomResponse,
} from '../../types/api';
import { calculateNights, formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export const BookingFlowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const hotelId = Number(searchParams.get('hotelId'));
  const roomId = Number(searchParams.get('roomId'));
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';
  const roomsCount = Number(searchParams.get('roomsCount')) || 1;

  // Flow State: 1: 'INIT_REVIEW', 2: 'GUESTS', 3: 'PAYMENT', 4: 'CONFIRMATION'
  const [step, setStep] = useState<'INIT_REVIEW' | 'GUESTS' | 'PAYMENT' | 'CONFIRMATION'>('INIT_REVIEW');
  const [hotelInfo, setHotelInfo] = useState<HotelInfoResponse | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Guest inputs state
  const [guests, setGuests] = useState<GuestRequest[]>([
    { name: user?.name || '', gender: 'MALE', age: 30 },
  ]);

  // Load hotel and room details
  useEffect(() => {
    const loadDetails = async () => {
      if (!hotelId || !roomId) {
        toastError('Missing Information', 'Please select a hotel and room first.');
        navigate('/search');
        return;
      }
      setIsLoading(true);
      try {
        const info = await hotelService.getHotelInfo(hotelId);
        setHotelInfo(info);
        const room = info.rooms.find((r) => r.id === roomId) || null;
        setSelectedRoom(room);
      } catch (err: any) {
        toastError('Failed to load hotel', typeof err === 'string' ? err : err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [hotelId, roomId]);

  // Step 1: Initialize Booking (POST /bookings/init)
  const handleInitBooking = async () => {
    if (!isAuthenticated) {
      toastInfo('Sign in Required', 'Please sign in or create an account to book.');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BookingRequest = {
        hotelId,
        roomId,
        checkInDate,
        checkOutDate,
        roomsCount,
      };
      const createdBooking = await bookingService.initBooking(payload);
      setBooking(createdBooking);
      toastSuccess('Reservation Initialized', 'Please provide guest details for check-in.');
      setStep('GUESTS');
    } catch (err: any) {
      toastError('Booking Initiation Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Add Guests (POST /bookings/{bookingId}/addGuests)
  const handleAddGuestRow = () => {
    setGuests((prev) => [...prev, { name: '', gender: 'MALE', age: 28 }]);
  };

  const handleRemoveGuestRow = (index: number) => {
    if (guests.length <= 1) return;
    setGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuestChange = (index: number, field: keyof GuestRequest, value: any) => {
    setGuests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmitGuests = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentBookingId = booking?.id || booking?.bookingId;
    if (!currentBookingId) {
      toastError('Error', 'Active booking not found.');
      return;
    }

    // Validate guest names
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].name.trim()) {
        toastError('Validation Error', `Please enter the full name for Guest #${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updatedBooking = await bookingService.addGuests(currentBookingId, guests);
      setBooking(updatedBooking);
      toastSuccess('Guests Registered', 'Proceeding to secure payment settlement.');
      setStep('PAYMENT');
    } catch (err: any) {
      toastError('Could Not Add Guests', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Initiate Payment (POST /bookings/{bookingId}/payments)
  const handlePayNow = async () => {
    const currentBookingId = booking?.id || booking?.bookingId;
    if (!currentBookingId) return;

    setIsSubmitting(true);
    try {
      const paymentRes = await paymentService.initiatePayment(currentBookingId);

      // If backend returned a Stripe checkout URL
      if (paymentRes?.paymentUrl) {
        window.location.href = paymentRes.paymentUrl;
        return;
      }

      // Transition to confirmation
      setBooking((prev) =>
        prev ? { ...prev, bookingStatus: 'CONFIRMED' } : { id: currentBookingId, bookingStatus: 'CONFIRMED' } as any
      );
      toastSuccess('Payment Authorized', 'Your booking is confirmed!');
      setStep('CONFIRMATION');
    } catch (err: any) {
      toastError('Payment Processing Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 Actions: Cancel Booking (POST /bookings/{bookingId}/cancel)
  const handleCancelBooking = async () => {
    const currentBookingId = booking?.id || booking?.bookingId;
    if (!currentBookingId) return;

    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;

    setIsSubmitting(true);
    try {
      const cancelled = await bookingService.cancelBooking(currentBookingId);
      setBooking(cancelled);
      toastInfo('Booking Cancelled', 'Your reservation has been cancelled.');
    } catch (err: any) {
      toastError('Cancellation Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner text="Setting up your reservation workspace..." />
      </div>
    );
  }

  const hotel = hotelInfo?.hotel;
  const nights = calculateNights(checkInDate, checkOutDate);
  const totalCost = selectedRoom ? selectedRoom.basePrice * nights * roomsCount : booking?.amount || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Step Indicator Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 'INIT_REVIEW' && 'Confirm & Initialize Booking'}
              {step === 'GUESTS' && 'Add Guest Information'}
              {step === 'PAYMENT' && 'Complete Payment'}
              {step === 'CONFIRMATION' && 'Booking Confirmed!'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {hotel?.hotelName} • {hotel?.cityName}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {(['INIT_REVIEW', 'GUESTS', 'PAYMENT', 'CONFIRMATION'] as const).map((s, idx) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === s
                    ? 'bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-950 scale-110'
                    : idx < ['INIT_REVIEW', 'GUESTS', 'PAYMENT', 'CONFIRMATION'].indexOf(step)
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Step Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: INITIALIZE REVIEW */}
          {step === 'INIT_REVIEW' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Stay Summary</h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Dates</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDisplayDate(checkInDate)} – {formatDisplayDate(checkOutDate)} ({nights} nights)
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Room Tier</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRoom ? getRoomTypeLabel(selectedRoom.roomType) : 'Standard Room'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Rooms Reserved</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{roomsCount} Room(s)</span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>You must be signed in with your BookingSuite account to initialize a booking.</span>
                </div>
              )}

              <button
                onClick={handleInitBooking}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner className="py-0" text="Initializing with Backend..." />
                ) : (
                  <span>Continue to Guest Details →</span>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: ADD GUESTS */}
          {step === 'GUESTS' && (
            <form onSubmit={handleSubmitGuests} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Guest Registration</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Booking ID: #{booking?.id || booking?.bookingId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddGuestRow}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Guest</span>
                </button>
              </div>

              <div className="space-y-4">
                {guests.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Guest #{idx + 1}</span>
                      {guests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGuestRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Jane Doe"
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Gender
                        </label>
                        <select
                          value={g.gender}
                          onChange={(e) => handleGuestChange(idx, 'gender', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-900 dark:text-slate-100"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other / Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={g.age}
                          onChange={(e) => handleGuestChange(idx, 'age', Number(e.target.value))}
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner className="py-0" text="Saving Guests on Backend..." />
                ) : (
                  <span>Submit Guests & Proceed to Payment →</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'PAYMENT' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Initiation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Booking #{booking?.id || booking?.bookingId}
                  </p>
                </div>
                <StatusBadge status={booking?.bookingStatus || 'PAYMENTS_PENDING'} />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Total Payable Amount:</span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {formatCurrency(booking?.amount || booking?.totalAmount || totalCost)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Secure 256-bit encrypted Spring Boot Stripe payment processing.</span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner className="py-0" text="Processing with Payment Gateway..." />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatCurrency(booking?.amount || totalCost)} Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 'CONFIRMATION' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Confirmed!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your reservation reference is{' '}
                  <strong className="font-mono text-slate-900 dark:text-white font-bold">
                    #{booking?.id || booking?.bookingId}
                  </strong>
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <StatusBadge status={booking?.bookingStatus || 'CONFIRMED'} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Hotel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{hotel?.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Check-in</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDisplayDate(checkInDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Check-out</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDisplayDate(checkOutDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Paid</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(booking?.amount || totalCost)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/my-bookings"
                  className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-colors"
                >
                  View in My Bookings
                </Link>
                {booking?.bookingStatus !== 'CANCELLED' && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={isSubmitting}
                    className="py-3 px-4 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Reservation Details Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 sticky top-28">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Reservation Details</h3>

            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                <img
                  src={
                    hotel?.photos?.[0] ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                  }
                  alt={hotel?.hotelName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{hotel?.hotelName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{hotel?.cityName}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  {selectedRoom ? getRoomTypeLabel(selectedRoom.roomType) : 'Standard Room'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Check-in</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDisplayDate(checkInDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDisplayDate(checkOutDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{nights} Night(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Units</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{roomsCount} Room(s)</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Total</span>
              <span className="font-black text-lg text-slate-900 dark:text-white">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
