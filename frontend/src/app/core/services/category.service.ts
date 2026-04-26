import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  private readonly CACHE_KEY = 'categories';
  private readonly TTL = environment.cacheTimeout.categories;
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    const cached = this.getCached<Category[]>(this.CACHE_KEY, this.TTL);
    if (cached) return of(cached);

    return this.http.get<Category[]>(this.apiUrl).pipe(
      tap(cats => this.setCache(this.CACHE_KEY, cats))
    );
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
