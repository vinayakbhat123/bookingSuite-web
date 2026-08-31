import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';
export type UiDensity = 'comfortable' | 'compact';
export type TravelArchetype = 'solo' | 'couple' | 'family' | 'business' | 'pet_friendly';

export interface UserSettings {
  // Appearance
  theme: ThemeMode;
  accentColor: AccentColor;
  currency: CurrencyCode;
  uiDensity: UiDensity;
  highContrast: boolean;

  // Privacy & Security
  twoFactorEnabled: boolean;
  profileVisibility: 'public' | 'private' | 'verified_only';
  shareActivityStatus: boolean;
  allowPersonalizedRecommendations: boolean;
  allowMarketingEmails: boolean;
  allowSmsAlerts: boolean;

  // Cool Frontend Features
  smartPriceDropAlerts: boolean;
  instantAutoBook: boolean;
  travelArchetype: TravelArchetype;
  showCurrencyConversionTool: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  accentColor: 'rose',
  currency: 'INR',
  uiDensity: 'comfortable',
  highContrast: false,

  twoFactorEnabled: false,
  profileVisibility: 'public',
  shareActivityStatus: true,
  allowPersonalizedRecommendations: true,
  allowMarketingEmails: true,
  allowSmsAlerts: false,

  smartPriceDropAlerts: true,
  instantAutoBook: false,
  travelArchetype: 'couple',
  showCurrencyConversionTool: true,
  reducedMotion: false,
};

// Conversion rates relative to base INR
export const CURRENCY_RATES: Record<CurrencyCode, { rate: number; symbol: string; label: string; flag: string }> = {
  INR: { rate: 1, symbol: '₹', label: 'Indian Rupee (INR)', flag: '🇮🇳' },
  USD: { rate: 0.012, symbol: '$', label: 'US Dollar (USD)', flag: '🇺🇸' },
  EUR: { rate: 0.011, symbol: '€', label: 'Euro (EUR)', flag: '🇪🇺' },
  GBP: { rate: 0.0095, symbol: '£', label: 'British Pound (GBP)', flag: '🇬🇧' },
  AED: { rate: 0.044, symbol: 'AED ', label: 'UAE Dirham (AED)', flag: '🇦🇪' },
  JPY: { rate: 1.85, symbol: '¥', label: 'Japanese Yen (JPY)', flag: '🇯🇵' },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  convertPrice: (inrAmount: number) => { formatted: string; amount: number; symbol: string };
  exportUserData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'bookingsuite_user_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const { success: toastSuccess, info: toastInfo } = useToast();

  // Apply dark mode & theme class to html/document element
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to local storage
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    toastSuccess('Settings Saved', 'Your account preferences have been updated.');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toastInfo('Settings Reset', 'Default application settings have been restored.');
  };

  const convertPrice = (inrAmount: number) => {
    const curr = settings.currency;
    const config = CURRENCY_RATES[curr] || CURRENCY_RATES.INR;
    const converted = inrAmount * config.rate;

    let formatted = '';
    if (curr === 'INR') {
      formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(inrAmount);
    } else if (curr === 'USD') {
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(converted);
    } else if (curr === 'EUR') {
      formatted = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(converted);
    } else if (curr === 'GBP') {
      formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      }).format(converted);
    } else if (curr === 'JPY') {
      formatted = new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
      }).format(converted);
    } else {
      formatted = `${config.symbol}${Math.round(converted).toLocaleString()}`;
    }

    return {
      formatted,
      amount: converted,
      symbol: config.symbol,
    };
  };

  const exportUserData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        settings,
        activeBaseUrl: localStorage.getItem('bookingsuite_api_base_url'),
        wishlist: JSON.parse(localStorage.getItem('bookingsuite_wishlist_items') || '[]'),
        activeRole: localStorage.getItem('bookingsuite_active_role'),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookingsuite-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toastSuccess('Data Exported', 'Your account settings & wishlist archive has been downloaded.');
    } catch {
      toastInfo('Export Failed', 'Could not export user data.');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
        convertPrice,
        exportUserData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
