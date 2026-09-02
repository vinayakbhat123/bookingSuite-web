import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  HelpCircle,
  Home,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { BookingResponse } from '../../types/api';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export const PaymentFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const { error: toastError } = useToast();
  const bookingIdParam = searchParams.get('bookingId');
  const bookingId = Number(bookingIdParam);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId || isNaN(bookingId)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await bookingService.getBookingById(bookingId);
        setBooking(result);
      } catch (err: any) {
        console.warn('Unable to load booking details on failure page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleRetryPayment = async () => {
    if (!bookingId) return;

    setIsRetrying(true);
    try {
      const res = await paymentService.initiatePayment(bookingId);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      toastError('Payment Gateway Error', 'Unable to redirect to payment gateway.');
    } catch (err: any) {
      toastError('Retry Failed', typeof err === 'string' ? err : err?.message || 'Payment initiation failed.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Failure Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-rose-50 dark:ring-rose-900/20">
          <XCircle className="w-9 h-9" />
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold tracking-wide uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          Payment Unsuccessful
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Payment could not be completed
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Your card or transaction was cancelled or declined by the payment provider. Your account has not been charged.
        </p>
      </div>

      {/* Booking Details Card (if loaded) */}
      {booking && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              Booking #{booking.id}
            </span>
            <StatusBadge status={booking.status || booking.bookingStatus || 'PAYMENTS_PENDING'} />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-500 shrink-0" />
                  {booking.hotelName || 'Selected Hotel'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {getRoomTypeLabel(booking.roomType || 'DOUBLE')} • {booking.roomsCount} {booking.roomsCount === 1 ? 'room' : 'rooms'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">Total Amount Due</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(booking.price ?? booking.totalAmount ?? booking.amount ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <strong>Check-in:</strong> {formatDisplayDate(booking.checkInDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <strong>Check-out:</strong> {formatDisplayDate(booking.checkOutDate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Options */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {bookingId ? (
          <button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Redirecting to Stripe...' : 'Retry Secure Payment'}</span>
          </button>
        ) : null}

        <Link
          to="/my-bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <span>View My Reservations</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
