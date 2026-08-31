import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/api';
import { checkHasRole, normalizeRole } from '../utils/roleUtils';
import { LoadingSpinner } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, roles, activeRole, switchSimulatedRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Verifying credentials and roles..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleList: Role[] = [
      ...roles,
      activeRole,
      ...(user?.roles || []),
      user?.role ? normalizeRole(user.role) : undefined,
    ].filter(Boolean) as Role[];

    const hasAccess = checkHasRole(userRoleList, allowedRoles);

    if (!hasAccess) {
      return (
        <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This management portal requires one of the following roles: <br />
              <strong className="text-slate-800 font-mono">
                {allowedRoles.map((r) => normalizeRole(r)).join(' | ')}
              </strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1 font-mono">
            <p className="text-slate-600">
              <span className="font-bold text-slate-800">User Account:</span> {user?.email || 'Authenticated User'}
            </p>
            <p className="text-slate-600">
              <span className="font-bold text-slate-800">Assigned Roles:</span>{' '}
              {roles.length > 0 ? roles.join(', ') : 'GUEST'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => switchSimulatedRole('HOTEL_MANAGER')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Enable Hotel Manager Role</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

