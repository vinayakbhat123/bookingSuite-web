import React, { createContext, useContext, useEffect, useState } from 'react';
import { HotelPriceDto, HotelResponse } from '../types/api';
import { useToast } from './ToastContext';

export interface WishlistItem {
  hotelId: number;
  hotelName: string;
  cityName: string;
  price: number;
  photos: string[];
  amenities: string[];
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (hotelId: number) => boolean;
  addToWishlist: (hotel: HotelPriceDto | HotelResponse | WishlistItem) => void;
  removeFromWishlist: (hotelId: number) => void;
  toggleWishlist: (hotel: HotelPriceDto | HotelResponse | WishlistItem) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'bookingsuite_wishlist_items';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success: toastSuccess, info: toastInfo } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('bookingsuite_wishlist_updated', { detail: wishlist }));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  const isInWishlist = (hotelId: number): boolean => {
    return wishlist.some((item) => item.hotelId === hotelId);
  };

  const normalizeToWishlistItem = (
    hotel: HotelPriceDto | HotelResponse | WishlistItem
  ): WishlistItem => {
    const hotelId = 'hotelId' in hotel ? (hotel as any).hotelId : (hotel as any).id;
    const hotelName = hotel.hotelName || 'Luxury Hotel';
    const cityName = hotel.cityName || 'India';
    const price = (hotel as any).price || 3500;
    const photos =
      hotel.photos && hotel.photos.length > 0
        ? hotel.photos
        : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
    const amenities = hotel.amenities || ['WIFI', 'SWIMMING_POOL', 'RESTAURANT'];

    return {
      hotelId,
      hotelName,
      cityName,
      price,
      photos,
      amenities,
      addedAt: (hotel as any).addedAt || new Date().toISOString(),
    };
  };

  const addToWishlist = (hotel: HotelPriceDto | HotelResponse | WishlistItem) => {
    const item = normalizeToWishlistItem(hotel);
    if (!isInWishlist(item.hotelId)) {
      setWishlist((prev) => [item, ...prev]);
      toastSuccess('Saved to Wishlist', `${item.hotelName} added to your saved stays.`);
    }
  };

  const removeFromWishlist = (hotelId: number) => {
    const target = wishlist.find((i) => i.hotelId === hotelId);
    setWishlist((prev) => prev.filter((i) => i.hotelId !== hotelId));
    if (target) {
      toastInfo('Removed from Wishlist', `${target.hotelName} removed from saved stays.`);
    }
  };

  const toggleWishlist = (hotel: HotelPriceDto | HotelResponse | WishlistItem): boolean => {
    const hotelId = 'hotelId' in hotel ? (hotel as any).hotelId : (hotel as any).id;
    if (isInWishlist(hotelId)) {
      removeFromWishlist(hotelId);
      return false;
    } else {
      addToWishlist(hotel);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    toastInfo('Wishlist Cleared', 'All saved properties have been removed.');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
