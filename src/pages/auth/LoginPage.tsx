import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Lock, Mail, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSkeleton';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getGoogleOAuthAuthorizationUrl } from '../../utils/oauthUtils';

export const LoginPage: React.FC = () => {
  const { login, loginWithOtp, sendOtp, handleOAuthSuccess } = useAuth();
  const { baseUrl } = useApiConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: toastError, info: toastInfo, success: toastSuccess } = useToast();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP Login State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '/';

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if redirected back with OAuth2 token from backend
  useEffect(() => {
    const token = queryParams.get('token') || queryParams.get('access_token');
    const refreshToken = queryParams.get('refreshToken');
    const errorParam = queryParams.get('error');

    if (errorParam) {
      toastError('Authentication Failed', 'Authentication failed or user was not found.');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      handleOAuthSuccess(token, refreshToken || undefined)
        .then((loggedUser) => {
          if (!loggedUser || (!loggedUser.email && !loggedUser.id)) {
            toastError('No Account Found', 'No account found with this profile. Please create an account.');
            navigate('/login', { replace: true });
            return;
          }

          const isManager =
            loggedUser.roles?.includes('HOTEL_MANAGER') ||
            loggedUser.roles?.includes('ADMIN') ||
            loggedUser.roles?.includes('OWNER') ||
            loggedUser.role === 'HOTEL_MANAGER' ||
            loggedUser.role === 'ADMIN' ||
            loggedUser.role === 'OWNER';

          if (isManager) {
            navigate('/manager', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch(() => {
          toastError('Sign In Error', 'Could not authenticate user profile.');
          navigate('/login', { replace: true });
        });
    }
  }, [location.search]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Validation Error', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email, password });
      const isManager =
        loggedUser.roles?.includes('HOTEL_MANAGER') ||
        loggedUser.roles?.includes('ADMIN') ||
        loggedUser.roles?.includes('OWNER') ||
        loggedUser.role === 'HOTEL_MANAGER' ||
        loggedUser.role === 'ADMIN' ||
        loggedUser.role === 'OWNER';

      if (isManager) {
        navigate('/manager', { replace: true });
      } else {
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toastError('Invalid Email', 'Please enter a valid email address to receive OTP.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendOtp(email.trim());
      setOtpSent(true);
      setResendCooldown(60);
      toastSuccess('OTP Code Sent', `A 6-digit one-time passcode was sent to ${email}`);
    } catch (err: any) {
      // toast shown in auth context
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!email || !cleanOtp) {
      toastError('Validation Error', 'Please enter both email and the 6-digit OTP code.');
      return;
    }

    if (cleanOtp.length < 4) {
      toastError('Invalid OTP', 'Please enter a complete OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const loggedUser = await loginWithOtp(email.trim(), cleanOtp);
      const isManager =
        loggedUser.roles?.includes('HOTEL_MANAGER') ||
        loggedUser.roles?.includes('ADMIN') ||
        loggedUser.roles?.includes('OWNER') ||
        loggedUser.role === 'HOTEL_MANAGER' ||
        loggedUser.role === 'ADMIN' ||
        loggedUser.role === 'OWNER';

      if (isManager) {
        navigate('/manager', { replace: true });
      } else {
        navigate(redirectUrl && !redirectUrl.startsWith('/manager') ? redirectUrl : '/', {
          replace: true,
        });
      }
    } catch {
      // toast shown in auth context
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleOAuthLogin = () => {
    setOauthLoading('google');
    const oauthEndpoint = getGoogleOAuthAuthorizationUrl(baseUrl);

    toastInfo(
      'Google Sign-In',
      'Redirecting to Google authentication...'
    );

    setTimeout(() => {
      window.location.href = oauthEndpoint;
    }, 300);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white mx-auto shadow-md shadow-rose-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back. Sign in to access your bookings and manage properties.
          </p>
        </div>

        {/* OAuth2 Providers */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleOAuthLogin}
            disabled={isSubmitting || isSendingOtp || isVerifyingOtp || !!oauthLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
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
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Auth Mode Toggle Tabs (Password vs Email OTP) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'password'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'otp'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Email OTP</span>
          </button>
        </div>

        {/* Mode 1: Email & Password Form */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <LoadingSpinner className="py-0" text="Signing in..." />
              ) : (
                <span>Sign In with Password →</span>
              )}
            </button>
          </form>
        )}

        {/* Mode 2: One-Time Passcode (OTP) Form */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Email Address for OTP
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    We'll send a 6-digit verification code to your inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp || !email}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <LoadingSpinner className="py-0" text="Sending OTP Code..." />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send One-Time Passcode</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">OTP Sent To</span>
                    <span className="font-bold text-slate-900 dark:text-white">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 text-base tracking-widest font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={resendCooldown > 0 || isSendingOtp}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || !otpCode || otpCode.length < 4}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <LoadingSpinner className="py-0" text="Verifying Code..." />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify OTP & Sign In →</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Don't have an account?{' '}
          <Link to="/signup" className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
