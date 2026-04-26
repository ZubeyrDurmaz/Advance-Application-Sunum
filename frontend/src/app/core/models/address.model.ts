/**
 * Address Model
 * 
 * Defines interfaces for user address management
 * Used for address CRUD operations and display
 */

export interface UserAddress {
  id: string;
  addressTitle?: string;
  fullAddress: string;
  city: string;
  zipCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  addressTitle?: string;
  fullAddress: string;
  city: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  addressTitle?: string;
  fullAddress: string;
  city: string;
  zipCode?: string;
  isDefault?: boolean;
}