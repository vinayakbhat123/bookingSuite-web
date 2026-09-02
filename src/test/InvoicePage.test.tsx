import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BookingInvoicePage } from '../pages/guest/BookingInvoicePage';
import { bookingService } from '../services/bookingService';
import { ToastProvider } from '../context/ToastContext';
import * as AuthContextModule from '../context/AuthContext';

describe('BookingInvoicePage Component', () => {
  it('renders invoice details correctly for confirmed booking', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        roles: ['GUEST'],
        role: 'GUEST',
      },
      roles: ['GUEST'],
      activeRole: 'GUEST',
      isGuest: true,
      isHotelManager: false,
      isAdmin: false,
      isOwner: false,
      login: vi.fn(),
      loginWithOtp: vi.fn(),
      sendOtp: vi.fn(),
      loginWithRefreshToken: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      refreshUser: vi.fn(),
      handleOAuthSuccess: vi.fn(),
      switchSimulatedRole: vi.fn(),
    });

    vi.spyOn(bookingService, 'getBookingById').mockResolvedValue({
      id: 101,
      hotelId: 1,
      hotelName: 'Seaside Grand Resort',
      cityName: 'Goa',
      roomId: 201,
      roomType: 'DELUXE_OCEAN_VIEW',
      roomNumber: '101',
      checkInDate: '2026-10-01',
      checkOutDate: '2026-10-03',
      roomsCount: 1,
      price: 6000,
      status: 'CONFIRMED',
      guests: [
        { id: 1, name: 'Alice Smith', gender: 'FEMALE', age: 28 }
      ],
      createdAt: '2026-09-01T10:00:00',
      updatedAt: '2026-09-01T10:05:00',
      stripeSessionId: 'cs_test_123456'
    });

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/booking/101/invoice']}>
          <Routes>
            <Route path="/booking/:bookingId/invoice" element={<BookingInvoicePage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

    expect(await screen.findByText(/Tax Invoice & Receipt/i)).toBeInTheDocument();
    expect(await screen.findByText(/Back to Reservations/i)).toBeInTheDocument();
  });
});
