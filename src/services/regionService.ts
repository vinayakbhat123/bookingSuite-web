import { CuratedRegion } from '../types/region';

export const POPULAR_DESTINATION_PHOTOS: { label: string; city: string; url: string }[] = [
  {
    label: 'Goa - Tropical Beaches & Sunsets',
    city: 'Goa',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Jaipur - Royal Pink City & Palaces',
    city: 'Jaipur',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Udaipur - Pichola Lake & Floating Palaces',
    city: 'Udaipur',
    url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Manali - Snowy Himalayan Pine Forests',
    city: 'Manali',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kerala - Alleppey Backwaters & Palms',
    city: 'Kerala',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Varanasi - Sacred Ganges Ghats',
    city: 'Varanasi',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Mumbai - Marine Drive & Sea Link',
    city: 'Mumbai',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Ooty - Nilgiri Tea Plantations & Mists',
    city: 'Ooty',
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Rishikesh - Ganges Valley & Yoga Retreats',
    city: 'Rishikesh',
    url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Jaisalmer - Golden Sand Dunes & Fort',
    city: 'Jaisalmer',
    url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Bengaluru - Garden City & Modern Luxury',
    city: 'Bengaluru',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Shimla - Colonial Ridge & Pine Hills',
    city: 'Shimla',
    url: 'https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&auto=format&fit=crop&q=80',
  },
];

const DEFAULT_REGIONS: CuratedRegion[] = [
  {
    id: 'region-goa',
    city: 'Goa',
    title: 'Goa Coastline',
    subtitle: 'Vibrant beach clubs & Portuguese luxury villas',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    avgPrice: '₹3,800',
    displayOrder: 1,
    isActive: true,
    tag: 'Beachfront Paradise',
  },
  {
    id: 'region-jaipur',
    city: 'Jaipur',
    title: 'Pink City, Jaipur',
    subtitle: 'Royal Rajput havelis & opulent courtyard suites',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    avgPrice: '₹4,500',
    displayOrder: 2,
    isActive: true,
    tag: 'Royal Heritage',
  },
  {
    id: 'region-udaipur',
    city: 'Udaipur',
    title: 'Udaipur, Lake City',
    subtitle: 'Romantic palace stays over shimmering waters',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
    avgPrice: '₹6,200',
    displayOrder: 3,
    isActive: true,
    tag: 'Lakeside Palaces',
  },
  {
    id: 'region-manali',
    city: 'Manali',
    title: 'Manali, Himachal',
    subtitle: 'Alpine cedar cottages with snow peak vistas',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    avgPrice: '₹3,200',
    displayOrder: 4,
    isActive: true,
    tag: 'Snow Peaks',
  },
];

const STORAGE_KEY = 'bookingsuite_curated_regions_v1';

export const regionService = {
  getRegions(): CuratedRegion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => a.displayOrder - b.displayOrder);
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_REGIONS;
  },

  getActiveRegions(): CuratedRegion[] {
    const list = this.getRegions();
    return list.filter((r) => r.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  saveRegions(regions: CuratedRegion[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
      window.dispatchEvent(new Event('bookingsuite_regions_updated'));
    } catch {
      // ignore
    }
  },

  addRegion(region: Omit<CuratedRegion, 'id'>): CuratedRegion {
    const regions = this.getRegions();
    const newRegion: CuratedRegion = {
      ...region,
      id: `region-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayOrder: region.displayOrder || regions.length + 1,
    };
    regions.push(newRegion);
    this.saveRegions(regions);
    return newRegion;
  },

  updateRegion(id: string, updates: Partial<CuratedRegion>): CuratedRegion | null {
    const regions = this.getRegions();
    const index = regions.findIndex((r) => r.id === id);
    if (index === -1) return null;

    regions[index] = {
      ...regions[index],
      ...updates,
    };
    this.saveRegions(regions);
    return regions[index];
  },

  deleteRegion(id: string): boolean {
    const regions = this.getRegions();
    const filtered = regions.filter((r) => r.id !== id);
    if (filtered.length === regions.length) return false;
    this.saveRegions(filtered);
    return true;
  },

  resetToDefaults(): CuratedRegion[] {
    this.saveRegions(DEFAULT_REGIONS);
    return DEFAULT_REGIONS;
  },
};
