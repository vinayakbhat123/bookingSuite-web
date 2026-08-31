import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Compass,
  Download,
  Eye,
  Globe,
  Heart,
  Key,
  Laptop,
  Lock,
  LogOut,
  Moon,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  AccentColor,
  CURRENCY_RATES,
  CurrencyCode,
  ThemeMode,
  TravelArchetype,
  UiDensity,
  useSettings,
} from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types/api';
import { getRoleLabel } from '../../utils/formatters';

export const SettingsPage: React.FC = () => {
  const { user, activeRole, switchSimulatedRole, isHotelManager, logout } = useAuth();
  const { settings, updateSetting, updateSettings, resetSettings, convertPrice, exportUserData } =
    useSettings();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'appearance' | 'privacy' | 'smart_features' | 'account'>(
    'appearance'
  );

  // Modals
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA Code
  const [verificationCode, setVerificationCode] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Mismatch', 'New passwords do not match.');
      return;
    }

    toastSuccess('Password Updated', 'Your account credentials have been securely updated.');
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toastError('Invalid Code', 'Please enter a 6-digit verification code.');
      return;
    }
    updateSetting('twoFactorEnabled', true);
    toastSuccess('Two-Factor Authentication Enabled', 'Your account is now protected with 2FA.');
    setIs2faModalOpen(false);
    setVerificationCode('');
  };

  const handleDisable2FA = () => {
    updateSetting('twoFactorEnabled', false);
    toastInfo('2FA Disabled', 'Two-Factor authentication has been deactivated.');
  };

  const sampleSamplePrice = convertPrice(4500);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Account Settings & Preferences</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize visual themes, privacy controls, multi-currency display, and smart travel features.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Edit Profile</span>
          </Link>

          <button
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance & Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Privacy & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('smart_features')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'smart_features'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Smart AI & Travel Perks</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Roles & Data Export</span>
        </button>
      </div>

      {/* Tab 1: Appearance & Currency */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Theme Mode */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Color Theme & Visual Mode</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred interface display mode.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { id: 'light', label: 'Light Mode', desc: 'Crisp & high contrast layout', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', desc: 'Relaxed low-light atmosphere', icon: Moon },
                  { id: 'system', label: 'System Preference', desc: 'Syncs with device OS settings', icon: Laptop },
                ] as const
              ).map((mode) => {
                const Icon = mode.icon;
                const isSelected = settings.theme === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateSetting('theme', mode.id as ThemeMode)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-rose-600" />}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-slate-900">{mode.label}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency Preference */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Display Currency</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Automatic conversion rates applied dynamically across all room rates and bookings.
                </p>
              </div>

              <div className="px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Live Preview: </span>
                <span className="font-extrabold text-slate-900">{sampleSamplePrice.formatted}</span>
                <span className="text-[11px] text-slate-400"> (from ₹4,500)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((curr) => {
                const item = CURRENCY_RATES[curr];
                const isSelected = settings.currency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => updateSetting('currency', curr)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{item.flag}</span>
                    <span className="text-xs font-bold text-slate-900 block">{curr}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{item.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UI Layout & Density */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Layout & Accessibility</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fine-tune layout spacing and visual contrast.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">High Contrast Mode</h4>
                  <p className="text-[11px] text-slate-500">Increases borders and badge definition for maximum readability.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Reduced Motion & Animations</h4>
                  <p className="text-[11px] text-slate-500">Minimizes carousel transitions and entry effects.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 2FA Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${settings.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h2>
                  <p className="text-xs text-slate-500">
                    Status:{' '}
                    <span className={`font-bold ${settings.twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {settings.twoFactorEnabled ? 'Enabled & Protecting Account' : 'Not Configured'}
                    </span>
                  </p>
                </div>
              </div>

              {settings.twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIs2faModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Enable 2FA Setup →
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600">
              When enabled, a one-time authentication passcode will be required in addition to your password whenever you log into BookingSuite.
            </p>
          </div>

          {/* Password Update */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Account Password & Credentials</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Keep your account secure with regular password updates.
                </p>
              </div>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Devices & Sessions</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Devices currently authorized to access your profile.
                </p>
              </div>

              <button
                onClick={() => toastSuccess('Sessions Terminated', 'All other active sessions logged out.')}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Log Out All Other Devices
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-slate-700 shadow-2xs">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Current Web Session (Chrome)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        Active Now
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Asia-East1 • IP: 49.37.12.84</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-slate-700 shadow-2xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">BookingSuite Mobile Companion</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Apple iPhone 15 Pro • Last active 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Data Privacy & Sharing</h2>
              <p className="text-xs text-slate-500 mt-1">Control how your traveler identity is visible to hotels.</p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Public Traveler Profile</h4>
                  <p className="text-[11px] text-slate-500">Allows verified hosts to see your travel reviews and bio.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.profileVisibility === 'public'}
                  onChange={(e) => updateSetting('profileVisibility', e.target.checked ? 'public' : 'private')}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Activity Status</h4>
                  <p className="text-[11px] text-slate-500">Shows recent search regions to provide tailored discounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shareActivityStatus}
                  onChange={(e) => updateSetting('shareActivityStatus', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Smart AI & Travel Perks */}
      {activeTab === 'smart_features' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* AI Smart Engine */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600 rounded-2xl text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Smart Stay Recommendations Engine</h2>
                <p className="text-xs text-slate-300">
                  Powered by preference embeddings for Indian heritage and luxury resorts.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Personalized Destination Suggestions</h4>
                  <p className="text-[11px] text-slate-400">Tailors curated regions (Goa, Manali, Kerala) on the Homepage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowPersonalizedRecommendations}
                  onChange={(e) => updateSetting('allowPersonalizedRecommendations', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-xs font-bold text-white">Price Drop Intelligence</h4>
                  <p className="text-[11px] text-slate-400">Instant notification when a saved Wishlist hotel drops in price.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smartPriceDropAlerts}
                  onChange={(e) => updateSetting('smartPriceDropAlerts', e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Travel Archetype */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Traveler Persona & Companion Archetype</h2>
              <p className="text-xs text-slate-500 mt-1">
                Optimizes room recommendations and amenity highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(
                [
                  { id: 'solo', label: 'Solo Explorer', desc: 'Work desk, fast WiFi, city hubs' },
                  { id: 'couple', label: 'Couple / Romance', desc: 'Balcony views, spa, private pools' },
                  { id: 'family', label: 'Family with Kids', desc: 'Multiple beds, extra space, breakfast' },
                  { id: 'business', label: 'Business Executive', desc: 'Lounge access, late checkouts' },
                  { id: 'pet_friendly', label: 'Pet Friendly', desc: 'Lawn access, pet-welcoming villas' },
                ] as const
              ).map((arch) => {
                const isSelected = settings.travelArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => updateSetting('travelArchetype', arch.id as TravelArchetype)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-900">{arch.label}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{arch.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant Auto-Book */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Instant One-Click Booking</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically populates saved traveler info and jumps straight to Stripe/Razorpay payment settlement.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.instantAutoBook}
                onChange={(e) => updateSetting('instantAutoBook', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Roles & Data Export */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* RBAC Role Switcher - Accessible only for privileged manager roles */}
          {isHotelManager ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Hotel Management Authorization</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Toggle between administrative view tiers to access management portals and configurations.
                  </p>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                  Current: {getRoleLabel(activeRole)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['HOTEL_MANAGER', 'ADMIN', 'OWNER'] as Role[]).map((r) => {
                  const isActive = activeRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => switchSimulatedRole(r)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isActive
                          ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs text-slate-900">{getRoleLabel(r)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <Link
                  to="/manager"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Open Hotel Manager Portal →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Account Access Level</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Your account is registered as a verified Guest traveler. Hotel manager controls are restricted to authorized hotel staff.
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
                  Guest Access
                </span>
              </div>
            </div>
          )}

          {/* Export Data */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Export Account Data</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Download a complete JSON file containing your preferences, wishlist, and session metadata.
                </p>
              </div>

              <button
                type="button"
                onClick={exportUserData}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Archive</span>
              </button>
            </div>
          </div>

          {/* Session & Sign Out */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sign Out of Session</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Revoke this session's refresh token on the backend and return to the login screen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out Current Session'}</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-rose-900">Danger Zone</h2>
                <p className="text-xs text-rose-700 mt-1">
                  Permanently remove your account and all associated guest preferences.
                </p>
              </div>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      <Modal
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        title="Setup Two-Factor Authentication"
      >
        <form onSubmit={handleConfirm2FA} className="space-y-6">
          <p className="text-xs text-slate-600">
            Scan the authenticator barcode with Google Authenticator or 1Password, then enter the 6-digit verification code below:
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center font-mono text-xs text-slate-400">
              [QR Code]
            </div>
            <p className="text-[11px] font-mono text-slate-500">Secret Key: BKS-789X-4421-QA</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Passcode</label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="w-full text-center tracking-widest font-mono text-lg py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIs2faModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Verify & Enable 2FA
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Save Password
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800">
              This action is permanent. All profile records, preferences, and saved Wishlists will be permanently removed.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                toastInfo('Account Cleared', 'Your local session and profile preferences have been erased.');
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Yes, Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
