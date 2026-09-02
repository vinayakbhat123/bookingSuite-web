import React, { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiIntegrationReportModal } from './components/ApiIntegrationReportModal';
import { BackendConnectionBanner } from './components/BackendConnectionBanner';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ApiConfigProvider } from './context/ApiConfigContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

import { LoadingSpinner } from './components/LoadingSkeleton';

// Route-level code-splitting with React.lazy
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const OAuthRedirectPage = React.lazy(() => import('./pages/auth/OAuthRedirectPage').then((m) => ({ default: m.OAuthRedirectPage })));
const AuthErrorPage = React.lazy(() => import('./pages/auth/AuthErrorPage').then((m) => ({ default: m.AuthErrorPage })));
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })));
const BookingFlowPage = React.lazy(() => import('./pages/guest/BookingFlowPage').then((m) => ({ default: m.BookingFlowPage })));
const HomePage = React.lazy(() => import('./pages/guest/HomePage').then((m) => ({ default: m.HomePage })));
const HotelDetailsPage = React.lazy(() => import('./pages/guest/HotelDetailsPage').then((m) => ({ default: m.HotelDetailsPage })));
const MyBookingsPage = React.lazy(() => import('./pages/guest/MyBookingsPage').then((m) => ({ default: m.MyBookingsPage })));
const PaymentSuccessPage = React.lazy(() => import('./pages/guest/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const PaymentFailurePage = React.lazy(() => import('./pages/guest/PaymentFailurePage').then((m) => ({ default: m.PaymentFailurePage })));
const BookingInvoicePage = React.lazy(() => import('./pages/guest/BookingInvoicePage').then((m) => ({ default: m.BookingInvoicePage })));
const ProfilePage = React.lazy(() => import('./pages/guest/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SearchPage = React.lazy(() => import('./pages/guest/SearchPage').then((m) => ({ default: m.SearchPage })));
const SettingsPage = React.lazy(() => import('./pages/guest/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const WishlistPage = React.lazy(() => import('./pages/guest/WishlistPage').then((m) => ({ default: m.WishlistPage })));

// Manager Portal
const ManagerLayout = React.lazy(() => import('./pages/manager/ManagerLayout').then((m) => ({ default: m.ManagerLayout })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export default function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiConfigProvider>
        <ToastProvider>
          <AuthProvider>
            <SettingsProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-rose-500 selection:text-white">
                    {/* Backend Status Top Bar */}
                    <BackendConnectionBanner onOpenReport={() => setIsReportModalOpen(true)} />

                    {/* Navigation Header */}
                    <Navbar onOpenReport={() => setIsReportModalOpen(true)} />

                  {/* Main App Content Views */}
                  <div className="flex-1">
                    <React.Suspense
                      fallback={
                        <div className="min-h-[50vh] flex items-center justify-center p-8">
                          <LoadingSpinner text="Loading view..." />
                        </div>
                      }
                    >
                      <Routes>
                        {/* Public Guest Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
                        <Route path="/booking/flow" element={<BookingFlowPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/auth/error" element={<AuthErrorPage />} />
                        <Route path="/oauth2/redirect" element={<OAuthRedirectPage />} />
                        <Route path="/oauth2/callback" element={<OAuthRedirectPage />} />

                        {/* Payment & Invoice Routes */}
                        <Route path="/payment/success" element={<PaymentSuccessPage />} />
                        <Route path="/payment/failure" element={<PaymentFailurePage />} />
                        <Route
                          path="/bookings/:bookingId/invoice"
                          element={
                            <ProtectedRoute>
                              <BookingInvoicePage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Authenticated Guest Routes */}
                        <Route
                          path="/my-bookings"
                          element={
                            <ProtectedRoute>
                              <MyBookingsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/mybookings" element={<Navigate to="/my-bookings" replace />} />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Hotel Manager & Admin Portal Route - Single Consolidated Application Shell */}
                        <Route
                          path="/manager"
                          element={
                            <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN', 'OWNER']}>
                              <ManagerLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/manager/*" element={<Navigate to="/manager" replace />} />

                        {/* Route Aliases for Admin & Hotel Manager paths */}
                        <Route path="/admin" element={<Navigate to="/manager" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/manager" replace />} />
                        <Route path="/hotel_manager" element={<Navigate to="/manager" replace />} />
                        <Route path="/hotel_manager/*" element={<Navigate to="/manager" replace />} />
                        <Route path="/hotel-manager" element={<Navigate to="/manager" replace />} />
                        <Route path="/hotel-manager/*" element={<Navigate to="/manager" replace />} />
                        <Route path="/admin/hotel_manager" element={<Navigate to="/manager" replace />} />
                        <Route path="/admin/hotel_manager/*" element={<Navigate to="/manager" replace />} />
                        <Route path="/admin/hotel-manager" element={<Navigate to="/manager" replace />} />
                        <Route path="/admin/hotel-manager/*" element={<Navigate to="/manager" replace />} />

                        {/* Fallback 404 */}
                        <Route
                          path="*"
                          element={
                            <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
                              <h2 className="text-3xl font-extrabold text-slate-900">404 - Not Found</h2>
                              <p className="text-xs text-slate-500">
                                The page you are looking for does not exist or has been moved.
                              </p>
                              <Link
                                to="/"
                                className="inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                              >
                                Return Home
                              </Link>
                            </div>
                          }
                        />
                      </Routes>
                    </React.Suspense>
                  </div>

                  {/* Global Footer */}
                  <Footer onOpenReport={() => setIsReportModalOpen(true)} />

                  {/* OpenAPI 31-Operation Verification Modal */}
                  <ApiIntegrationReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                  />
                </div>
              </BrowserRouter>
            </WishlistProvider>
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ApiConfigProvider>
  </QueryClientProvider>
  );
}

