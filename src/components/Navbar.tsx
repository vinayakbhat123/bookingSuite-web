import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BedDouble,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  Heart,
  Layers,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CURRENCY_RATES, useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { getRoleLabel } from '../utils/formatters';

interface NavbarProps {
  onOpenReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReport }) => {
  const { user, isAuthenticated, isHotelManager, logout, roles } = useAuth();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeRole = roles[0] || 'GUEST';
  const currencyInfo = CURRENCY_RATES[settings.currency] || CURRENCY_RATES.INR;

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Determine home destination based on user role
  const homeDestination = isHotelManager ? '/manager' : '/';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to={homeDestination} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Booking<span className="text-rose-600">Suite</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
                {isHotelManager ? 'Hotel Manager Portal' : 'Incredible India Stays'}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-sm">
            {isHotelManager ? (
              <>
                <Link
                  to="/manager"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/manager/categories"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/categories'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Categories
                </Link>
                <Link
                  to="/manager/regions"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/regions'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Featured Regions
                </Link>
                <Link
                  to="/manager/hotels"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/hotels'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hotels
                </Link>
                <Link
                  to="/manager/rooms"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/rooms'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rooms
                </Link>
                <Link
                  to="/manager/inventory"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/inventory'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inventory
                </Link>
                <Link
                  to="/manager/bookings"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/bookings'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bookings
                </Link>
                <Link
                  to="/manager/reports"
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/manager/reports'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reports
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Explore Stays
                </Link>
                <Link
                  to="/search"
                  className={`px-4 py-2 rounded-full font-medium transition-all text-xs ${
                    location.pathname === '/search'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Find Hotels
                </Link>
                <Link
                  to="/wishlist"
                  className={`relative px-4 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-1.5 ${
                    location.pathname === '/wishlist'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
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
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Bookings
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Currency Quick-Tag */}
            <Link
              to="/settings"
              title="Change Currency & Appearance"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <span>{currencyInfo.flag}</span>
              <span>{settings.currency}</span>
            </Link>

            {/* Wishlist Quick Icon */}
            <Link
              to="/wishlist"
              title="Saved Wishlist"
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
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
              className="p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </Link>

            {/* Profile or Auth Controls */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-all bg-white"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {user?.name || user?.email || 'My Account'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                          {getRoleLabel(activeRole)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>My Wishlist</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {isHotelManager ? (
                      <Link
                        to="/manager"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-700 font-semibold hover:bg-rose-50 transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Manager Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            {isHotelManager ? (
              <>
                <Link
                  to="/manager"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </Link>
                <Link
                  to="/manager/categories"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Homepage Categories</span>
                </Link>
                <Link
                  to="/manager/regions"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Featured Regions & Images</span>
                </Link>
                <Link
                  to="/manager/hotels"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Manage Hotels</span>
                </Link>
                <Link
                  to="/manager/rooms"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <BedDouble className="w-4 h-4 text-slate-400" />
                  <span>Manage Rooms</span>
                </Link>
                <Link
                  to="/manager/inventory"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Inventory & Surge</span>
                </Link>
                <Link
                  to="/manager/bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <span>Hotel Bookings</span>
                </Link>
                <Link
                  to="/manager/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  <span>Revenue Reports</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Hotels</span>
                </Link>
                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Search Hotels</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name || 'User'})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl"
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
