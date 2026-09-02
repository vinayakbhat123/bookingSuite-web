import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, MapPin, Sparkles, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { HotelPriceDto } from '../types/api';
import { DEFAULT_HOTEL_PHOTOS, getValidHotelPhotos } from '../utils/imageUtils';

interface HotelCardProps {
  hotel: HotelPriceDto;
  searchContext?: {
    startDate?: string;
    endDate?: string;
    roomsCount?: number;
  };
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, searchContext }) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { convertPrice } = useSettings();

  const isFavorited = isInWishlist(hotel.hotelId);

  const photosList = getValidHotelPhotos(hotel.photos, hotel.hotelId);

  const queryParams = new URLSearchParams();
  if (searchContext?.startDate) queryParams.set('startDate', searchContext.startDate);
  if (searchContext?.endDate) queryParams.set('endDate', searchContext.endDate);
  if (searchContext?.roomsCount) queryParams.set('roomsCount', String(searchContext.roomsCount));

  const targetUrl = `/hotels/${hotel.hotelId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(hotel);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === 0 ? photosList.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === photosList.length - 1 ? 0 : prev + 1));
  };

  // Generate deterministic rating for realistic Airbnb feel
  const ratingVal = (4.7 + (hotel.hotelId % 30) * 0.01).toFixed(2);
  const reviewsCount = 42 + (hotel.hotelId * 17) % 240;
  const isGuestFavorite = (hotel.hotelId % 2 === 0) || (hotel.price > 4000);

  const priceObj = convertPrice(hotel.price);

  return (
    <Link
      to={targetUrl}
      id={`hotel-card-${hotel.hotelId}`}
      className="group flex flex-col bg-transparent rounded-2xl overflow-hidden transition-all duration-300"
    >
      {/* Photo Carousel Container */}
      <div className="relative w-full aspect-[20/19] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs">
        <img
          src={photosList[currentPhotoIdx] || DEFAULT_HOTEL_PHOTOS[0]}
          alt={hotel.hotelName}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== DEFAULT_HOTEL_PHOTOS[0]) {
              target.src = DEFAULT_HOTEL_PHOTOS[0];
            }
          }}
        />

        {/* Carousel Arrow Controls (Visible on hover) */}
        {photosList.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {photosList.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIdx ? 'bg-white scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isGuestFavorite && (
            <span className="px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1 border border-slate-200/50 dark:border-slate-700/50">
              <Sparkles className="w-3 h-3 text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400" />
              <span>Guest favourite</span>
            </span>
          )}
          <span className="px-2.5 py-1 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md rounded-full text-[11px] font-medium text-white shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{hotel.cityName}</span>
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleFavorite}
          aria-label="Save to Wishlist"
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform text-white drop-shadow-md focus:outline-none"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorited
                ? 'fill-rose-500 text-rose-500'
                : 'fill-black/30 text-white stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Details (Airbnb Layout) */}
      <div className="pt-3 pb-1 flex flex-col">
        {/* Title & Rating */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {hotel.hotelName}
          </h3>
          <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white">
            <Star className="w-3.5 h-3.5 fill-slate-900 dark:fill-amber-400 text-slate-900 dark:text-amber-400" />
            <span>{ratingVal}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-normal">({reviewsCount})</span>
          </span>
        </div>

        {/* Subtitle / Distance / Amenity Highlight */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
          {hotel.amenities && hotel.amenities.length > 0
            ? hotel.amenities.slice(0, 3).map((a) => a.replace(/_/g, ' ')).join(' · ')
            : `Heritage Stay in ${hotel.cityName} · Verified Property`}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Individual Host · High-speed WiFi
        </p>

        {/* Dynamic Currency Pricing */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {priceObj.formatted}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">night</span>
        </div>
      </div>
    </Link>
  );
};
