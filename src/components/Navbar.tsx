import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BedDouble,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Compass,
  Contrast,
  Heart,
  Laptop,
  Layers,
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  AccentColor,
  CURRENCY_RATES,
  ThemeMode,
  useSettings,
} from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { getRoleLabel } from '../utils/formatters';

interface NavbarProps {
  onOpenReport?: () => void;
}

const ACCENT_COLORS: { id: AccentColor; label: string; colorClass: string; bgClass: string }[] = [
  { id: 'rose', label: 'Rose Ruby', colorClass: 'bg-rose-500', bgClass: 'text-rose-500' },
  { id: 'indigo', label: 'Indigo Velvet', colorClass: 'bg-indigo-500', bgClass: 'text-indigo-500' },
  { id: 'emerald', label: 'Emerald Oasis', colorClass: 'bg-emerald-500', bgClass: 'text-emerald-500' },
  { id: 'amber', label: 'Amber Royal', colorClass: 'bg-amber-500', bgClass: 'text-amber-500' },
  { id: 'cyan', label: 'Cyan Horizon', colorClass: 'bg-cyan-500', bgClass: 'text-cyan-500' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenReport }) => {
  const { user, isAuthenticated, isHotelManager, logout, roles } = useAuth();
  const { wishlistCount } = useWishlist();
  const { settings, updateSetting } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isThemePopoverOpen, setIsThemePopoverOpen] = useState(false);

  const themePopoverRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const activeRole = roles[0] || 'GUEST';
  const currencyInfo = CURRENCY_RATES[settings.currency] || CURRENCY_RATES.INR;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        themePopoverRef.current &&
        !themePopoverRef.current.contains(e.target as Node)
      ) {
        setIsThemePopoverOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const currentThemeIcon =
    settings.theme === 'dark' ? (
      <Moon className="w-4 h-4 text-indigo-400" />
    ) : settings.theme === 'light' ? (
      <Sun className="w-4 h-4 text-amber-500" />
    ) : (
      <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />
    );

  // Determine home destination based on user role
  const homeDestination = isHotelManager ? '/manager' : '/';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to={homeDestination} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Booking<span className="text-rose-600 dark:text-rose-500">Suite</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                {isHotelManager ? 'Hotel Manager Portal' : 'Incredible India Stays'}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 text-sm">
            {isHotelManager ? (
              <>
                <Link
                  to="/manager"
                  className={`px-4 py-2 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 ${
                    location.pathname === '/manager'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-rose-500" />
                  <span>Manager Workspace</span>
                </Link>
                <Link
                  to="/"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Guest Preview
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Explore Stays
                </Link>
                <Link
                  to="/search"
                  className={`px-4 py-2 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/search'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Find Hotels
                </Link>
                <Link
                  to="/wishlist"
                  className={`relative px-4 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-1.5 ${
                    location.pathname === '/wishlist'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/my-bookings"
                    className={`px-4 py-2 rounded-full font-medium transition-all text-xs ${
                      location.pathname === '/my-bookings'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    My Bookings
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Theme & Visual Mode Toggle Button */}
            <div className="relative" ref={themePopoverRef}>
              <button
                type="button"
                id="header-theme-toggle-btn"
                onClick={() => setIsThemePopoverOpen((prev) => !prev)}
                title="Theme & Visual Appearance"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                aria-label="Toggle Theme and Visual Mode"
              >
                {currentThemeIcon}
                <span className="capitalize hidden lg:inline-block text-[11px] font-semibold">
                  {settings.theme}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings.accentColor === 'indigo'
                      ? 'bg-indigo-500'
                      : settings.accentColor === 'emerald'
                      ? 'bg-emerald-500'
                      : settings.accentColor === 'amber'
                      ? 'bg-amber-500'
                      : settings.accentColor === 'cyan'
                      ? 'bg-cyan-500'
                      : 'bg-rose-500'
                  }`}
                  title={`Accent: ${settings.accentColor}`}
                />
              </button>

              {/* Theme & Visual Mode Popover */}
              {isThemePopoverOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-rose-500" />
                      Theme & Visual Mode
                    </span>
                    <Link
                      to="/settings"
                      onClick={() => setIsThemePopoverOpen(false)}
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                    >
                      More Settings
                    </Link>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Display Mode
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {(
                        [
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'system', label: 'Auto', icon: Laptop },
                        ] as const
                      ).map((m) => {
                        const Icon = m.icon;
                        const isSelected = settings.theme === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateSetting('theme', m.id as ThemeMode)}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Accent Palette */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Accent Color Theme
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {ACCENT_COLORS.map((acc) => {
                        const isSelected = settings.accentColor === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => updateSetting('accentColor', acc.id)}
                            title={acc.label}
                            className={`h-8 rounded-xl flex items-center justify-center transition-transform ${acc.colorClass} ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-900 scale-105'
                                : 'opacity-80 hover:opacity-100 hover:scale-102'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Accessibility Toggles */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] flex items-center gap-1">
                      <Contrast className="w-3.5 h-3.5 text-slate-400" />
                      High Contrast
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSetting('highContrast', !settings.highContrast)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        settings.highContrast
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {settings.highContrast ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Quick-Tag */}
            <Link
              to="/settings"
              title="Change Currency"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{currencyInfo.flag}</span>
              <span>{settings.currency}</span>
            </Link>

            {/* Wishlist Quick Icon */}
            <Link
              to="/wishlist"
              title="Saved Wishlist"
              className="relative p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Settings Shortcut */}
            <Link
              to="/settings"
              title="Account Settings"
              className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </Link>

            {/* Profile or Auth Controls */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  id="user-profile-menu-button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 border border-slate-200 dark:border-slate-700 rounded-full hover:shadow-md transition-all bg-white dark:bg-slate-800"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user?.name || user?.email || 'My Account'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-rose-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800">
                          {getRoleLabel(activeRole)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>My Wishlist</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {isHotelManager ? (
                      <Link
                        to="/manager"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Manager Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Mode"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Accent Theme Picker */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                Color Theme
              </span>
              <span className="text-[10px] text-slate-500 capitalize">{settings.accentColor}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ACCENT_COLORS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => updateSetting('accentColor', acc.id)}
                  className={`h-7 rounded-lg flex items-center justify-center transition-all ${acc.colorClass} ${
                    settings.accentColor === acc.id ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-105' : 'opacity-70'
                  }`}
                >
                  {settings.accentColor === acc.id && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {isHotelManager ? (
              <>
                <Link
                  to="/manager"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Manager Workspace</span>
                </Link>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Guest Portal</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Hotels</span>
                </Link>
                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Search Hotels</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>My Bookings</span>
                  </Link>
                )}
              </>
            )}

            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name || 'User'})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

