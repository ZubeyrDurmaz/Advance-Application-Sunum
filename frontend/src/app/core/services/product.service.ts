import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, debounceTime, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductResponse, Category, PaginatedResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly PRODUCT_TTL = environment.cacheTimeout.products;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.apiUrl);
  }

  downloadCsv(): void {
    this.http.get(`${environment.apiUrl}/admin/products/csv`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  searchProducts(query: string): Observable<ProductResponse[]> {
    return of(query).pipe(
      debounceTime(300),
      switchMap(q =>
        this.http.get<ProductResponse[]>(this.apiUrl, { params: { search: q } })
      )
    );
  }

  getProductsByCategory(categoryId: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.apiUrl, { params: { categoryId } });
  }

  getProductById(id: string): Observable<ProductResponse> {
    const key = `product-${id}`;
    const cached = this.getCached<ProductResponse>(key, this.PRODUCT_TTL);
    if (cached) return of(cached);

    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(p => this.setCache(key, p))
    );
  }

  getProductBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/sku/${sku}`);
  }

  getProductsPaginated(page: number, size: number): Observable<PaginatedResponse<ProductResponse>> {
    return this.http.get<PaginatedResponse<ProductResponse>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getProductsFiltered(
    page: number,
    size: number,
    search?: string,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    availability?: string,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<PaginatedResponse<ProductResponse>> {
    let params: any = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection
    };

    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (minPrice !== undefined) params.minPrice = minPrice.toString();
    if (maxPrice !== undefined) params.maxPrice = maxPrice.toString();
    if (availability) params.availability = availability;

    return this.http.get<PaginatedResponse<ProductResponse>>(this.apiUrl, { params });
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getCached<T>(key: string, ttl: number): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttl) {
      return entry.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
