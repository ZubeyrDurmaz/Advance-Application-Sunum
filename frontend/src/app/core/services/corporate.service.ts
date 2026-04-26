import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductResponse } from '../models/product.model';
import { OrderResponse } from '../models/order.model';
import { ReviewResponse } from '../models/review.model';
import { StoreInfo, CustomerInfo, CorporateAnalytics } from '../models/dashboard.model';

export interface ProductRequest {
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  categoryId?: string;
}

@Injectable({ providedIn: 'root' })
export class CorporateService {
  private readonly api = `${environment.apiUrl}/corporate`;

  constructor(private http: HttpClient) {}

  getStore(): Observable<StoreInfo> {
    return this.http.get<StoreInfo>(`${this.api}/store`);
  }

  updateStore(name: string): Observable<StoreInfo> {
    return this.http.put<StoreInfo>(`${this.api}/store`, { name });
  }

  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/products`);
  }

  createProduct(req: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.api}/products`, req);
  }

  updateProduct(id: string, req: Partial<ProductRequest>): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.api}/products/${id}`, req);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`);
  }

  getOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.api}/orders`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.api}/orders/${orderId}/status`, { status });
  }

  getCustomers(): Observable<CustomerInfo[]> {
    return this.http.get<CustomerInfo[]>(`${this.api}/customers`);
  }

  getReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.api}/reviews`);
  }

  getAnalytics(): Observable<CorporateAnalytics> {
    return this.http.get<CorporateAnalytics>(`${this.api}/analytics`);
  }
}
