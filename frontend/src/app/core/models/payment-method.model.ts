/**
 * Payment Method Model
 * 
 * Defines interfaces for user payment method management
 * Used for payment method CRUD operations and display
 */

export interface UserPaymentMethod {
  id: string;
  methodType: string; // "Credit Card", "Digital Wallet"
  provider?: string; // "Visa", "MasterCard", "PayPal"
  lastFour?: string; // Son 4 hane
  expiryDate?: string; // "MM/YYYY"
  isDefault: boolean;
}

export interface CreatePaymentMethodRequest {
  methodType: string;
  provider?: string;
  cardToken?: string; // Güvenli token
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodRequest {
  methodType: string;
  provider?: string;
  cardToken?: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
}