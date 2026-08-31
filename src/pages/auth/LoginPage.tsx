import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, handleOAuthSuccess } = useAuth();
  const { baseUrl } = useApiConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: toastError, info: toastInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '/';

  // Check if redirected back with OAuth2 token from Spring Boot backend
  useEffect(() => {
    const token = queryParams.get('token') || queryParams.get('access_token');
    const refreshToken = queryParams.get('refreshToken');
    const errorParam = queryParams.get('error');

    if (errorParam) {
      toastError('OAuth2 Failed', 'Authentication failed or user was not found.');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      handleOAuthSuccess(token, refreshToken || undefined)
        .then((loggedUser) => {
          if (!loggedUser || (!loggedUser.email && !loggedUser.id)) {
            toastError('No User Found', 'No user found in database. Please register.');
            navigate('/login', { replace: true });
            return;
          }

          const isManager =
            loggedUser.roles?.includes('HOTEL_MANAGER') ||
            loggedUser.roles?.includes('ADMIN') ||
            loggedUser.role === 'HOTEL_MANAGER' ||
            loggedUser.role === 'ADMIN';

          if (isManager) {
            navigate('/manager', { replace: true });
          } else {
            // Redirect to landing page as requested
            navigate('/', { replace: true });
          }
        })
        .catch(() => {
          toastError('Login Error', 'Could not authenticate user profile.');
          navigate('/login', { replace: true });
        });
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Validation Error', 'Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email, password });
      const isManager =
        loggedUser.roles?.includes('HOTEL_MANAGER') ||
        loggedUser.roles?.includes('ADMIN') ||
        loggedUser.role === 'HOTEL_MANAGER' ||
        loggedUser.role === 'ADMIN';

      if (isManager) {
        navigate('/manager', { replace: true });
      } else {
        // Guest user goes to home page or saved non-manager redirect
        navigate(redirectUrl && !redirectUrl.startsWith('/manager') ? redirectUrl : '/', {
          replace: true,
        });
      }
    } catch {
      // toast shown in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleOAuthLogin = () => {
    setOauthLoading('google');
    const backendServerRoot = baseUrl.replace(/\/api\/v1\/?$/, '');
    const oauthEndpoint = `${backendServerRoot}/oauth2/authorization/google`;

    toastInfo(
      'Google OAuth2',
      `Redirecting to Spring Security OAuth2 endpoint: ${oauthEndpoint}`
    );

    // Attempt to redirect to Spring Boot OAuth2 authorization endpoint
    setTimeout(() => {
      window.location.href = oauthEndpoint;
    }, 300);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white mx-auto shadow-md shadow-rose-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to BookingSuite</h1>
          <p className="text-xs text-slate-500">
            Sign in with your backend credentials or Google account
          </p>
        </div>

        {/* OAuth2 Providers */}
        <div className="space-y-2.5">
          {/* Google OAuth2 */}
          <button
            type="button"
            onClick={handleGoogleOAuthLogin}
            disabled={isSubmitting || !!oauthLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 transition-colors shadow-2xs disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <LoadingSpinner className="py-0" text="Redirecting to Google..." />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            or sign in with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoadingSpinner className="py-0" text="Authenticating with Backend..." />
            ) : (
              <span>Sign In with Spring Boot Backend →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/signup" className="text-rose-600 font-bold hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};
