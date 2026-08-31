import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  Check,
  DollarSign,
  Layers,
  Lock,
  RefreshCw,
  Sliders,
  TrendingUp,
  Unlock,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { inventoryService } from '../../services/inventoryService';
import { roomService } from '../../services/roomService';
import { HotelResponse, InventoryDto, RoomResponse, UpdateInventoryRequest } from '../../types/api';
import { formatDateForApi, formatDisplayDate, getDaysAhead } from '../../utils/dateUtils';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';

export interface InventoryManagementPageProps {
  hotels?: HotelResponse[];
  selectedHotelId?: number | null;
}

export const InventoryManagementPage: React.FC<InventoryManagementPageProps> = ({
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
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [inventoryList, setInventoryList] = useState<InventoryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Update Inventory Form State (PATCH /admin/inventory/room/{roomId})
  const [startDate, setStartDate] = useState<string>(formatDateForApi(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDateForApi(getDaysAhead(30)));
  const [totalCount, setTotalCount] = useState<number>(10);
  const [surgeFactor, setSurgeFactor] = useState<number>(1.0);
  const [closed, setClosed] = useState<boolean>(false);

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  useEffect(() => {
    if (outletHotelId) {
      setActiveHotelId(outletHotelId);
    } else if (hotels.length > 0 && !activeHotelId) {
      setActiveHotelId(hotels[0].id);
    }
  }, [hotels, outletHotelId]);

  // Load rooms when hotel changes
  useEffect(() => {
    const loadRooms = async () => {
      if (!activeHotelId) return;
      try {
        const list = await roomService.getRoomsByHotel(activeHotelId);
        setRooms(list || []);
        if (list && list.length > 0) {
          setSelectedRoomId(list[0].id);
          setTotalCount(list[0].totalCount);
        } else {
          setSelectedRoomId(null);
          setInventoryList([]);
        }
      } catch {
        setRooms([]);
      }
    };
    loadRooms();
  }, [activeHotelId]);

  // Fetch Inventory Schedule when roomId changes
  const fetchInventory = async () => {
    if (!selectedRoomId) return;
    setIsLoading(true);
    try {
      const data = await inventoryService.getRoomInventory(selectedRoomId);
      setInventoryList(data || []);
      if (data && data.length > 0) {
        setSurgeFactor(data[0].surgeFactor || 1.0);
        setClosed(data[0].closed || false);
        setTotalCount(data[0].totalCount || 10);
      }
    } catch (err: any) {
      toastError(
        'Inventory Notice',
        typeof err === 'string' ? err : 'Unable to query /admin/inventory/rooms/{roomId}'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedRoomId]);

  // Submit Inventory Adjustment
  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    setIsUpdating(true);
    try {
      const payload: UpdateInventoryRequest = {
        startDate,
        endDate,
        totalCount: Number(totalCount),
        surgeFactor: Number(surgeFactor),
        closed: Boolean(closed),
      };

      await inventoryService.updateRoomInventory(selectedRoomId, payload);
      toastSuccess('Inventory & Surge Updated', 'Real-time pricing adjustments dispatched to backend.');
      fetchInventory();
    } catch (err: any) {
      toastError('Update Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Dynamic Surge Pricing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative inventory schedules, surge multipliers, reserved counts, and blackout dates.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={!selectedRoomId}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Schedule</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            1. Select Hotel Property
          </label>
          <select
            value={activeHotelId || ''}
            onChange={(e) => setActiveHotelId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hotelName} ({h.cityName}) - ID #{h.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            2. Select Room Type Tier
          </label>
          <select
            value={selectedRoomId || ''}
            onChange={(e) => {
              const rId = Number(e.target.value);
              setSelectedRoomId(rId);
              const found = rooms.find((r) => r.id === rId);
              if (found) setTotalCount(found.totalCount);
            }}
            disabled={rooms.length === 0}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {getRoomTypeLabel(r.roomType)} (Base: {formatCurrency(r.basePrice)}) - ID #{r.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Surge Modifier Panel */}
      {selectedRoom && (
        <form
          onSubmit={handleUpdateInventory}
          className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 rounded-2xl text-white">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Adjust Surge & Inventory for {getRoomTypeLabel(selectedRoom.roomType)}
                </h3>
                <p className="text-xs text-slate-400">
                  Calls PATCH /admin/inventory/room/{selectedRoom.id}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300">
              Base Rate: {formatCurrency(selectedRoom.basePrice)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Surge Multiplier
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="5.0"
                  value={surgeFactor}
                  onChange={(e) => setSurgeFactor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-xs text-slate-400 font-mono hidden xl:inline">
                  ≈ {formatCurrency(selectedRoom.basePrice * surgeFactor)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Total Units
              </label>
              <input
                type="number"
                min="0"
                value={totalCount}
                onChange={(e) => setTotalCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 p-2.5 bg-slate-800 border border-slate-700 rounded-xl w-full cursor-pointer hover:bg-slate-700/60 transition-colors">
                <input
                  type="checkbox"
                  checked={closed}
                  onChange={(e) => setClosed(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {closed ? 'Closed (Blackout)' : 'Open (Active)'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Publishing Updates...' : 'Apply Surge & Inventory Update →'}
            </button>
          </div>
        </form>
      )}

      {/* Real-time Inventory Schedule Grid/Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daily Inventory Schedule & Live Pricing
            </h3>
            <p className="text-xs text-slate-500">
              Fetched from GET /admin/inventory/rooms/{selectedRoomId || '...'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {inventoryList.length} date records
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Querying inventory timeline..." />
        ) : inventoryList.length === 0 ? (
          <EmptyState
            title="No Inventory Schedule Records"
            description="The backend does not have pre-seeded schedule rows for this room, or dynamic rows are created on demand."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Booked</th>
                  <th className="py-3 px-6">Reserved</th>
                  <th className="py-3 px-6">Total Units</th>
                  <th className="py-3 px-6">Surge Factor</th>
                  <th className="py-3 px-6">Calculated Rate</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map((inv, idx) => (
                  <tr key={inv.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{formatDisplayDate(inv.date)}</span>
                        {inv.id && (
                          <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{inv.id}
                          </span>
                        )}
                        {inv.city && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {inv.city}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800">{inv.bookedCount || 0}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-slate-600">{inv.reservedCount || 0}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900">{inv.totalCount}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-rose-600">
                      {inv.surgeFactor ? `${inv.surgeFactor}x` : '1.0x'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(inv.price)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          inv.closed
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {inv.closed ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{inv.closed ? 'CLOSED' : 'OPEN'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
