import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BedDouble,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hotelService } from '../../services/hotelService';
import { HotelResponse } from '../../types/api';

export const ManagerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const loadHotels = async () => {
    try {
      const list = await hotelService.getAdminHotels();
      setHotels(list || []);
      if (list && list.length > 0 && !selectedHotelId) {
        setSelectedHotelId(list[0].id);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const navItems = [
    { label: 'Overview', path: '/manager', icon: LayoutDashboard },
    { label: 'Categories & Tabs', path: '/manager/categories', icon: Sparkles },
    { label: 'Featured Regions', path: '/manager/regions', icon: Compass },
    { label: 'Hotels Portfolio', path: '/manager/hotels', icon: Building2 },
    { label: 'Room Types', path: '/manager/rooms', icon: BedDouble },
    { label: 'Inventory & Surge', path: '/manager/inventory', icon: Layers },
    { label: 'Hotel Bookings', path: '/manager/bookings', icon: CalendarDays },
    { label: 'Financial Reports', path: '/manager/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Manager Sub-Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Manager Workspace
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-900 text-white rounded-md">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Property & Operations Management
              </p>
            </div>
          </div>

          {/* Quick Hotel Selector for room/inventory/report views */}
          {hotels.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Active Hotel:</span>
              <select
                value={selectedHotelId || ''}
                onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hotelName} ({h.cityName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Manager Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/manager'
                    ? location.pathname === '/manager'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Stats Helper Widget */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">Hotel Portfolio</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold">
                  {hotels.length} Properties
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All inventory edits and cancellations dispatch real backend transactions.
              </p>
            </div>
          </aside>

          {/* Manager View Body */}
          <main className="lg:col-span-9">
            <Outlet context={{ hotels, selectedHotelId, reloadHotels: loadHotels }} />
          </main>
        </div>
      </div>
    </div>
  );
};
