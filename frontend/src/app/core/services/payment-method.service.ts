import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UserPaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '../models/payment-method.model';
import { environment } from '../../../environments/environment';

/**
 * PaymentMethodService
 * 
 * Manages user payment method operations including CRUD operations
 * Provides methods for payment method management and default payment method handling
 * 
 * API Endpoints:
 * - GET /users/me/payment-methods - Get all user payment methods
 * - GET /users/me/payment-methods/{id} - Get specific payment method
 * - POST /users/me/payment-methods - Create new payment method
 * - PUT /users/me/payment-methods/{id} - Update payment method
 * - DELETE /users/me/payment-methods/{id} - Delete payment method
 * - PUT /users/me/payment-methods/{id}/set-default - Set as default payment method
 * 
 * @example
 * ```typescript
 * // Get all payment methods
 * paymentMethodService.getPaymentMethods().subscribe(methods => {
 *   console.log('User payment methods:', methods);
 * });
 * 
 * // Create new payment method
 * const newMethod: CreatePaymentMethodRequest = {
 *   methodType: 'Credit Card',
 *   provider: 'Visa',
 *   cardToken: 'secure_token_123',
 *   lastFour: '1234',
 *   expiryDate: '12/2025',
 *   isDefault: true
 * };
 * paymentMethodService.createPaymentMethod(newMethod).subscribe(method => {
 *   console.log('Created payment method:', method);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly API_URL = `${environment.apiUrl}/users/me/payment-methods`;

  constructor(private http: HttpClient) {}

  /**
   * Get all user payment methods
   * Sends GET request to /users/me/payment-methods
   * 
   * @returns Observable<UserPaymentMethod[]>
   */
  getPaymentMethods(): Observable<UserPaymentMethod[]> {
    return this.http.get<UserPaymentMethod[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get specific payment method by ID
   * Sends GET request to /users/me/payment-methods/{id}
   * 
   * @param id Payment method ID
   * @returns Observable<UserPaymentMethod>
   */
  getPaymentMethod(id: string): Observable<UserPaymentMethod> {
    return this.http.get<UserPaymentMethod>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new payment method
   * Sends POST request to /users/me/payment-methods
   * 
   * @param request CreatePaymentMethodRequest data
   * @returns Observable<UserPaymentMethod>
   */
  createPaymentMethod(request: CreatePaymentMethodRequest): Observable<UserPaymentMethod> {
    return this.http.post<UserPaymentMethod>(this.API_URL, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing payment method
   * Sends PUT request to /users/me/payment-methods/{id}
   * 
   * @param id Payment method ID
   * @param request UpdatePaymentMethodRequest data
   * @returns Observable<UserPaymentMethod>
   */
  updatePaymentMethod(id: string, request: UpdatePaymentMethodRequest): Observable<UserPaymentMethod> {
    return this.http.put<UserPaymentMethod>(`${this.API_URL}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete payment method
   * Sends DELETE request to /users/me/payment-methods/{id}
   * 
   * @param id Payment method ID
   * @returns Observable<void>
   */
  deletePaymentMethod(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Set payment method as default
   * Sends PUT request to /users/me/payment-methods/{id}/set-default
   * 
   * @param id Payment method ID
   * @returns Observable<UserPaymentMethod>
   */
  setDefaultPaymentMethod(id: string): Observable<UserPaymentMethod> {
    return this.http.put<UserPaymentMethod>(`${this.API_URL}/${id}/set-default`, {}).pipe(
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
      errorMessage = 'Ödeme yöntemi bulunamadı';
    } else if (error.status === 409) {
      errorMessage = 'Bu ödeme yöntemi zaten mevcut';
    } else if (error.status >= 500) {
      errorMessage = 'Sunucu hatası oluştu';
    }

    console.error('Payment method service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}