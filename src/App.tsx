import React, { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { ApiIntegrationReportModal } from './components/ApiIntegrationReportModal';
import { BackendConnectionBanner } from './components/BackendConnectionBanner';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ApiConfigProvider } from './context/ApiConfigContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Guest & Public Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { BookingFlowPage } from './pages/guest/BookingFlowPage';
import { HomePage } from './pages/guest/HomePage';
import { HotelDetailsPage } from './pages/guest/HotelDetailsPage';
import { MyBookingsPage } from './pages/guest/MyBookingsPage';
import { ProfilePage } from './pages/guest/ProfilePage';
import { SearchPage } from './pages/guest/SearchPage';

// Manager Portal Pages
import { CategoriesManagementPage } from './pages/manager/CategoriesManagementPage';
import { CuratedRegionsManagementPage } from './pages/manager/CuratedRegionsManagementPage';
import { HotelBookingsPage } from './pages/manager/HotelBookingsPage';
import { HotelReportsPage } from './pages/manager/HotelReportsPage';
import { HotelsManagementPage } from './pages/manager/HotelsManagementPage';
import { InventoryManagementPage } from './pages/manager/InventoryManagementPage';
import { ManagerDashboardPage } from './pages/manager/ManagerDashboardPage';
import { ManagerLayout } from './pages/manager/ManagerLayout';
import { RoomsManagementPage } from './pages/manager/RoomsManagementPage';

export default function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <ApiConfigProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-rose-500 selection:text-white">
              {/* Backend Status Top Bar */}
              <BackendConnectionBanner onOpenReport={() => setIsReportModalOpen(true)} />

              {/* Navigation Header */}
              <Navbar onOpenReport={() => setIsReportModalOpen(true)} />

              {/* Main App Content Views */}
              <div className="flex-1">
                <Routes>
                  {/* Public Guest Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
                  <Route path="/booking/flow" element={<BookingFlowPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Authenticated Guest Routes */}
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Hotel Manager & Admin Portal Routes */}
                  <Route
                    path="/manager"
                    element={
                      <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN', 'OWNER']}>
                        <ManagerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<ManagerDashboardPage />} />
                    <Route path="categories" element={<CategoriesManagementPage />} />
                    <Route path="regions" element={<CuratedRegionsManagementPage />} />
                    <Route path="hotels" element={<HotelsManagementPage />} />
                    <Route path="rooms" element={<RoomsManagementPage />} />
                    <Route path="inventory" element={<InventoryManagementPage />} />
                    <Route path="bookings" element={<HotelBookingsPage />} />
                    <Route path="reports" element={<HotelReportsPage />} />
                  </Route>

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
        </AuthProvider>
      </ToastProvider>
    </ApiConfigProvider>
  );
}
