import { apiClient } from '../lib/apiClient';

export interface PaymentInitiationResponse {
  paymentUrl?: string;
  sessionId?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

export const paymentService = {
  /**
   * POST /bookings/{bookingId}/payments
   * Backend initiates payment processing for booking and returns payment gateway URL or status
   */
  async initiatePayment(bookingId: number): Promise<PaymentInitiationResponse> {
    const res = await apiClient.post<any, PaymentInitiationResponse>(`/bookings/${bookingId}/payments`);
    return res;
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
      description: 'Server-side webhook for Stripe fulfillment events with signature verification.',
    };
  },
};
