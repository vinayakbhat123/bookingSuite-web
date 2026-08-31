import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, MapPin, Search } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { HotelCard } from '../../components/HotelCard';
import { HotelCardSkeleton } from '../../components/LoadingSkeleton';
import { SearchBar } from '../../components/SearchBar';
import { useToast } from '../../context/ToastContext';
import { hotelService } from '../../services/hotelService';
import { HotelSearchRequest, PageHotelPriceDto } from '../../types/api';
import { formatDateForApi, getDaysAhead, getTomorrow } from '../../utils/dateUtils';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error: toastError } = useToast();

  const city = searchParams.get('city') || 'Goa';
  const startDate = searchParams.get('startDate') || formatDateForApi(getTomorrow());
  const endDate = searchParams.get('endDate') || formatDateForApi(getDaysAhead(4));
  const roomsCount = Number(searchParams.get('roomsCount')) || 1;
  const pageNumber = Number(searchParams.get('page')) || 0;
  const pageSize = 9;

  const [searchResult, setSearchResult] = useState<PageHotelPriceDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const requestPayload: HotelSearchRequest = {
      city,
      startDate,
      endDate,
      roomsCount,
      pageNumber,
      pageSize,
      dateRangeValid: true,
    };

    try {
      const data = await hotelService.searchHotels(requestPayload);
      setSearchResult(data);
    } catch (err: any) {
      const msg =
        typeof err === 'string'
          ? err
          : 'Unable to query hotels from backend. Please verify that your Spring Boot server is reachable.';
      setErrorMsg(msg);
      toastError('Search Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [city, startDate, endDate, roomsCount, pageNumber]);

  // Synchronize when hotels are added/updated in the manager portal
  useEffect(() => {
    const handleHotelsUpdate = () => {
      fetchSearchResults();
    };
    window.addEventListener('bookingsuite_hotels_updated', handleHotelsUpdate);
    return () => {
      window.removeEventListener('bookingsuite_hotels_updated', handleHotelsUpdate);
    };
  }, [city, startDate, endDate, roomsCount, pageNumber]);

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewSearch = (params: {
    city: string;
    startDate: string;
    endDate: string;
    roomsCount: number;
  }) => {
    setSearchParams({
      city: params.city,
      startDate: params.startDate,
      endDate: params.endDate,
      roomsCount: String(params.roomsCount),
      page: '0',
    });
  };

  const hotels = searchResult?.content || [];
  const totalPages = searchResult?.totalPages || 0;
  const totalElements = searchResult?.totalElements || hotels.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Controls */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200/80">
        <SearchBar
          initialCity={city}
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialRoomsCount={roomsCount}
          onSearch={handleNewSearch}
          compact
        />
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hotels in <span className="text-rose-600">{city}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading
              ? 'Searching real-time inventory...'
              : `Found ${totalElements} available hotels for ${roomsCount} ${
                  roomsCount === 1 ? 'room' : 'rooms'
                }`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            {startDate} → {endDate}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : errorMsg ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <h3 className="font-bold text-rose-900 text-base">Backend Search Request Failed</h3>
          <p className="text-xs text-rose-800 max-w-md mx-auto">{errorMsg}</p>
          <button
            onClick={fetchSearchResults}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
          >
            Retry Search
          </button>
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState
          title="No Available Hotels Found"
          description={`We couldn't find any hotels matching "${city}" with availability for the selected dates. Try modifying dates or city.`}
          actionLabel="Search 'Goa'"
          onAction={() => handleNewSearch({ city: 'Goa', startDate, endDate, roomsCount: 1 })}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                searchContext={{ startDate, endDate, roomsCount }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber <= 0}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx)}
                    className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                      pageNumber === idx
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages - 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
