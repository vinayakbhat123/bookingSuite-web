/**
 * Reliable default hotel imagery from Unsplash for verified luxury stays in India.
 */
export const DEFAULT_HOTEL_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
];

const UNRESOLVED_DOMAINS = [
  'images.booking-suite.com',
  'cdn.bookingsuite.com',
  'booking-suite.com',
  'bookingsuite.com/images',
  'example.com',
];

/**
 * Sanitizes an image URL. If missing, invalid, or pointing to an unresolvable domain,
 * returns a safe, high-resolution Unsplash hotel photo.
 */
export function sanitizeImageUrl(url?: string | null, fallbackIndex: number = 0): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_HOTEL_PHOTOS[fallbackIndex % DEFAULT_HOTEL_PHOTOS.length];
  }

  const trimmed = url.trim();

  for (const domain of UNRESOLVED_DOMAINS) {
    if (trimmed.includes(domain)) {
      return DEFAULT_HOTEL_PHOTOS[fallbackIndex % DEFAULT_HOTEL_PHOTOS.length];
    }
  }

  return trimmed;
}

/**
 * Returns a guaranteed array of valid photo URLs for a hotel.
 */
export function getValidHotelPhotos(photos?: string[] | null, hotelId: number = 0): string[] {
  if (photos && Array.isArray(photos) && photos.length > 0) {
    const cleaned = photos
      .map((p, idx) => sanitizeImageUrl(p, (hotelId + idx) % DEFAULT_HOTEL_PHOTOS.length))
      .filter((p) => Boolean(p));
    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return [
    DEFAULT_HOTEL_PHOTOS[hotelId % DEFAULT_HOTEL_PHOTOS.length],
    DEFAULT_HOTEL_PHOTOS[(hotelId + 1) % DEFAULT_HOTEL_PHOTOS.length],
    DEFAULT_HOTEL_PHOTOS[(hotelId + 2) % DEFAULT_HOTEL_PHOTOS.length],
  ];
}
