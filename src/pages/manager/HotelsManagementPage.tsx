import React, { useEffect, useState } from 'react';
import {
  Check,
  Edit2,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { hotelService } from '../../services/hotelService';
import { HotelRequest, HotelResponse } from '../../types/api';
import { validateHotel } from '../../utils/validation';

export interface HotelsManagementPageProps {
  onHotelChange?: () => void;
}

export const HotelsManagementPage: React.FC<HotelsManagementPageProps> = ({ onHotelChange }) => {
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'ALL' | 'OWNER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activatingHotelId, setActivatingHotelId] = useState<number | null>(null);

  // Form State matching HotelRequest
  const [formData, setFormData] = useState<HotelRequest>({
    hotelName: '',
    cityName: '',
    photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    amenities: ['WIFI', 'SWIMMING_POOL', 'SPA', 'FITNESS_CENTER', 'RESTAURANT'],
    contactInfo: {
      address: '',
      phoneNumber: '',
      email: '',
      location: '',
    },
    active: false,
  });

  const [photosInput, setPhotosInput] = useState<string>('');
  const [amenitiesInput, setAmenitiesInput] = useState<string>('');

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'OWNER') {
        const data = await hotelService.getOwnerHotels();
        setHotels(data || []);
      } else {
        const data = await hotelService.getAdminHotels();
        setHotels(data || []);
      }
    } catch (err: any) {
      toastError('Failed to fetch hotels', typeof err === 'string' ? err : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [viewMode]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingHotelId(null);
    setFormData({
      hotelName: '',
      cityName: '',
      photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      amenities: ['WIFI', 'SWIMMING_POOL', 'FITNESS_CENTER', 'RESTAURANT'],
      contactInfo: {
        address: '',
        phoneNumber: '',
        email: '',
        location: '',
      },
      active: false,
    });
    setPhotosInput('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800');
    setAmenitiesInput('WIFI, SWIMMING_POOL, FITNESS_CENTER, RESTAURANT');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (hotelId: number) => {
    setIsEditing(true);
    setEditingHotelId(hotelId);

    // Prefill from local state first if available
    const existing = hotels.find((h) => h.id === hotelId);
    if (existing) {
      setFormData({
        id: existing.id,
        hotelName: existing.hotelName || '',
        cityName: existing.cityName || '',
        photos: existing.photos || [],
        amenities: existing.amenities || [],
        contactInfo: {
          address: existing.contactInfo?.address || '',
          phoneNumber: existing.contactInfo?.phoneNumber || '',
          email: existing.contactInfo?.email || '',
          location: existing.contactInfo?.location || '',
        },
        active: Boolean(existing.active),
      });
      setPhotosInput(existing.photos?.join('\n') || '');
      setAmenitiesInput(existing.amenities?.join(', ') || '');
      setIsModalOpen(true);
    }

    try {
      const hotel = await hotelService.getAdminHotelById(hotelId);
      if (hotel) {
        setFormData({
          id: hotel.id,
          hotelName: hotel.hotelName || '',
          cityName: hotel.cityName || '',
          photos: hotel.photos || [],
          amenities: hotel.amenities || [],
          contactInfo: {
            address: hotel.contactInfo?.address || '',
            phoneNumber: hotel.contactInfo?.phoneNumber || '',
            email: hotel.contactInfo?.email || '',
            location: hotel.contactInfo?.location || '',
          },
          active: Boolean(hotel.active),
        });
        setPhotosInput(hotel.photos?.join('\n') || '');
        setAmenitiesInput(hotel.amenities?.join(', ') || '');
        if (!existing) setIsModalOpen(true);
      }
    } catch (err: any) {
      if (!existing) {
        toastError('Failed to load hotel details', typeof err === 'string' ? err : err.message);
      }
    }
  };

  const handleDelete = async (hotelId: number, hotelName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${hotelName}" (ID: #${hotelId})?`)) {
      return;
    }
    try {
      await hotelService.deleteAdminHotel(hotelId);
      toastSuccess('Hotel Deleted', `Hotel #${hotelId} has been removed.`);
      fetchHotels();
      onHotelChange?.();
    } catch (err: any) {
      toastError('Delete Failed', typeof err === 'string' ? err : err.message);
    }
  };

  const handleActivateHotel = async (hotel: HotelResponse) => {
    if (activatingHotelId !== null || hotel.active) {
      return;
    }
    setActivatingHotelId(hotel.id);
    try {
      await hotelService.activateHotel(hotel.id);
      setHotels((prev) =>
        prev.map((h) => (h.id === hotel.id ? { ...h, active: true } : h))
      );
      toastSuccess('Hotel Activated', `${hotel.hotelName} has been successfully activated.`);
      fetchHotels();
      onHotelChange?.();
    } catch (err: any) {
      toastError('Activation Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setActivatingHotelId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const val = validateHotel(formData);
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

    // Sanitize phone number to digits or +digits matching backend regex ^\+?[0-9]{10,15}$
    const rawPhone = formData.contactInfo.phoneNumber.trim();
    const cleanPhone = rawPhone.startsWith('+')
      ? '+' + rawPhone.slice(1).replace(/\D/g, '')
      : rawPhone.replace(/\D/g, '');

    const payload: HotelRequest = {
      ...formData,
      id: isEditing && editingHotelId ? editingHotelId : undefined,
      hotelName: formData.hotelName.trim(),
      cityName: formData.cityName.trim(),
      photos: photosList.length > 0 ? photosList : formData.photos,
      amenities: amenitiesList.length > 0 ? amenitiesList : formData.amenities,
      contactInfo: {
        address: formData.contactInfo.address.trim(),
        phoneNumber: cleanPhone,
        email: formData.contactInfo.email.trim(),
        location: (formData.contactInfo.location || '').trim(),
      },
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editingHotelId) {
        await hotelService.updateAdminHotel(editingHotelId, payload);
        toastSuccess('Hotel Updated', `${payload.hotelName} was successfully modified.`);
      } else {
        await hotelService.createAdminHotel(payload);
        toastSuccess('Hotel Created', `${payload.hotelName} has been created in the catalog.`);
      }
      setIsModalOpen(false);
      fetchHotels();
      onHotelChange?.();
    } catch (err: any) {
      toastError('Operation Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHotels = hotels.filter(
    (h) =>
      h.hotelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.cityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(h.id).includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotel Properties Portfolio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage properties, contact information, photos, amenities, and activation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHotels}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Hotel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle between All Hotels and Owner's Hotels */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hotels (GET /admin/hotels)
          </button>
          <button
            onClick={() => setViewMode('OWNER')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'OWNER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Owned Hotels (GET /admin/hotels/owner)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotel name, city or ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
          />
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Retrieving hotels from backend..." />
        ) : filteredHotels.length === 0 ? (
          <EmptyState
            title="No Hotels Found"
            description="No properties match your current view mode or filter."
            actionLabel="Create a Hotel"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Hotel Details</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHotels.map((hotel) => {
                  const isActive = Boolean(hotel.active);
                  const isActivating = activatingHotelId === hotel.id;
                  return (
                    <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-slate-400 font-bold">#{hotel.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            <img
                              src={
                                hotel.photos?.[0] ||
                                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                              }
                              alt={hotel.hotelName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{hotel.hotelName}</p>
                            <p className="text-[11px] text-slate-500">
                              {hotel.amenities?.length || 0} Amenities Configured
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {hotel.cityName}
                        </span>
                      </td>
                      <td className="py-4 px-6 space-y-0.5 text-[11px] text-slate-600">
                        {hotel.contactInfo?.email && <p>✉ {hotel.contactInfo.email}</p>}
                        {hotel.contactInfo?.phoneNumber && <p>📞 {hotel.contactInfo.phoneNumber}</p>}
                      </td>
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isActivating}
                            onClick={() => handleActivateHotel(hotel)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Click once to activate hotel (PATCH /admin/hotels/{id}/activate)"
                          >
                            {isActivating ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Activating...</span>
                              </>
                            ) : (
                              <>
                                <Power className="w-3.5 h-3.5" />
                                <span>Activate Hotel</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(hotel.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Hotel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hotel.id, hotel.hotelName)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Hotel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Hotel #${editingHotelId}` : 'Create New Hotel Property'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Name *</label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                placeholder="e.g. Grand Vista Resort"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City Name *</label>
              <input
                type="text"
                value={formData.cityName}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                placeholder="e.g. New York"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Contact Information (Required)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, address: e.target.value },
                    })
                  }
                  placeholder="109 E 42nd St"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, phoneNumber: e.target.value },
                    })
                  }
                  placeholder="+1 (212) 555-0199"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, email: e.target.value },
                    })
                  }
                  placeholder="contact@hotel.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Location / Coordinates (Optional)
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.location || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, location: e.target.value },
                    })
                  }
                  placeholder="40.7580, -73.9855"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Photos (URLs, one per line or comma separated)
            </label>
            <textarea
              rows={2}
              value={photosInput}
              onChange={(e) => setPhotosInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amenities (Comma separated)
            </label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="WIFI, SWIMMING_POOL, SPA, RESTAURANT, FITNESS_CENTER"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
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
              {isSubmitting ? 'Saving Hotel...' : isEditing ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
