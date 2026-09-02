import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { bookingService } from '../../services/bookingService';
import { BookingResponse } from '../../types/api';
import { calculateNights, formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bookingIdParam = searchParams.get('bookingId');
  const sessionIdParam = searchParams.get('session_id') || searchParams.get('sessionId');

  useEffect(() => {
    const verifyAndLoad = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      const bookingId = Number(bookingIdParam);
      if (!bookingId || isNaN(bookingId)) {
        setErrorMsg('No booking reference provided in request.');
        setIsLoading(false);
        return;
      }

      try {
        let result: BookingResponse;
        if (sessionIdParam) {
          result = await bookingService.verifyPayment(bookingId, sessionIdParam);
        } else {
          result = await bookingService.getBookingById(bookingId);
        }
        setBooking(result);
      } catch (err: any) {
        console.warn('Payment verification fallback to getBookingById:', err);
        try {
          const fallbackResult = await bookingService.getBookingById(bookingId);
          setBooking(fallbackResult);
        } catch (innerErr: any) {
          setErrorMsg(
            typeof innerErr === 'string'
              ? innerErr
              : innerErr?.message || 'Unable to retrieve verified booking information.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [bookingIdParam, sessionIdParam]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner text="Verifying payment settlement with Stripe..." />
        <p className="text-xs text-slate-500 mt-2">
          Please do not refresh. Confirming room reservation and generating your receipt...
        </p>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Receipt className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Booking Status Unavailable
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {errorMsg || 'We could not verify the payment confirmation. Please check your reservations.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/my-bookings"
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          >
            Go to My Bookings
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const formattedPrice = formatCurrency(booking.price ?? booking.totalAmount ?? booking.amount ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50 dark:ring-emerald-900/30">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Your reservation is confirmed!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Thank you for choosing BookingSuite. We’ve sent your confirmation details to your account email.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              Booking #{booking.id}
            </span>
            <StatusBadge status={booking.status || booking.bookingStatus || 'CONFIRMED'} />
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Total Paid</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Card Body Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Hotel & Room Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Property & Destination</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-500 shrink-0" />
                {booking.hotelName || 'Luxury Stay Hotel'}
              </h3>
              {booking.cityName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {booking.cityName}, India
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accommodation</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {getRoomTypeLabel(booking.roomType || 'DOUBLE')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {booking.roomsCount} {booking.roomsCount === 1 ? 'room' : 'rooms'} reserved
              </p>
            </div>
          </div>

          {/* Dates & Guests Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Check-in
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDisplayDate(booking.checkInDate)}
              </p>
              <span className="text-[11px] text-slate-400">From 12:00 PM</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Check-out
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDisplayDate(booking.checkOutDate)}
              </p>
              <span className="text-[11px] text-slate-400">Until 11:00 AM</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Guests
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {booking.guests?.length || 1} {booking.guests?.length === 1 ? 'Guest' : 'Guests'}
              </p>
              <span className="text-[11px] text-slate-400">{nights} {nights === 1 ? 'Night' : 'Nights'} stay</span>
            </div>
          </div>

          {/* Registered Guests List */}
          {booking.guests && booking.guests.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Guests</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {booking.guests.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{g.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{g.gender?.toLowerCase()}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Age {g.age}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Support Guarantee */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">BookingSuite Protection Guarantee</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Your payment and room allocation are verified by Stripe and guaranteed by BookingSuite. Free cancellation is available up to 24 hours prior to check-in.
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer Navigation Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/bookings/${booking.id}/invoice`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity"
          >
            <FileText className="w-4 h-4" />
            <span>View & Print Invoice</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <span>My Reservations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
