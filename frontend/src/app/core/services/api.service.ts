import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  categoryName: string;
  storeName: string;
  createdAt: string;
  // Marketing / display data (from DB)
  imageUrl?: string;
  description?: string;
  brand?: string;
  model?: string;
  movement?: string;
  material?: string;
  diameter?: string;
  powerReserve?: string;
  waterResistance?: string;
  availabilityStatus?: string;
  features?: string[];
  images?: string[];
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface ReviewResponse {
  id: string;
  userName: string;
  productName: string;
  starRating: number;
  sentiment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/products`);
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.api}/products/${id}`);
  }

  getProductBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.api}/products/sku/${sku}`);
  }

  searchProducts(query: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/products`, { params: { search: query } });
  }

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.api}/categories`);
  }

  getReviewsByProduct(productId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.api}/reviews/product/${productId}`);
  }

  addReview(productId: string, starRating: number, sentiment: string): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.api}/reviews/product/${productId}`, { starRating, sentiment });
  }
}
