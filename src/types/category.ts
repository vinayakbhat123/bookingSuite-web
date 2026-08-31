export interface AirbnbCategory {
  id: string;
  name: string;
  city: string;
  iconName: string;
  tagline: string;
  displayOrder: number;
  isActive: boolean;
  badge?: string;
  customPhotoUrl?: string;
}

export type CategoryIconName =
  | 'Palmtree'
  | 'Crown'
  | 'Mountain'
  | 'Waves'
  | 'Ship'
  | 'Building2'
  | 'Sunrise'
  | 'Trees'
  | 'Anchor'
  | 'Building'
  | 'Tent'
  | 'Flame'
  | 'Sparkles'
  | 'Castle'
  | 'Compass'
  | 'Coffee'
  | 'Umbrella'
  | 'Utensils'
  | 'Zap'
  | 'Award'
  | 'Heart'
  | 'Sun'
  | 'Flower2'
  | 'Home'
  | 'BedDouble'
  | 'Gem'
  | 'Landmark'
  | 'ShieldCheck'
  | 'Camera'
  | 'Globe2'
  | 'Wine'
  | 'MapPin';
