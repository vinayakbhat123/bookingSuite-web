import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const OAuthRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthSuccess, logout } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [statusMessage, setStatusMessage] = useState('Verifying authentication...');

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token') || searchParams.get('access_token');
      const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');
      const error = searchParams.get('error') || searchParams.get('error_description');

      if (error) {
        toastError('OAuth2 Sign-In Failed', decodeURIComponent(error));
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        toastError('Authentication Missing', 'No authentication token was received from OAuth2 provider.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        setStatusMessage('Connecting your profile...');
        const user = await handleOAuthSuccess(token, refreshToken || undefined);

        if (!user || (!user.id && !user.email)) {
          // Empty database / no user record found
          await logout();
          toastError(
            'No User Found',
            'Database is empty or user profile was not found. Please register an account.'
          );
          navigate('/login', { replace: true });
          return;
        }

        toastSuccess('OAuth2 Sign-In Successful', `Welcome, ${user.name || 'Traveler'}!`);

        // Redirect to Landing Page (or Manager portal if manager)
        const isManager =
          user.roles?.includes('HOTEL_MANAGER') ||
          user.roles?.includes('ADMIN') ||
          user.role === 'HOTEL_MANAGER' ||
          user.role === 'ADMIN';

        if (isManager) {
          navigate('/manager', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error('OAuth processing error:', err);
        await logout();
        toastError(
          'Login Error',
          'Could not retrieve user details from database. Redirecting to login.'
        );
        navigate('/login', { replace: true });
      }
    };

    processOAuth();
  }, [searchParams, handleOAuthSuccess, logout, navigate, toastError, toastSuccess]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-600/20 mb-6 animate-pulse">
        <Building2 className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Authenticating with BookingSuite</h2>
      <LoadingSpinner text={statusMessage} />
    </div>
  );
};
