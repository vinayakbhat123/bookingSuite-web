import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { useWishlist, WishlistItem } from '../../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { convertPrice } = useSettings();
  const { success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  const uniqueCities = Array.from(new Set(wishlist.map((item) => item.cityName))).filter(Boolean);

  const filteredItems = wishlist
    .filter((item) => selectedCity === 'ALL' || item.cityName === selectedCity)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toastSuccess('Link Copied!', 'Wishlist link copied to your clipboard.');
    } else {
      toastSuccess('Wishlist Active', 'Share this URL with friends and family.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[75vh]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2 border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            <span>Saved Stays</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Properties you've saved for upcoming journeys across India.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWishlist}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Share Wishlist</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all saved properties?')) {
                  clearWishlist();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="Your Wishlist is Empty"
            description="Explore luxury hotels, beachside resorts, and heritage palaces, then tap the heart icon to save your favourites."
            actionLabel="Explore Incredible India Stays →"
            onAction={() => navigate('/')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            {/* City Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCity('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCity === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                All Cities ({wishlist.length})
              </button>
              {uniqueCities.map((city) => {
                const count = wishlist.filter((w) => w.cityName === city).length;
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCity === city
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {city} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="recent">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <WishlistCardItem
                key={item.hotelId}
                item={item}
                onRemove={() => removeFromWishlist(item.hotelId)}
                convertPrice={convertPrice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface WishlistCardItemProps {
  item: WishlistItem;
  onRemove: () => void;
  convertPrice: (amount: number) => { formatted: string; amount: number; symbol: string };
}

const WishlistCardItem: React.FC<WishlistCardItemProps> = ({ item, onRemove, convertPrice }) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = item.photos && item.photos.length > 0 ? item.photos : [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
  ];

  const priceObj = convertPrice(item.price);
  const ratingVal = (4.7 + (item.hotelId % 30) * 0.01).toFixed(2);

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden">
      {/* Image Carousel */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={photos[photoIdx] || photos[0]}
          alt={item.hotelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
          }}
        />

        {/* Remove Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from Wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-rose-600 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
        </button>

        {/* City Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{item.cityName}</span>
          </span>
        </div>

        {/* Carousel controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
              {item.hotelName}
            </h3>
            <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              <span>{ratingVal}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {item.amenities && item.amenities.length > 0
              ? item.amenities.slice(0, 3).map((a) => a.replace(/_/g, ' ')).join(' • ')
              : `Verified stay in ${item.cityName}`}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-slate-900">{priceObj.formatted}</span>
            <span className="text-xs text-slate-500 font-normal ml-1">/ night</span>
          </div>

          <Link
            to={`/hotels/${item.hotelId}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>Book Stay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
