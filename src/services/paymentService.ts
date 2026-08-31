import { bookingsApi } from '../api';

export interface PaymentInitiationResponse {
  paymentUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

export const paymentService = {
  /**
   * 3) POST /bookings/{bookingId}/payments
   * Backend initiates payment processing for booking and returns Stripe Checkout URL
   */
  async initiatePayment(bookingId: number): Promise<PaymentInitiationResponse> {
    return bookingsApi.initiatePayment(bookingId);
  },

  /**
   * Stripe Webhook Reference (POST /webhook/stripe):
   * Note: The Stripe webhook is an external server-to-server endpoint used exclusively by Stripe
   * with Stripe-Signature headers. Frontend interacts securely through initiatePayment.
   */
  getWebhookInfo() {
    return {
      endpoint: '/webhook/stripe',
      method: 'POST',
      description:
        'Server-side webhook for Stripe fulfillment events with signature verification. Strictly server-to-server.',
    };
  },
};
