import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  MapPin,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { BookingResponse } from '../../types/api';
import { calculateNights, formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export const BookingInvoicePage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      const id = Number(bookingId);
      if (!id || isNaN(id)) {
        setErrorMsg('Invalid Booking Reference ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err: any) {
        setErrorMsg(typeof err === 'string' ? err : err?.message || 'Unable to load invoice details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <LoadingSpinner text="Generating official booking invoice..." />
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Receipt className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Not Available</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Booking not found or access denied.'}</p>
        <Link
          to="/my-bookings"
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Return to My Reservations
        </Link>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const totalAmount = booking.price ?? booking.totalAmount ?? booking.amount ?? 0;
  const isConfirmed = booking.status === 'CONFIRMED' || booking.bookingStatus === 'CONFIRMED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reservations</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Sheet */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-rose-600">BookingSuite</span>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">RECEIPT</span>
            </div>
            <p className="text-xs text-slate-500">Premium Hospitality & Experience Booking</p>
            <p className="text-xs text-slate-400">www.bookingsuite.vinayakbhat.com</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice & Receipt</p>
            <p className="text-sm font-mono font-bold text-slate-900">INV-{booking.id}-{new Date().getFullYear()}</p>
            <p className="text-xs text-slate-500">
              Date: {booking.createdAt ? formatDisplayDate(booking.createdAt) : new Date().toLocaleDateString()}
            </p>
            <div className="pt-1">
              <StatusBadge status={booking.status || booking.bookingStatus || 'CONFIRMED'} />
            </div>
          </div>
        </div>

        {/* Billed To / Property Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest / Customer</span>
            <p className="text-sm font-bold text-slate-900">{user?.name || booking.guests?.[0]?.name || 'Valued Guest'}</p>
            {user?.email && <p className="text-xs text-slate-500">{user.email}</p>}
            {user?.phoneNumber && <p className="text-xs text-slate-500">{user.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accommodation Provider</span>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-rose-500" />
              {booking.hotelName || 'Luxury Stay Hotel'}
            </p>
            {booking.cityName && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {booking.cityName}, India
              </p>
            )}
          </div>
        </div>

        {/* Stay Specifics */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stay Information</span>
          <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Room Type</span>
              <strong className="text-slate-800 font-semibold">{getRoomTypeLabel(booking.roomType || 'DOUBLE')}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Check-in</span>
              <strong className="text-slate-800 font-semibold">{formatDisplayDate(booking.checkInDate)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Check-out</span>
              <strong className="text-slate-800 font-semibold">{formatDisplayDate(booking.checkOutDate)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Duration</span>
              <strong className="text-slate-800 font-semibold">{nights} {nights === 1 ? 'Night' : 'Nights'} ({booking.roomsCount} {booking.roomsCount === 1 ? 'Room' : 'Rooms'})</strong>
            </div>
          </div>
        </div>

        {/* Guests List */}
        {booking.guests && booking.guests.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Guests</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 font-semibold">#</th>
                    <th className="px-4 py-2 font-semibold">Guest Name</th>
                    <th className="px-4 py-2 font-semibold">Gender</th>
                    <th className="px-4 py-2 font-semibold text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.guests.map((g, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2 font-bold text-slate-900">{g.name}</td>
                      <td className="px-4 py-2 text-slate-600 capitalize">{g.gender?.toLowerCase()}</td>
                      <td className="px-4 py-2 text-slate-600 text-right">{g.age} yrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Itemized Financial Breakdown */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</span>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Nights</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Rooms</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{booking.hotelName} — {getRoomTypeLabel(booking.roomType || 'DOUBLE')}</p>
                    <p className="text-[11px] text-slate-400">Reservation #{booking.id}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{nights}</td>
                  <td className="px-4 py-3 text-center">{booking.roomsCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(totalAmount)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-bold text-slate-700 text-right">Total Paid (Inclusive of all taxes):</td>
                  <td className="px-4 py-3 text-right font-extrabold text-base text-rose-600">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Verification Footer */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Payment Settlement
            </p>
            <p className="text-[11px] text-slate-500">
              Payment Gateway: Stripe • Method: Card / Digital Payment
            </p>
            {booking.stripeSessionId && (
              <p className="text-[10px] font-mono text-slate-400">
                Ref: {booking.stripeSessionId}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              PAID & CONFIRMED
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
          <p>This is an electronically generated receipt issued by BookingSuite. No signature required.</p>
        </div>
      </div>
    </div>
  );
};
