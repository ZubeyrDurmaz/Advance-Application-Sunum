import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UserAddress, CreateAddressRequest, UpdateAddressRequest } from '../models/address.model';
import { environment } from '../../../environments/environment';

/**
 * AddressService
 * 
 * Manages user address operations including CRUD operations
 * Provides methods for address management and default address handling
 * 
 * API Endpoints:
 * - GET /users/me/addresses - Get all user addresses
 * - GET /users/me/addresses/{id} - Get specific address
 * - POST /users/me/addresses - Create new address
 * - PUT /users/me/addresses/{id} - Update address
 * - DELETE /users/me/addresses/{id} - Delete address
 * - PUT /users/me/addresses/{id}/set-default - Set as default address
 * 
 * @example
 * ```typescript
 * // Get all addresses
 * addressService.getAddresses().subscribe(addresses => {
 *   console.log('User addresses:', addresses);
 * });
 * 
 * // Create new address
 * const newAddress: CreateAddressRequest = {
 *   addressTitle: 'Home',
 *   fullAddress: '123 Main St',
 *   city: 'Istanbul',
 *   zipCode: '34000',
 *   isDefault: true
 * };
 * addressService.createAddress(newAddress).subscribe(address => {
 *   console.log('Created address:', address);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly API_URL = `${environment.apiUrl}/users/me/addresses`;

  constructor(private http: HttpClient) {}

  /**
   * Get all user addresses
   * Sends GET request to /users/me/addresses
   * 
   * @returns Observable<UserAddress[]>
   */
  getAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get specific address by ID
   * Sends GET request to /users/me/addresses/{id}
   * 
   * @param id Address ID
   * @returns Observable<UserAddress>
   */
  getAddress(id: string): Observable<UserAddress> {
    return this.http.get<UserAddress>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new address
   * Sends POST request to /users/me/addresses
   * 
   * @param request CreateAddressRequest data
   * @returns Observable<UserAddress>
   */
  createAddress(request: CreateAddressRequest): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.API_URL, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing address
   * Sends PUT request to /users/me/addresses/{id}
   * 
   * @param id Address ID
   * @param request UpdateAddressRequest data
   * @returns Observable<UserAddress>
   */
  updateAddress(id: string, request: UpdateAddressRequest): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.API_URL}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete address
   * Sends DELETE request to /users/me/addresses/{id}
   * 
   * @param id Address ID
   * @returns Observable<void>
   */
  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Set address as default
   * Sends PUT request to /users/me/addresses/{id}/set-default
   * 
   * @param id Address ID
   * @returns Observable<UserAddress>
   */
  setDefaultAddress(id: string): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.API_URL}/${id}/set-default`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   * Provides user-friendly error messages
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
      errorMessage = 'Adres bulunamadı';
    } else if (error.status === 409) {
      errorMessage = 'Bu adres zaten mevcut';
    } else if (error.status >= 500) {
      errorMessage = 'Sunucu hatası oluştu';
    }

    console.error('Address service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}