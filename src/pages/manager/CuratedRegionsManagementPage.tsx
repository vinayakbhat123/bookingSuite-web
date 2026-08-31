import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Compass,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  IndianRupee,
  Link as LinkIcon,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  POPULAR_DESTINATION_PHOTOS,
  regionService,
} from '../../services/regionService';
import { CuratedRegion } from '../../types/region';

export const CuratedRegionsManagementPage: React.FC = () => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [regions, setRegions] = useState<CuratedRegion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<CuratedRegion | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    city: string;
    title: string;
    subtitle: string;
    image: string;
    avgPrice: string;
    displayOrder: number;
    isActive: boolean;
    tag: string;
  }>({
    city: 'Goa',
    title: '',
    subtitle: '',
    image: POPULAR_DESTINATION_PHOTOS[0].url,
    avgPrice: '₹3,500',
    displayOrder: 1,
    isActive: true,
    tag: '',
  });

  const loadRegions = () => {
    const list = regionService.getRegions();
    setRegions(list);
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const openCreateModal = () => {
    setEditingRegion(null);
    setFormData({
      city: 'Goa',
      title: 'Goa Coastline',
      subtitle: 'Tropical beach resorts, private pool villas & sunset clubs',
      image: POPULAR_DESTINATION_PHOTOS[0].url,
      avgPrice: '₹3,500',
      displayOrder: regions.length + 1,
      isActive: true,
      tag: 'Beach Haven',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (region: CuratedRegion) => {
    setEditingRegion(region);
    setFormData({
      city: region.city,
      title: region.title,
      subtitle: region.subtitle,
      image: region.image,
      avgPrice: region.avgPrice,
      displayOrder: region.displayOrder,
      isActive: region.isActive,
      tag: region.tag || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toastError('Validation Error', 'Please enter a region title');
      return;
    }
    if (!formData.city.trim()) {
      toastError('Validation Error', 'Please specify a target city');
      return;
    }
    if (!formData.image.trim()) {
      toastError('Validation Error', 'Please provide or select a photo URL');
      return;
    }

    // Format price if user omitted currency symbol
    let formattedPrice = formData.avgPrice.trim();
    if (formattedPrice && !formattedPrice.startsWith('₹')) {
      formattedPrice = `₹${formattedPrice}`;
    }

    if (editingRegion) {
      regionService.updateRegion(editingRegion.id, {
        city: formData.city.trim(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image.trim(),
        avgPrice: formattedPrice || '₹3,500',
        displayOrder: Number(formData.displayOrder) || 1,
        isActive: formData.isActive,
        tag: formData.tag.trim() || undefined,
      });
      toastSuccess('Destination Updated', `"${formData.title}" showcase card updated.`);
    } else {
      regionService.addRegion({
        city: formData.city.trim(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image.trim(),
        avgPrice: formattedPrice || '₹3,500',
        displayOrder: Number(formData.displayOrder) || regions.length + 1,
        isActive: formData.isActive,
        tag: formData.tag.trim() || undefined,
      });
      toastSuccess('Destination Added', `"${formData.title}" is now featured on the guest homepage.`);
    }

    setIsModalOpen(false);
    loadRegions();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the featured regions showcase?`)) {
      regionService.deleteRegion(id);
      toastInfo('Destination Removed', `"${title}" was deleted.`);
      loadRegions();
    }
  };

  const handleToggleActive = (region: CuratedRegion) => {
    const nextState = !region.isActive;
    regionService.updateRegion(region.id, { isActive: nextState });
    toastSuccess(
      nextState ? 'Region Visible' : 'Region Hidden',
      `"${region.title}" is now ${nextState ? 'visible to guests' : 'hidden from homepage'}.`
    );
    loadRegions();
  };

  const handleMoveOrder = (region: CuratedRegion, direction: 'up' | 'down') => {
    const sorted = [...regions].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((r) => r.id === region.id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const prevOrder = prev.displayOrder;
      prev.displayOrder = region.displayOrder;
      region.displayOrder = prevOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const nextOrder = next.displayOrder;
      next.displayOrder = region.displayOrder;
      region.displayOrder = nextOrder;
    }

    regionService.saveRegions(sorted);
    loadRegions();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset featured destination cards back to defaults?')) {
      regionService.resetToDefaults();
      toastInfo('Showcase Reset', 'Default featured regions restored.');
      loadRegions();
    }
  };

  const filteredRegions = regions.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = regions.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Featured Travel Regions & Showcase Images
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-resolution destination cover images, pricing highlights, and travel region cards featured on the guest homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset to default regions"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination Region</span>
          </button>
        </div>
      </div>

      {/* Live Preview Strip */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Homepage Showcase Preview
            </span>
            <span className="text-[11px] text-slate-500">
              ({activeCount} active cards displayed to guests)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Interactive click filters for guests
          </span>
        </div>

        {/* Live Mini Showcase Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {regions
            .filter((r) => r.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((region) => (
              <div
                key={region.id}
                className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-xs group"
              >
                <img
                  src={region.image}
                  alt={region.title}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = POPULAR_DESTINATION_PHOTOS[0].url;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 text-white space-y-0.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-600 rounded inline-block">
                    From {region.avgPrice}/night
                  </span>
                  <p className="font-bold text-xs text-white truncate">{region.title}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{region.subtitle}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search featured regions by title, city or subtitle..."
            className="w-full pl-10 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredRegions.length} of {regions.length} total regions
        </div>
      </div>

      {/* Regions Cards Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRegions.map((region) => (
          <div
            key={region.id}
            className={`bg-white rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
              region.isActive
                ? 'border-slate-200 shadow-xs hover:border-slate-300'
                : 'border-slate-200/60 opacity-60'
            }`}
          >
            {/* Region Image Header */}
            <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
              <img
                src={region.image}
                alt={region.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = POPULAR_DESTINATION_PHOTOS[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Status and Badge overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{region.city}</span>
                </span>
                {region.tag && (
                  <span className="px-2.5 py-1 bg-rose-600/90 rounded-full text-[10px] font-bold text-white">
                    {region.tag}
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => handleToggleActive(region)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1 transition-all ${
                    region.isActive
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-slate-800/90 text-slate-300'
                  }`}
                >
                  {region.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{region.isActive ? 'Active' : 'Hidden'}</span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 rounded-md">
                  From {region.avgPrice}/night
                </span>
                <h3 className="font-bold text-base mt-1 text-white truncate">{region.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {region.subtitle || 'No subtitle provided.'}
              </p>

              {/* Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="font-semibold text-slate-400">Order:</span>
                  <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md">
                    #{region.displayOrder}
                  </span>

                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => handleMoveOrder(region, 'up')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(region, 'down')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(region)}
                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Edit region card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(region.id, region.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete region card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Region Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRegion ? 'Edit Featured Region Card' : 'Add New Featured Region'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Region Showcase Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Goa Coastline, Pink City Jaipur, Lake Pichola"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Filter City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Goa, Jaipur, Udaipur, Manali, Kerala"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description / Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Romantic palace stays over shimmering lake waters"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Photo URL & Image Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              High-Resolution Cover Photo URL *
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            {/* Quick Preset Photos Picker */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                Or choose from high-resolution Indian destination photo presets:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {POPULAR_DESTINATION_PHOTOS.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        image: item.url,
                        city: formData.city || item.city,
                      });
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border text-left group transition-all ${
                      formData.image === item.url
                        ? 'ring-2 ring-rose-500 border-rose-500 scale-102'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                      <span className="text-[9px] font-bold text-white truncate">{item.city}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Image Preview */}
            {formData.image && (
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = POPULAR_DESTINATION_PHOTOS[0].url;
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-semibold">
                  Photo Preview
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Average Price Starting At *
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                  placeholder="₹3,800"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. Royal Forts, Beachfront"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Display on Homepage</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingRegion ? 'Save Changes' : 'Publish Destination Card'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
