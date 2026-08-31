import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  UserCheck,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Role, UserProfileRequest, UserResponse } from '../../types/api';
import { getRoleLabel } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, roles, activeRole, switchSimulatedRole, isHotelManager, logout } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [formData, setFormData] = useState<UserProfileRequest>({
    name: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    gender: 'PREFER_NOT_TO_SAY',
    bio: '',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data: UserResponse = await userService.getMe();
      setFormData({
        name: data.name || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        birthDate: data.birthDate || '',
        gender: data.gender || 'PREFER_NOT_TO_SAY',
        bio: data.bio || '',
      });
    } catch (err: any) {
      if (user) {
        setFormData({
          name: user.name || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          birthDate: user.birthDate || '',
          gender: user.gender || 'PREFER_NOT_TO_SAY',
          bio: user.bio || '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toastError('Validation Error', 'First name must be at least 2 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile(formData);
      await refreshUser();
      toastSuccess('Profile Updated', 'Your profile details have been saved on the backend.');
    } catch (err: any) {
      toastError('Update Failed', typeof err === 'string' ? err : err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <LoadingSpinner text="Retrieving your profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, contact methods, and role permissions.
        </p>
      </div>

      {/* Role & Access Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 rounded-2xl text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Role-Based Access Control (RBAC)</h2>
              <p className="text-xs text-slate-400">
                Active View Role: <span className="font-mono text-rose-400 font-bold">{getRoleLabel(activeRole)}</span>
              </p>
            </div>
          </div>

          {isHotelManager && (
            <Link
              to="/manager"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Hotel Manager Portal →</span>
            </Link>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-slate-300">
            Switch your active view role to access administrative features and management portals:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {(['HOTEL_MANAGER', 'ADMIN', 'OWNER', 'GUEST'] as Role[]).map((r) => {
              const isActive = activeRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchSimulatedRole(r)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all text-xs ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-slate-500'}`} />
                  <span>{getRoleLabel(r)}</span>
                  {isActive && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold uppercase">
            {formData.name ? formData.name[0] : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {formData.name} {formData.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <Shield className="w-3 h-3" />
                <span>{getRoleLabel(activeRole)}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ID #{user?.id || '—'}</span>
            </div>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || 'guest@bookingsuite.com'}
                  disabled
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400">Account login email managed by auth</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Birth Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender || 'PREFER_NOT_TO_SAY'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="NON_BINARY">Non-Binary</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About You</label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell hosts about your travel interests..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Account'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
