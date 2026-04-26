import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { 
  BillingProfile, 
  SetBillingAddressRequest, 
  CreateBillingAddressRequest, 
  UpdateBillingProfileRequest 
} from '../models/billing.model';
import { UserAddress } from '../models/address.model';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.interceptor';

/**
 * BillingAddressService
 * 
 * Manages billing address operations including profile management,
 * address selection, and billing-specific CRUD operations.
 * 
 * API Endpoints:
 * - GET /users/me/billing/profile - Get current billing profile
 * - POST /users/me/billing/set-address - Set existing address as billing
 * - POST /users/me/billing/create-address - Create new billing address
 * - PUT /users/me/billing/profile - Update billing profile
 * - DELETE /users/me/billing/profile - Clear billing address
 * - GET /users/me/billing/available-addresses - Get addresses available for billing
 * 
 * @example
 * ```typescript
 * // Get current billing profile
 * billingService.getBillingProfile().subscribe(profile => {
 *   console.log('Billing profile:', profile);
 * });
 * 
 * // Set existing address as billing
 * const setBillingRequest: SetBillingAddressRequest = {
 *   addressId: 'addr-123',
 *   accountHolderName: 'John Doe'
 * };
 * billingService.setBillingAddress(setBillingRequest).subscribe(profile => {
 *   console.log('Billing address set:', profile);
 * });
 * 
 * // Create new billing address
 * const createRequest: CreateBillingAddressRequest = {
 *   addressTitle: 'Billing Address',
 *   fullAddress: '123 Main St',
 *   city: 'Istanbul',
 *   zipCode: '34000',
 *   accountHolderName: 'John Doe'
 * };
 * billingService.createBillingAddress(createRequest).subscribe(profile => {
 *   console.log('Billing address created:', profile);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class BillingAddressService {
  private readonly API_URL = `${environment.apiUrl}/users/me/billing`;

  constructor(private http: HttpClient) {}

  /**
   * Get current billing profile
   * Sends GET request to /users/me/billing/profile
   * 
   * @returns Observable<BillingProfile | null>
   */
  getBillingProfile(): Observable<BillingProfile | null> {
    return this.http.get<BillingProfile>(`${this.API_URL}/profile`, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true)
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /**
   * Set existing address as billing address
   * Sends POST request to /users/me/billing/set-address
   * 
   * @param request SetBillingAddressRequest data
   * @returns Observable<BillingProfile>
   */
  setBillingAddress(request: SetBillingAddressRequest): Observable<BillingProfile> {
    return this.http.post<BillingProfile>(`${this.API_URL}/set-address`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new address and set as billing address
   * Sends POST request to /users/me/billing/create-address
   * 
   * @param request CreateBillingAddressRequest data
   * @returns Observable<BillingProfile>
   */
  createBillingAddress(request: CreateBillingAddressRequest): Observable<BillingProfile> {
    return this.http.post<BillingProfile>(`${this.API_URL}/create-address`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update billing profile (address and account holder)
   * Sends PUT request to /users/me/billing/profile
   * 
   * @param request UpdateBillingProfileRequest data
   * @returns Observable<BillingProfile>
   */
  updateBillingProfile(request: UpdateBillingProfileRequest): Observable<BillingProfile> {
    return this.http.put<BillingProfile>(`${this.API_URL}/profile`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear billing address
   * Sends DELETE request to /users/me/billing/profile
   * 
   * @returns Observable<void>
   */
  clearBillingAddress(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get addresses available for billing selection
   * Sends GET request to /users/me/billing/available-addresses
   * 
   * @returns Observable<UserAddress[]>
   */
  getAvailableAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(`${this.API_URL}/available-addresses`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   * Provides user-friendly error messages for billing operations
   * 
   * @param error HTTP error response
   * @returns Observable<never>
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Bir hata oluştu';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Sunucuya bağlanılamıyor';
    } else if (error.status === 401) {
      errorMessage = 'Oturum süreniz dolmuş';
    } else if (error.status === 403) {
      errorMessage = 'Bu işlem için yetkiniz yok';
    } else if (error.status === 404) {
      errorMessage = 'Fatura adresi bulunamadı';
    } else if (error.status === 409) {
      errorMessage = 'Bu fatura adresi zaten mevcut';
    } else if (error.status === 422) {
      errorMessage = 'Geçersiz fatura adresi bilgileri';
    } else if (error.status >= 500) {
      errorMessage = 'Sunucu hatası oluştu';
    }

    console.error('Billing address service error:', error);
    const err = new Error(errorMessage) as any;
    err.status = error.status;
    return throwError(() => err);
  }
}