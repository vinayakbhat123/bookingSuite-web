import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { hotelService } from '../../services/hotelService';
import { HotelResponse, Role } from '../../types/api';
import { checkHasRole, normalizeRole } from '../../utils/roleUtils';
import { CategoriesManagementPage } from './CategoriesManagementPage';
import { CuratedRegionsManagementPage } from './CuratedRegionsManagementPage';
import { HotelBookingsPage } from './HotelBookingsPage';
import { HotelReportsPage } from './HotelReportsPage';
import { HotelsManagementPage } from './HotelsManagementPage';
import { InventoryManagementPage } from './InventoryManagementPage';
import { ManagerDashboardPage } from './ManagerDashboardPage';
import { RoomsManagementPage } from './RoomsManagementPage';

export type ManagerSection =
  | 'overview'
  | 'hotels'
  | 'rooms'
  | 'inventory'
  | 'bookings'
  | 'reports'
  | 'regions'
  | 'categories';

export const ManagerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, roles, activeRole, isAuthenticated, isLoading, logout } = useAuth();
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeSection, setActiveSection] = useState<ManagerSection>('overview');
  const [visitedSections, setVisitedSections] = useState<Set<ManagerSection>>(
    new Set<ManagerSection>(['overview'])
  );

  // Centralized role verification for Manager Portal
  const userRoleList: Role[] = [
    ...roles,
    activeRole,
    ...(user?.roles || []),
    user?.role ? normalizeRole(user.role) : undefined,
  ].filter(Boolean) as Role[];

  const allowedManagerRoles: Role[] = ['HOTEL_MANAGER', 'ADMIN', 'OWNER'];
  const hasManagerAccess = isAuthenticated && checkHasRole(userRoleList, allowedManagerRoles);

  const handleSelectSection = (section: ManagerSection) => {
    setActiveSection(section);
    setVisitedSections((prev) => {
      if (prev.has(section)) return prev;
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  };

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
    if (!hasManagerAccess) return;
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
    if (hasManagerAccess) {
      loadHotels();
    }
  }, [hasManagerAccess]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Verifying manager permissions..." />
      </div>
    );
  }

  // Centralized Access Denied Guard View
  if (!hasManagerAccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              The Manager Portal is restricted to authorized property operators. Required roles:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                HOTEL_MANAGER | ADMIN | OWNER
              </strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5 font-mono">
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-white">Current Account:</span>{' '}
              {user?.email || (isAuthenticated ? 'Signed In (Guest)' : 'Not Signed In')}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-white">Active Role:</span>{' '}
              {roles.length > 0 ? roles.join(', ') : 'GUEST'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login?redirect=/manager"
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors text-center shadow-xs"
            >
              Sign In as Manager
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: {
    id: ManagerSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hotels', label: 'Hotels Portfolio', icon: Building2 },
    { id: 'rooms', label: 'Room Types', icon: BedDouble },
    { id: 'inventory', label: 'Inventory & Surge', icon: Layers },
    { id: 'bookings', label: 'Hotel Bookings', icon: CalendarDays },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'regions', label: 'Featured Regions', icon: Compass },
    { id: 'categories', label: 'Categories & Tabs', icon: Sparkles },
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
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
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

      {/* Mobile/Tablet Horizontal Tabs */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 bg-slate-100/70 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Manager Navigation Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-2">
            <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
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
                  </button>
                );
              })}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer text-left"
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

          {/* Manager Consolidated View Body */}
          <main className="lg:col-span-9">
            {visitedSections.has('overview') && (
              <div className={activeSection === 'overview' ? 'block' : 'hidden'}>
                <ManagerDashboardPage
                  hotels={hotels}
                  selectedHotelId={selectedHotelId}
                  onNavigateSection={(sec) => handleSelectSection(sec as ManagerSection)}
                />
              </div>
            )}

            {visitedSections.has('hotels') && (
              <div className={activeSection === 'hotels' ? 'block' : 'hidden'}>
                <HotelsManagementPage onHotelChange={loadHotels} />
              </div>
            )}

            {visitedSections.has('rooms') && (
              <div className={activeSection === 'rooms' ? 'block' : 'hidden'}>
                <RoomsManagementPage
                  hotels={hotels}
                  selectedHotelId={selectedHotelId}
                />
              </div>
            )}

            {visitedSections.has('inventory') && (
              <div className={activeSection === 'inventory' ? 'block' : 'hidden'}>
                <InventoryManagementPage
                  hotels={hotels}
                  selectedHotelId={selectedHotelId}
                />
              </div>
            )}

            {visitedSections.has('bookings') && (
              <div className={activeSection === 'bookings' ? 'block' : 'hidden'}>
                <HotelBookingsPage
                  hotels={hotels}
                  selectedHotelId={selectedHotelId}
                />
              </div>
            )}

            {visitedSections.has('reports') && (
              <div className={activeSection === 'reports' ? 'block' : 'hidden'}>
                <HotelReportsPage
                  hotels={hotels}
                  selectedHotelId={selectedHotelId}
                />
              </div>
            )}

            {visitedSections.has('regions') && (
              <div className={activeSection === 'regions' ? 'block' : 'hidden'}>
                <CuratedRegionsManagementPage />
              </div>
            )}

            {visitedSections.has('categories') && (
              <div className={activeSection === 'categories' ? 'block' : 'hidden'}>
                <CategoriesManagementPage />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
