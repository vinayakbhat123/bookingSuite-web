import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { formatDateForApi, getDaysAhead, getTomorrow } from '../utils/dateUtils';

interface SearchBarProps {
  initialCity?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialRoomsCount?: number;
  onSearch?: (searchParams: {
    city: string;
    startDate: string;
    endDate: string;
    roomsCount: number;
  }) => void;
  compact?: boolean;
}

const INDIAN_POPULAR_DESTINATIONS = [
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
  'Kolkata',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialCity = 'Goa',
  initialStartDate = formatDateForApi(getTomorrow()),
  initialEndDate = formatDateForApi(getDaysAhead(4)),
  initialRoomsCount = 1,
  onSearch,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [roomsCount, setRoomsCount] = useState(initialRoomsCount);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCity = city.trim() || 'Goa';
    const params = {
      city: finalCity,
      startDate,
      endDate,
      roomsCount: Math.max(1, roomsCount),
    };

    if (onSearch) {
      onSearch(params);
    } else {
      const searchParams = new URLSearchParams({
        city: finalCity,
        startDate,
        endDate,
        roomsCount: String(roomsCount),
      });
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`bg-white dark:bg-slate-900 rounded-full p-2 sm:p-2.5 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all hover:shadow-2xl ${
          compact ? 'max-w-4xl mx-auto' : 'max-w-5xl mx-auto'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1 items-center">
          {/* Destination */}
          <div className="relative md:col-span-4 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer">
            <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Where
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 250)}
                placeholder="Search Indian destinations (e.g. Goa, Jaipur)"
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
                required
              />
            </div>

            {/* Quick City Suggestions Dropdown */}
            {showCitySuggestions && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">
                  Popular Indian Destinations
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {INDIAN_POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onMouseDown={() => {
                        setCity(dest);
                        setShowCitySuggestions(false);
                      }}
                      className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{dest}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-auto" />

          {/* Check-In Date */}
          <div className="md:col-span-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-full transition-colors">
            <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Check in
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={startDate}
                min={formatDateForApi(new Date())}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value >= endDate) {
                    setEndDate(formatDateForApi(getDaysAhead(1, new Date(e.target.value))));
                  }
                }}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-auto" />

          {/* Check-Out Date */}
          <div className="md:col-span-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-full transition-colors">
            <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Check out
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={endDate}
                min={startDate || formatDateForApi(getTomorrow())}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Rooms Count & Search Action */}
          <div className="md:col-span-2 flex items-center justify-between gap-2 pl-2 pr-1">
            <div className="px-2 py-1">
              <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase">
                Rooms
              </label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="text-xs font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <option key={num} value={num} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {num} {num === 1 ? 'Room' : 'Rooms'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="search-hotels-button"
              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all shrink-0 hover:scale-105 active:scale-95"
              aria-label="Search hotels"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
