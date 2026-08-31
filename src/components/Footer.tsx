import React from 'react';
import { Building2, Globe, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenReport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReport }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Booking<span className="text-rose-600">Suite</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Luxury hotel & room booking platform with verified properties and real-time reservation management.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Guest Experience</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="hover:text-rose-600 transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-rose-600 transition-colors">
                  Manage Reservations
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-rose-600 transition-colors">
                  Guest Profiles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Hotel Managers</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/manager" className="hover:text-rose-600 transition-colors">
                  Manager Workspace
                </Link>
              </li>
              <li>
                <Link to="/manager" className="hover:text-rose-600 transition-colors">
                  Property Portfolio & Rooms
                </Link>
              </li>
              <li>
                <Link to="/manager" className="hover:text-rose-600 transition-colors">
                  Inventory & Financial Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Security & Platform</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>JWT Access Token Security</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <Globe className="w-4 h-4 text-sky-600" />
                {onOpenReport ? (
                  <button
                    type="button"
                    onClick={onOpenReport}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer underline-offset-2 hover:underline"
                  >
                    31 OpenAPI Operations Verified
                  </button>
                ) : (
                  <span>31 OpenAPI Operations Verified</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} BookingSuite Architecture. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Built for <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> hospitality excellence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
