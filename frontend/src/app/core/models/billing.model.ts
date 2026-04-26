/**
 * Billing Address Model
 * 
 * Defines interfaces for billing address management
 * Used for billing profile operations and payment processing
 */

import { UserAddress } from './address.model';

export interface BillingProfile {
  id: string;
  accountHolderName: string;
  address?: UserAddress;
  createdAt: string;
  updatedAt: string;
}

export interface SetBillingAddressRequest {
  addressId: string;
  accountHolderName: string;
}

export interface CreateBillingAddressRequest {
  addressTitle?: string;
  fullAddress: string;
  city: string;
  zipCode?: string;
  accountHolderName: string;
}

export interface UpdateBillingProfileRequest {
  addressId?: string;
  accountHolderName: string;
  addressTitle?: string;
  fullAddress?: string;
  city?: string;
  zipCode?: string;
}