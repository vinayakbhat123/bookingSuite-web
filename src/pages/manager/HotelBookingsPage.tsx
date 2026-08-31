import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  Search,
  User,
  Users,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { BookingResponse, GuestRequest, HotelResponse } from '../../types/api';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export interface HotelBookingsPageProps {
  hotels?: HotelResponse[];
  selectedHotelId?: number | null;
}

export const HotelBookingsPage: React.FC<HotelBookingsPageProps> = ({
  hotels: propHotels,
  selectedHotelId: propSelectedHotelId,
}) => {
  const outletCtx = useOutletContext<{
    hotels?: HotelResponse[];
    selectedHotelId?: number | null;
  }>() || {};

  const hotels = propHotels ?? outletCtx.hotels ?? [];
  const outletHotelId = propSelectedHotelId ?? outletCtx.selectedHotelId ?? null;

  const [activeHotelId, setActiveHotelId] = useState<number | null>(outletHotelId || null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeGuestsModal, setActiveGuestsModal] = useState<{
    bookingId: number;
    guests?: GuestRequest[];
  } | null>(null);

  const { error: toastError } = useToast();

  useEffect(() => {
    if (outletHotelId) {
      setActiveHotelId(outletHotelId);
    } else if (hotels.length > 0 && !activeHotelId) {
      setActiveHotelId(hotels[0].id);
    }
  }, [hotels, outletHotelId]);

  const fetchBookings = async () => {
    if (!activeHotelId) return;
    setIsLoading(true);
    try {
      const data = await bookingService.getHotelBookings(activeHotelId);
      setBookings(data || []);
    } catch (err: any) {
      toastError(
        'Failed to fetch bookings',
        typeof err === 'string' ? err : 'Unable to query /admin/hotels/{hotelId}/bookings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeHotelId]);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const matchesSearch =
      String(b.id || b.bookingId).includes(searchQuery) ||
      b.guests?.some((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && (searchQuery ? matchesSearch : true);
  });

  const activeHotel = hotels.find((h) => h.id === activeHotelId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotel Guest Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative ledger of reservations from GET /admin/hotels/{activeHotelId || '...'}/bookings
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Hotel & Status Filter Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Hotel:</span>
          <select
            value={activeHotelId || ''}
            onChange={(e) => setActiveHotelId(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hotelName} ({h.cityName}) - ID #{h.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CONFIRMED', 'PAYMENTS_PENDING', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Retrieving booking records..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Recorded"
            description="There are no reservations for this hotel matching the active filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Booking ID</th>
                  <th className="py-3 px-6">Stay Dates</th>
                  <th className="py-3 px-6">Room / Units</th>
                  <th className="py-3 px-6">Guests</th>
                  <th className="py-3 px-6">Total Settled</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const bId = b.id || b.bookingId;
                  return (
                    <tr key={bId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-700">#{bId}</td>
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-semibold text-slate-900">
                          {formatDisplayDate(b.checkInDate)} → {formatDisplayDate(b.checkOutDate)}
                        </p>
                      </td>
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-bold text-slate-800">
                          {b.roomType ? getRoomTypeLabel(b.roomType) : 'Standard Room'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {b.roomsCount} {b.roomsCount === 1 ? 'room' : 'rooms'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.guests?.length || 1} Guest(s)</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(b.totalAmount || b.amount || 0)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={b.bookingStatus} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {b.guests && b.guests.length > 0 ? (
                          <button
                            onClick={() =>
                              setActiveGuestsModal({ bookingId: bId!, guests: b.guests })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Guests</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Details Modal */}
      {activeGuestsModal && (
        <Modal
          isOpen={!!activeGuestsModal}
          onClose={() => setActiveGuestsModal(null)}
          title={`Registered Guests in Booking #${activeGuestsModal.bookingId}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            {activeGuestsModal.guests?.map((g, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {g.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{g.name}</p>
                    <p className="text-slate-500">Gender: {g.gender}</p>
                  </div>
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
