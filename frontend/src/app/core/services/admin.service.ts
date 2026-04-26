import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, StoreInfo, PlatformAnalytics } from '../models/dashboard.model';
import { OrderResponse } from '../models/order.model';
import { ProductResponse } from '../models/product.model';

export interface DiscountCodeResponse {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  status: string;
  storeName: string;
  createdAt: string;
}

export interface DiscountCodeRequest {
  code: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  storeId: string;
}

export interface ProductRequest {
  name?: string;
  sku?: string;
  unitPrice?: number;
  stockQuantity?: number;
  categoryId?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.api}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.api}/users/${userId}/role`, { role });
  }

  // Stores
  getStores(): Observable<StoreInfo[]> {
    return this.http.get<StoreInfo[]>(`${this.api}/stores`);
  }

  updateStoreStatus(storeId: string, status: string): Observable<StoreInfo> {
    return this.http.put<StoreInfo>(`${this.api}/stores/${storeId}/status`, { status });
  }

  // Analytics
  getAnalytics(): Observable<PlatformAnalytics> {
    return this.http.get<PlatformAnalytics>(`${this.api}/analytics`);
  }

  // Orders
  getOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.api}/orders`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.api}/orders/${orderId}/status`, { status });
  }

  // Discounts
  getDiscounts(): Observable<DiscountCodeResponse[]> {
    return this.http.get<DiscountCodeResponse[]>(`${this.api}/discounts`);
  }

  createDiscount(req: DiscountCodeRequest): Observable<DiscountCodeResponse> {
    return this.http.post<DiscountCodeResponse>(`${this.api}/discounts`, req);
  }

  updateDiscount(id: string, req: Partial<DiscountCodeRequest>): Observable<DiscountCodeResponse> {
    return this.http.put<DiscountCodeResponse>(`${this.api}/discounts/${id}`, req);
  }

  deleteDiscount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/discounts/${id}`);
  }

  toggleDiscount(id: string): Observable<DiscountCodeResponse> {
    return this.http.put<DiscountCodeResponse>(`${this.api}/discounts/${id}/toggle`, {});
  }

  // Products
  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/products`);
  }

  updateProduct(id: string, req: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.api}/products/${id}`, req);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`);
  }

  downloadProductsCsv(): void {
    this.http.get(`${this.api}/products/csv`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
