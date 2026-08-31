import React from 'react';
import {
  Anchor,
  Award,
  BedDouble,
  Building,
  Building2,
  Camera,
  Castle,
  Coffee,
  Compass,
  Crown,
  Flame,
  Flower2,
  Gem,
  Globe2,
  Heart,
  Home,
  Landmark,
  MapPin,
  Mountain,
  Palmtree,
  ShieldCheck,
  Ship,
  Sparkles,
  Sun,
  Sunrise,
  Tent,
  Trees,
  Umbrella,
  Utensils,
  Waves,
  Wine,
  Zap,
} from 'lucide-react';
import { AirbnbCategory, CategoryIconName } from '../types/category';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palmtree,
  Crown,
  Mountain,
  Waves,
  Ship,
  Building2,
  Sunrise,
  Trees,
  Anchor,
  Building,
  Tent,
  Flame,
  Sparkles,
  Castle,
  Compass,
  Coffee,
  Umbrella,
  Utensils,
  Zap,
  Award,
  Heart,
  Sun,
  Flower2,
  Home,
  BedDouble,
  Gem,
  Landmark,
  ShieldCheck,
  Camera,
  Globe2,
  Wine,
  MapPin,
};

export const AVAILABLE_ICONS: { name: CategoryIconName; label: string }[] = [
  { name: 'Palmtree', label: 'Beach & Palms' },
  { name: 'Crown', label: 'Royal & Palaces' },
  { name: 'Mountain', label: 'Himalayas & Hills' },
  { name: 'Waves', label: 'Lakes & Ocean' },
  { name: 'Ship', label: 'Houseboats & Cruise' },
  { name: 'Building2', label: 'City Skylines' },
  { name: 'Sunrise', label: 'Spiritual Ghats' },
  { name: 'Trees', label: 'Tea Estates & Forests' },
  { name: 'Tent', label: 'Luxury Glamping' },
  { name: 'Castle', label: 'Heritage Forts' },
  { name: 'Coffee', label: 'Coorg Plantations' },
  { name: 'Sparkles', label: 'Luxury Boutique' },
  { name: 'Flame', label: 'Desert Safari' },
  { name: 'Anchor', label: 'River Escapes' },
  { name: 'Building', label: 'Urban Suites' },
  { name: 'Gem', label: 'Ultra Luxury' },
  { name: 'Heart', label: 'Honeymoon Suites' },
  { name: 'Sun', label: 'Sunny Retreats' },
  { name: 'Flower2', label: 'Valley Stays' },
  { name: 'Utensils', label: 'Culinary Villas' },
  { name: 'Wine', label: 'Vineyard Stays' },
  { name: 'Landmark', label: 'Monuments' },
  { name: 'Compass', label: 'Adventures' },
  { name: 'Home', label: 'Homestays' },
  { name: 'BedDouble', label: 'Cozy Cottages' },
];

export const renderCategoryIcon = (iconName: string, className = 'w-5 h-5'): React.ReactNode => {
  const IconComponent = ICON_MAP[iconName] || Sparkles;
  return <IconComponent className={className} />;
};

const DEFAULT_CATEGORIES: AirbnbCategory[] = [
  {
    id: 'cat-beachfront',
    name: 'Beachfront',
    city: 'Goa',
    iconName: 'Palmtree',
    tagline: 'Coastal retreats & sun-soaked private villas',
    displayOrder: 1,
    isActive: true,
    badge: 'Popular',
  },
  {
    id: 'cat-palaces',
    name: 'Royal Palaces',
    city: 'Jaipur',
    iconName: 'Crown',
    tagline: 'Heritage havelis & royal fort suites',
    displayOrder: 2,
    isActive: true,
    badge: 'Luxury',
  },
  {
    id: 'cat-himalayas',
    name: 'Himalayas',
    city: 'Manali',
    iconName: 'Mountain',
    tagline: 'Snow view chalets & mountain pine cabins',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-lakefront',
    name: 'Lakefront',
    city: 'Udaipur',
    iconName: 'Waves',
    tagline: 'Romantic palace stays on Lake Pichola',
    displayOrder: 4,
    isActive: true,
    badge: 'Trending',
  },
  {
    id: 'cat-backwaters',
    name: 'Backwaters',
    city: 'Kerala',
    iconName: 'Ship',
    tagline: 'Luxury houseboats & coconut palm lagoons',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-metropolis',
    name: 'Iconic Cities',
    city: 'Mumbai',
    iconName: 'Building2',
    tagline: 'Luxury skyline suites & coastal clubs',
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-spiritual',
    name: 'Spiritual Ghats',
    city: 'Varanasi',
    iconName: 'Sunrise',
    tagline: 'Ganga riverfront heritage properties',
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-plantations',
    name: 'Tea Plantations',
    city: 'Ooty',
    iconName: 'Trees',
    tagline: 'Mist-clad hill stations & colonial bungalows',
    displayOrder: 8,
    isActive: true,
  },
  {
    id: 'cat-glamping',
    name: 'Desert Glamping',
    city: 'Jaisalmer',
    iconName: 'Tent',
    tagline: 'Thar desert luxury royal tents & starlight stays',
    displayOrder: 9,
    isActive: true,
    badge: 'New',
  },
  {
    id: 'cat-yoga',
    name: 'River Escapes',
    city: 'Rishikesh',
    iconName: 'Anchor',
    tagline: 'Ganges wellness resorts & yoga sanctuaries',
    displayOrder: 10,
    isActive: true,
  },
  {
    id: 'cat-tech',
    name: 'Silicon Valley',
    city: 'Bengaluru',
    iconName: 'Building',
    tagline: 'Modern urban luxury & business suites',
    displayOrder: 11,
    isActive: true,
  },
];

const STORAGE_KEY = 'bookingsuite_dynamic_categories_v1';

export const categoryService = {
  getCategories(): AirbnbCategory[] {
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
    return DEFAULT_CATEGORIES;
  },

  getActiveCategories(): AirbnbCategory[] {
    const list = this.getCategories();
    return list.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  saveCategories(categories: AirbnbCategory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      // Dispatch custom event for instant cross-component synchronization
      window.dispatchEvent(new Event('bookingsuite_categories_updated'));
    } catch {
      // ignore
    }
  },

  addCategory(category: Omit<AirbnbCategory, 'id'>): AirbnbCategory {
    const categories = this.getCategories();
    const newCategory: AirbnbCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayOrder: category.displayOrder || categories.length + 1,
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  },

  updateCategory(id: string, updates: Partial<AirbnbCategory>): AirbnbCategory | null {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...updates,
    };
    this.saveCategories(categories);
    return categories[index];
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;
    this.saveCategories(filtered);
    return true;
  },

  resetToDefaults(): AirbnbCategory[] {
    this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },
};
