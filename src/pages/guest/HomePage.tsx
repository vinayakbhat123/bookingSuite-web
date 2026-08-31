import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Anchor,
  Award,
  Building,
  Building2,
  CalendarCheck,
  Castle,
  CheckCircle2,
  Compass,
  CreditCard,
  Crown,
  Flame,
  Globe2,
  Heart,
  Landmark,
  MapPin,
  Mountain,
  Palmtree,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
  Sunrise,
  Trees,
  Umbrella,
  Utensils,
  Waves,
  Zap,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { HotelCard } from '../../components/HotelCard';
import { HotelCardSkeleton } from '../../components/LoadingSkeleton';
import { SearchBar } from '../../components/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { categoryService, renderCategoryIcon } from '../../services/categoryService';
import { hotelService } from '../../services/hotelService';
import { regionService } from '../../services/regionService';
import { HotelPriceDto, HotelResponse, PageHotelPriceDto } from '../../types/api';
import { AirbnbCategory } from '../../types/category';
import { CuratedRegion } from '../../types/region';
import { formatDateForApi, getDaysAhead, getTomorrow } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

const POPULAR_INDIAN_DESTINATIONS = [
  'All',
  'Goa',
  'Jaipur',
  'Mumbai',
  'Udaipur',
  'Manali',
  'Kerala',
  'Bengaluru',
  'New Delhi',
  'Varanasi',
  'Rishikesh',
  'Ooty',
  'Shimla',
];

export const HomePage: React.FC = () => {
  const { isAuthenticated, isHotelManager, isAdmin, isOwner, user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AirbnbCategory[]>(() =>
    categoryService.getActiveCategories()
  );
  const [regions, setRegions] = useState<CuratedRegion[]>(() =>
    regionService.getActiveRegions()
  );
  const [activeCategory, setActiveCategory] = useState<string>(() =>
    categories.length > 0 ? categories[0].id : 'cat-beachfront'
  );
  const [selectedCity, setSelectedCity] = useState<string>(() =>
    categories.length > 0 ? categories[0].city : 'Goa'
  );
  const [featuredHotels, setFeaturedHotels] = useState<HotelPriceDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [totalHotelsCount, setTotalHotelsCount] = useState<number>(0);

  // Synchronize dynamic category updates made in Hotel Manager admin
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      const active = categoryService.getActiveCategories();
      setCategories(active);
    };
    window.addEventListener('bookingsuite_categories_updated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('bookingsuite_categories_updated', handleCategoriesUpdate);
    };
  }, []);

  // Synchronize dynamic curated region updates made in Hotel Manager admin
  useEffect(() => {
    const handleRegionsUpdate = () => {
      const active = regionService.getActiveRegions();
      setRegions(active);
    };
    window.addEventListener('bookingsuite_regions_updated', handleRegionsUpdate);
    return () => {
      window.removeEventListener('bookingsuite_regions_updated', handleRegionsUpdate);
    };
  }, []);

  // Synchronize dynamic hotel updates created or modified in Hotel Manager
  useEffect(() => {
    const handleHotelsUpdate = () => {
      loadHotels(selectedCity);
    };
    window.addEventListener('bookingsuite_hotels_updated', handleHotelsUpdate);
    return () => {
      window.removeEventListener('bookingsuite_hotels_updated', handleHotelsUpdate);
    };
  }, [selectedCity]);

  // Auto-redirect Hotel Manager to manager admin portal
  useEffect(() => {
    if (isAuthenticated && isHotelManager) {
      navigate('/manager', { replace: true });
    }
  }, [isAuthenticated, isHotelManager, navigate]);

  const startDate = formatDateForApi(getTomorrow());
  const endDate = formatDateForApi(getDaysAhead(4));

  const loadHotels = async (cityToSearch: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const cityQuery = cityToSearch === 'All' ? '' : cityToSearch;

      // Primary: Query the public search API endpoint (POST /hotels/search)
      const searchRes = await hotelService.searchHotels({
        city: cityQuery,
        startDate,
        endDate,
        roomsCount: 1,
        pageNumber: 0,
        pageSize: 24,
      });

      let loadedHotels: HotelPriceDto[] = searchRes?.content || [];

      // If user is logged in as manager/admin and search returned 0 items, check admin catalogue
      if (loadedHotels.length === 0 && (isAdmin || isHotelManager)) {
        try {
          const adminHotels: HotelResponse[] = await hotelService.getAdminHotels();
          if (adminHotels && adminHotels.length > 0) {
            loadedHotels = adminHotels.map((h) => ({
              hotelId: h.id,
              hotelName: h.hotelName,
              cityName: h.cityName || 'India',
              photos: h.photos && h.photos.length > 0 ? h.photos : undefined,
              amenities: h.amenities && h.amenities.length > 0 ? h.amenities : undefined,
              price: 2500 + ((h.id * 750) % 6000),
            }));

            if (cityQuery) {
              loadedHotels = loadedHotels.filter(
                (h) =>
                  h.cityName.toLowerCase().includes(cityQuery.toLowerCase()) ||
                  cityQuery.toLowerCase().includes(h.cityName.toLowerCase())
              );
            }
          }
        } catch {
          // Ignore admin fallback error
        }
      }

      setFeaturedHotels(loadedHotels);
      setTotalHotelsCount(searchRes?.totalElements ?? loadedHotels.length);
    } catch (err: any) {
      console.warn('Unable to query hotels from backend:', err);
      setErrorMsg(
        typeof err === 'string'
          ? err
          : 'Could not retrieve hotels from backend server. Please verify your backend API connection.'
      );
      setFeaturedHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotels(selectedCity);
  }, [selectedCity]);

  const handleCategorySelect = (category: AirbnbCategory) => {
    setActiveCategory(category.id);
    setSelectedCity(category.city);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Airbnb Hero & Search Section */}
      <section className="relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-rose-50/40 via-white to-white dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Tag */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-xs text-rose-700 dark:text-rose-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-rose-600 dark:fill-rose-500 text-rose-600 dark:text-rose-500" />
              <span>Incredible India • Verified Luxury Hotel Stays</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Find hotels, luxury villas & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 dark:from-rose-400 dark:via-rose-300 dark:to-amber-300">
                heritage stays across India
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Real-time room availability, guaranteed instant confirmations, and transparent pricing in Indian Rupees (₹).
            </p>
          </div>

          {/* Airbnb Floating Pill Search Bar */}
          <div className="pt-2">
            <SearchBar
              initialCity={selectedCity}
              initialStartDate={startDate}
              initialEndDate={endDate}
            />
          </div>
        </div>
      </section>

      {/* Airbnb Categories Horizontal Bar */}
      <section className="sticky top-18 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => {
              const isActive =
                activeCategory === cat.id ||
                selectedCity.toLowerCase() === cat.city.toLowerCase();
              return (
                <button
                  key={cat.id}
                  id={`home-category-${cat.id}`}
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex flex-col items-center gap-1.5 pb-2 transition-all shrink-0 group relative ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-bold opacity-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {renderCategoryIcon(cat.iconName, 'w-5 h-5')}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] whitespace-nowrap tracking-tight">{cat.name}</span>
                    {cat.badge && (
                      <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 uppercase">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  {/* Airbnb Underline Bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-rose-500 rounded-full animate-in fade-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area: Live Dynamic Hotel Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* City Filter Pills & Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Stays in {selectedCity}</span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {isLoading ? 'Searching...' : `${totalHotelsCount} properties available`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live room rates and inventory updated in real time
            </p>
          </div>

          {/* Quick Indian City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_INDIAN_DESTINATIONS.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Hotel Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="p-8 rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-3">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-base">Backend Connection Notice</h3>
            <p className="text-xs text-amber-800 dark:text-amber-400 max-w-md mx-auto">{errorMsg}</p>
            <button
              onClick={() => loadHotels(selectedCity)}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Retry Live Query
            </button>
          </div>
        ) : featuredHotels.length === 0 ? (
          <EmptyState
            title={`No hotels currently found in ${selectedCity === 'All' ? 'the catalog' : selectedCity}`}
            description="Explore our other popular Indian holiday destinations or browse all available properties."
            actionLabel={selectedCity === 'All' ? 'View Goa Stays' : 'View All Stays'}
            onAction={() => setSelectedCity(selectedCity === 'All' ? 'Goa' : 'All')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                searchContext={{ startDate, endDate, roomsCount: 1 }}
              />
            ))}
          </div>
        )}

        {/* Airbnb Curated Indian Destinations Showcase */}
        {regions.length > 0 && (
          <section id="homepage-curated-regions" className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Explore Top Indian Travel Regions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  From Goa's tropical palms to Rajasthan's imperial forts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {regions.map((region) => (
                <div
                  key={region.id}
                  id={`home-region-${region.id}`}
                  onClick={() => {
                    setSelectedCity(region.city);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer aspect-[4/5] bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={region.image}
                    alt={region.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Tag */}
                  {region.tag && (
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20">
                        {region.tag}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-5 text-white space-y-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-600/90 inline-block">
                      From {region.avgPrice}/night
                    </span>
                    <h3 className="font-bold text-lg text-white group-hover:text-rose-300 transition-colors">
                      {region.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{region.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Airbnb Trust & Features Section */}
        <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 dark:bg-slate-900/90 dark:border dark:border-slate-800 text-white space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              BookingSuite Assurance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Direct Hotel Reservations. <br />
              Zero Hidden Markups.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every room inventory record, price surge factor, and booking transition is authoritatively managed and verified in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Guaranteed Reservations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents double-booking collisions via enterprise transaction management and verified inventory locks.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Transparent Surge Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time surge multipliers configured by hotel managers provide full visibility into seasonal peak demand pricing.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Stripe & UPI Payments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant payment session generation in Indian Rupee (₹) with automatic booking lifecycle status updates.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
