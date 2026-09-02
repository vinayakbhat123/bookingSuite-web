import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LogIn, RefreshCw, ShieldAlert } from 'lucide-react';

export const AuthErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get('reason') || searchParams.get('error') || 'unknown';

  const getErrorDetails = () => {
    switch (reason.toLowerCase()) {
      case 'oauth_failed':
      case 'google_failed':
        return {
          title: 'Google Sign-In Incomplete',
          description:
            'We were unable to complete your Google authentication. This could happen if permissions were declined or if the sign-in was cancelled.',
          actionText: 'Retry Google Sign-In',
        };
      case 'access_denied':
        return {
          title: 'Access Denied',
          description:
            'You do not have permission to access this portal or resource. Please sign in with an authorized account.',
          actionText: 'Sign In with Another Account',
        };
      case 'session_expired':
        return {
          title: 'Session Expired',
          description:
            'Your secure login session has expired due to inactivity. Please sign in again to continue managing your bookings.',
          actionText: 'Sign In Again',
        };
      case 'invalid_state':
        return {
          title: 'Authentication State Invalid',
          description:
            'The sign-in request could not be verified. For your security, please restart the sign-in flow.',
          actionText: 'Start Over',
        };
      default:
        return {
          title: 'Authentication Failed',
          description:
            'We encountered a problem while verifying your identity. Please try signing in again or return to the home page.',
          actionText: 'Try Again',
        };
    }
  };

  const errorInfo = getErrorDetails();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {errorInfo.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {errorInfo.description}
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{errorInfo.actionText}</span>
          </button>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
