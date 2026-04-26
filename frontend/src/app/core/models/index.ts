export interface CartItem {
  slug: string;
  name: string;
  brand: string;
  price: number;
  priceLabel: string;
  image: string;
  ref: string;
  description: string;
  quantity: number;
}

// Authentication models
export * from './auth.model';

// Order models
export * from './order.model';

// Review models
export * from './review.model';

// Address models
export * from './address.model';

// Payment method models
export * from './payment-method.model';

// Billing models
export * from './billing.model';
