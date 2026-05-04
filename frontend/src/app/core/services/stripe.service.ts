import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

export interface CheckoutSessionRequest {
  items: {
    productId: string;
    name: string;
    amount: number; // in cents
    currency: string;
    quantity: number;
    imageUrl: string;
  }[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  discountCode?: string;
}

export interface PaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  customerEmail?: string;
  description?: string;
  orderId?: string;
  discountCode?: string;
}

export interface StripeResponse {
  id: string;
  status: string;
  clientSecret?: string;
  url?: string;
  amount: number;
  currency: string;
  message: string;
}

export interface DiscountValidationRequest {
  code: string;
  originalAmount: number; // in cents
}

export interface DiscountValidationResponse {
  valid: boolean;
  code: string;
  discountType?: string;
  discountValue?: number;
  originalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  message?: string;
  errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly apiUrl = `${environment.apiUrl}/stripe`;
  private readonly discountUrl = `${environment.apiUrl}/discounts`;
  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient) {
    // Initialize Stripe with publishable key
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  /**
   * Get Stripe instance
   */
  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  /**
   * Create a Checkout Session (Hosted Payment Page)
   */
  createCheckoutSession(request: CheckoutSessionRequest): Observable<StripeResponse> {
    return this.http.post<StripeResponse>(`${this.apiUrl}/checkout-session`, request);
  }

  /**
   * Redirect to Stripe Checkout
   * Note: Modern Stripe.js uses direct URL redirect instead of redirectToCheckout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    // Modern approach: Backend should return the checkout URL
    // This method is kept for compatibility but won't be used
    console.warn('redirectToCheckout is deprecated, use checkout URL from backend instead');
  }

  /**
   * Create a Payment Intent (Custom Payment Flow)
   */
  createPaymentIntent(request: PaymentIntentRequest): Observable<StripeResponse> {
    return this.http.post<StripeResponse>(`${this.apiUrl}/payment-intent`, request);
  }

  /**
   * Get Payment Intent status
   */
  getPaymentIntent(paymentIntentId: string): Observable<StripeResponse> {
    return this.http.get<StripeResponse>(`${this.apiUrl}/payment-intent/${paymentIntentId}`);
  }

  /**
   * Validate and apply discount code
   */
  validateDiscount(request: DiscountValidationRequest): Observable<DiscountValidationResponse> {
    return this.http.post<DiscountValidationResponse>(`${this.discountUrl}/validate`, request);
  }

  /**
   * Create Stripe Elements for custom payment form
   */
  async createElements(clientSecret: string): Promise<StripeElements | null> {
    const stripe = await this.getStripe();
    if (!stripe) {
      return null;
    }

    return stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0F172A',
          colorBackground: '#ffffff',
          colorText: '#1e293b',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
    });
  }

  /**
   * Confirm payment with Stripe
   */
  async confirmPayment(
    clientSecret: string,
    elements: StripeElements,
    returnUrl: string
  ): Promise<{ error?: any }> {
    const stripe = await this.getStripe();
    if (!stripe) {
      return { error: { message: 'Stripe failed to load' } };
    }

    return stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });
  }
}
