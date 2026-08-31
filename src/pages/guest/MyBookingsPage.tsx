import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Eye,
  PlusCircle,
  RefreshCw,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { BookingResponse, GuestRequest } from '../../types/api';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeGuestsModal, setActiveGuestsModal] = useState<{
    bookingId: number;
    guests?: GuestRequest[];
  } | null>(null);

  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err: any) {
      toastError(
        'Failed to load bookings',
        typeof err === 'string' ? err : 'Unable to query /users/mybookings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${bookingId}?`)) return;

    setCancellingId(bookingId);
    try {
      const updated = await bookingService.cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => ((b.id || b.bookingId) === bookingId ? updated : b))
      );
      toastInfo('Booking Cancelled', `Booking #${bookingId} has been marked as CANCELLED.`);
    } catch (err: any) {
      toastError('Cancellation Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayment = async (bookingId: number) => {
    setPayingId(bookingId);
    try {
      const res = await paymentService.initiatePayment(bookingId);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      toastSuccess('Payment Authorized', 'Booking status updated.');
      fetchBookings();
    } catch (err: any) {
      toastError('Payment Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your past and upcoming hotel stays directly from the backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Book New Stay</span>
          </Link>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingSpinner text="Loading your reservations..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Yet"
          description="You don't have any hotel bookings listed. Explore destinations and book your next stay!"
          actionLabel="Find Hotels"
          onAction={() => (window.location.href = '/search')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const bId = booking.id || booking.bookingId || 0;
            const isPending = booking.bookingStatus === 'PAYMENTS_PENDING';
            const isCancelled = booking.bookingStatus === 'CANCELLED';

            return (
              <div
                key={bId}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{bId}
                      </span>
                      <StatusBadge status={booking.bookingStatus} />
                      {booking.createdAt && (
                        <span className="text-[11px] text-slate-400">
                          Booked on {formatDisplayDate(booking.createdAt)}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {booking.hotelName || booking.hotel?.hotelName || `Hotel #${booking.hotelId || 'N/A'}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {booking.roomType ? getRoomTypeLabel(booking.roomType) : 'Standard Room'} •{' '}
                        {booking.roomsCount} {booking.roomsCount === 1 ? 'room' : 'rooms'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <strong>Check-in:</strong> {formatDisplayDate(booking.checkInDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <strong>Check-out:</strong> {formatDisplayDate(booking.checkOutDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        <strong>Guests:</strong> {booking.guests?.length || 1}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-col lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 block lg:text-right">Total Amount</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        {formatCurrency(booking.totalAmount || booking.amount || 0)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {booking.guests && booking.guests.length > 0 && (
                        <button
                          onClick={() => setActiveGuestsModal({ bookingId: bId, guests: booking.guests })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Guests ({booking.guests.length})</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          onClick={() => handlePayment(bId)}
                          disabled={payingId === bId}
                          className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{payingId === bId ? 'Processing...' : 'Pay Now'}</span>
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancel(bId)}
                          disabled={cancellingId === bId}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{cancellingId === bId ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest Details Modal */}
      {activeGuestsModal && (
        <Modal
          isOpen={!!activeGuestsModal}
          onClose={() => setActiveGuestsModal(null)}
          title={`Guests in Booking #${activeGuestsModal.bookingId}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            {activeGuestsModal.guests?.map((g, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                <div>
                  <p className="font-bold text-slate-900">{g.name}</p>
                  <p className="text-slate-500">Gender: {g.gender}</p>
                </div>
                <span className="font-semibold text-slate-700">Age: {g.age}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
