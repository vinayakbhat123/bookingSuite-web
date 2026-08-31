import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isHotelManagerRole } from '../../utils/roleUtils';

export const OAuthRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthSuccess, logout } = useAuth();
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [statusMessage, setStatusMessage] = useState('Verifying authentication...');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processOAuth = async () => {
      const token =
        searchParams.get('accessToken') ||
        searchParams.get('token') ||
        searchParams.get('access_token') ||
        searchParams.get('AccessToken');
      const refreshToken =
        searchParams.get('refreshToken') ||
        searchParams.get('refresh_token') ||
        searchParams.get('RefreshToken');
      const error =
        searchParams.get('error') ||
        searchParams.get('error_description') ||
        searchParams.get('errorMessage');

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

      // Clean the tokens from the browser address bar immediately
      try {
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
      } catch {
        // Ignore
      }

      try {
        setStatusMessage('Connecting your profile...');
        const user = await handleOAuthSuccess(token, refreshToken || undefined);

        // Redirect based on resolved user role
        const isManager = isHotelManagerRole(user.roles || [user.role]);

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
          'Could not retrieve user details after OAuth sign-in. Redirecting to login.'
        );
        navigate('/login', { replace: true });
      }
    };

    processOAuth();
  }, [searchParams, handleOAuthSuccess, logout, navigate, toastError]);

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

