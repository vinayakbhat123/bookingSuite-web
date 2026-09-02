import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PaymentSuccessPage } from '../pages/guest/PaymentSuccessPage';
import { PaymentFailurePage } from '../pages/guest/PaymentFailurePage';
import { ToastProvider } from '../context/ToastContext';

describe('Payment Status Pages', () => {
  it('renders PaymentSuccessPage with verification state', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/payment/success?bookingId=101']}>
          <PaymentSuccessPage />
        </MemoryRouter>
      </ToastProvider>
    );

    expect(screen.getByText(/Verifying payment/i)).toBeInTheDocument();
  });

  it('renders PaymentFailurePage with retry and error status', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/payment/failure?booking_id=101']}>
          <PaymentFailurePage />
        </MemoryRouter>
      </ToastProvider>
    );

    expect(screen.getByText(/Payment could not be completed/i)).toBeInTheDocument();
  });
});
