import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderResponse } from '../models/order.model';

export interface CheckoutRequest {
  items: { sku: string; quantity: number }[];
  paymentMethod: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(orderId: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  checkout(request: CheckoutRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/checkout`, request);
  }
}
