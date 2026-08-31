import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BedDouble,
  Check,
  Edit2,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { roomService } from '../../services/roomService';
import { HotelResponse, RoomRequest, RoomResponse, RoomStatus, RoomType } from '../../types/api';
import { formatCurrency, getRoomTypeLabel } from '../../utils/formatters';
import { validateRoom } from '../../utils/validation';

export interface RoomsManagementPageProps {
  hotels?: HotelResponse[];
  selectedHotelId?: number | null;
}

export const RoomsManagementPage: React.FC<RoomsManagementPageProps> = ({
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Room Form State
  const [formData, setFormData] = useState<RoomRequest>({
    roomType: 'DELUXE',
    basePrice: 150,
    totalCount: 10,
    capacity: 2,
    floor: 2,
    roomStatus: 'AVAILABLE',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    amenities: ['KING_BED', 'BALCONY', 'CITY_VIEW', 'MINIBAR', 'HIGH_SPEED_WIFI'],
  });

  const [photosInput, setPhotosInput] = useState<string>('');
  const [amenitiesInput, setAmenitiesInput] = useState<string>('');

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  useEffect(() => {
    if (outletHotelId) {
      setActiveHotelId(outletHotelId);
    } else if (hotels.length > 0 && !activeHotelId) {
      setActiveHotelId(hotels[0].id);
    }
  }, [hotels, outletHotelId]);

  const fetchRooms = async () => {
    if (!activeHotelId) return;
    setIsLoading(true);
    try {
      const list = await roomService.getRoomsByHotel(activeHotelId);
      setRooms(list || []);
    } catch (err: any) {
      toastError('Failed to fetch rooms', typeof err === 'string' ? err : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeHotelId]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingRoomId(null);
    setFormData({
      roomType: 'DELUXE',
      basePrice: 150,
      totalCount: 10,
      capacity: 2,
      floor: 2,
      roomStatus: 'AVAILABLE',
      photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      amenities: ['KING_BED', 'BALCONY', 'CITY_VIEW', 'MINIBAR', 'HIGH_SPEED_WIFI'],
    });
    setPhotosInput('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800');
    setAmenitiesInput('KING_BED, BALCONY, CITY_VIEW, MINIBAR, HIGH_SPEED_WIFI');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (roomId: number) => {
    if (!activeHotelId) return;
    setIsEditing(true);
    setEditingRoomId(roomId);
    try {
      const room = await roomService.getRoomById(activeHotelId, roomId);
      setFormData({
        roomType: room.roomType,
        basePrice: room.basePrice,
        totalCount: room.totalCount,
        capacity: room.capacity,
        floor: room.floor || 1,
        roomStatus: room.roomStatus || 'AVAILABLE',
        photos: room.photos || [],
        amenities: room.amenities || [],
      });
      setPhotosInput(room.photos?.join('\n') || '');
      setAmenitiesInput(room.amenities?.join(', ') || '');
      setIsModalOpen(true);
    } catch (err: any) {
      toastError('Failed to load room details', typeof err === 'string' ? err : err.message);
    }
  };

  const handleDelete = async (roomId: number, roomType: string) => {
    if (!activeHotelId) return;
    if (!window.confirm(`Are you sure you want to delete ${roomType} (ID: #${roomId})?`)) return;

    try {
      await roomService.deleteRoom(activeHotelId, roomId);
      toastSuccess('Room Deleted', `Room #${roomId} removed.`);
      fetchRooms();
    } catch (err: any) {
      toastError('Delete Failed', typeof err === 'string' ? err : err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotelId) return;

    const val = validateRoom(formData);
    if (!val.isValid) {
      const firstErr = Object.values(val.errors)[0];
      toastError('Validation Error', firstErr);
      return;
    }

    const photosList = photosInput
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const amenitiesList = amenitiesInput
      .split(',')
      .map((a) => a.trim().toUpperCase().replace(/\s+/g, '_'))
      .filter((a) => a.length > 0);

    const payload: RoomRequest = {
      ...formData,
      photos: photosList.length > 0 ? photosList : formData.photos,
      amenities: amenitiesList.length > 0 ? amenitiesList : formData.amenities,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editingRoomId) {
        await roomService.updateRoom(activeHotelId, editingRoomId, payload);
        toastSuccess('Room Updated', `Room #${editingRoomId} updated.`);
      } else {
        await roomService.createRoom(activeHotelId, payload);
        toastSuccess('Room Created', `${getRoomTypeLabel(payload.roomType)} added.`);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      toastError('Save Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeHotel = hotels.find((h) => h.id === activeHotelId);

  return (
    <div className="space-y-8">
      {/* Header & Hotel Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Types & Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure room tiers, base rates, unit counts, capacities, and amenity specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRooms}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh Rooms"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            disabled={!activeHotelId}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Type</span>
          </button>
        </div>
      </div>

      {/* Active Hotel Selector Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Selecting Hotel:</span>
          <select
            value={activeHotelId || ''}
            onChange={(e) => setActiveHotelId(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hotelName} ({h.cityName}) - ID #{h.id}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500">
          Showing {rooms.length} room tier(s) for {activeHotel?.hotelName || 'Selected Hotel'}
        </span>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Retrieving rooms from backend..." />
        ) : rooms.length === 0 ? (
          <EmptyState
            title="No Rooms Configured"
            description="There are currently no room tiers listed for this hotel property."
            actionLabel="Add Room Type"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Room Type</th>
                  <th className="py-3 px-6">Base Price</th>
                  <th className="py-3 px-6">Inventory / Units</th>
                  <th className="py-3 px-6">Capacity & Floor</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">#{room.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img
                            src={
                              room.photos?.[0] ||
                              'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'
                            }
                            alt={room.roomType}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {getRoomTypeLabel(room.roomType)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {room.amenities?.length || 0} Amenities
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(room.basePrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ night</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{room.totalCount} units</span>
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <p className="font-medium text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.capacity} Guests</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Floor: {room.floor || 1}</p>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={room.roomStatus} type="room" />
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(room.id)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Room"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id, room.roomType)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Room #${editingRoomId}` : 'Add New Room Tier'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Type *</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="SINGLE">Single Room</option>
                <option value="DOUBLE">Double Room</option>
                <option value="STANDARD_QUEEN">Standard Queen</option>
                <option value="DELUXE">Deluxe Room</option>
                <option value="EXECUTIVE_SUITE">Executive Suite</option>
                <option value="FAMILY_TWIN">Family Twin</option>
                <option value="PRESIDENTIAL_PENTHOUSE">Presidential Penthouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Status *</label>
              <select
                value={formData.roomStatus}
                onChange={(e) =>
                  setFormData({ ...formData, roomStatus: e.target.value as RoomStatus })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹) *</label>
              <input
                type="number"
                min={1}
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Units *</label>
              <input
                type="number"
                min={1}
                value={formData.totalCount}
                onChange={(e) => setFormData({ ...formData, totalCount: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guest Capacity *</label>
              <input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level</label>
            <input
              type="number"
              min={1}
              value={formData.floor || 1}
              onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photos (URLs)</label>
            <textarea
              rows={2}
              value={photosInput}
              onChange={(e) => setPhotosInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Room Amenities (Comma separated)
            </label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="KING_BED, BALCONY, CITY_VIEW, MINIBAR, HIGH_SPEED_WIFI"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Room...' : isEditing ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
