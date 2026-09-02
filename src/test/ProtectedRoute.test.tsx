import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('ProtectedRoute Component Access Control', () => {
  it('renders children when user has the required HOTEL_MANAGER role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Manager User',
        email: 'manager@bookingsuite.com',
        roles: ['HOTEL_MANAGER'],
        role: 'HOTEL_MANAGER',
      },
      roles: ['HOTEL_MANAGER'],
      activeRole: 'HOTEL_MANAGER',
      isGuest: false,
      isHotelManager: true,
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

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN']}>
          <div data-testid="manager-dashboard">Manager Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manager-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manager Dashboard Content')).toBeInTheDocument();
  });

  it('renders Access Restricted when a GUEST attempts to access manager route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 2,
        name: 'Guest User',
        email: 'guest@example.com',
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

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN']}>
          <div data-testid="manager-dashboard">Manager Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('manager-dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
  });
});
