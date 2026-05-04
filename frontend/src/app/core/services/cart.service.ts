import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id?: string; // Backend cart item ID
  slug: string;
  name: string;
  brand: string;
  price: number;
  priceLabel: string;
  image: string;
  ref: string;
  description: string;
  quantity: number;
  productId?: string; // Backend product ID
}

export interface BackendCartResponse {
  id: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private items = signal<CartItem[]>([]);
  private isLoading = signal(false);

  cartItems = this.items.asReadonly();
  loading = this.isLoading.asReadonly();

  total = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  constructor(private http: HttpClient) {}

  /**
   * Load cart from backend
   */
  loadCart(): Observable<BackendCartResponse> {
    this.isLoading.set(true);
    return this.http.get<BackendCartResponse>(this.apiUrl).pipe(
      tap(response => {
        // Convert backend response to frontend cart items
        const items: CartItem[] = response.items.map(item => ({
          id: item.id,
          productId: item.productId,
          slug: item.productSlug,
          name: item.productName,
          brand: '', // Not available from backend
          price: item.price,
          priceLabel: `$${item.price.toFixed(2)}`,
          image: item.productImage || '',
          ref: item.productId,
          description: '',
          quantity: item.quantity
        }));
        this.items.set(items);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Add item to cart (backend)
   */
  add(item: Omit<CartItem, 'quantity'>): Observable<BackendCartResponse> {
    const request = {
      productId: item.productId || item.ref,
      quantity: 1
    };
    
    return this.http.post<BackendCartResponse>(`${this.apiUrl}/items`, request).pipe(
      tap(response => {
        this.updateCartFromResponse(response);
      })
    );
  }

  /**
   * Update cart item quantity (backend)
   */
  updateQuantity(cartItemId: string, quantity: number): Observable<BackendCartResponse> {
    return this.http.put<BackendCartResponse>(
      `${this.apiUrl}/items/${cartItemId}?quantity=${quantity}`,
      {}
    ).pipe(
      tap(response => {
        this.updateCartFromResponse(response);
      })
    );
  }

  /**
   * Increment item quantity
   */
  increment(slug: string): void {
    const item = this.items().find(i => i.slug === slug);
    if (item && item.id) {
      this.updateQuantity(item.id, item.quantity + 1).subscribe();
    }
  }

  /**
   * Decrement item quantity
   */
  decrement(slug: string): void {
    const item = this.items().find(i => i.slug === slug);
    if (item && item.id) {
      const newQuantity = item.quantity - 1;
      if (newQuantity > 0) {
        this.updateQuantity(item.id, newQuantity).subscribe();
      } else {
        this.remove(slug);
      }
    }
  }

  /**
   * Remove item from cart (backend)
   */
  remove(slug: string): void {
    const item = this.items().find(i => i.slug === slug);
    if (item && item.id) {
      this.http.delete<BackendCartResponse>(`${this.apiUrl}/items/${item.id}`).pipe(
        tap(response => {
          this.updateCartFromResponse(response);
        })
      ).subscribe();
    }
  }

  /**
   * Clear cart (backend)
   */
  clear(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        this.items.set([]);
      })
    );
  }

  /**
   * Update local cart state from backend response
   */
  private updateCartFromResponse(response: BackendCartResponse): void {
    const items: CartItem[] = response.items.map(item => ({
      id: item.id,
      productId: item.productId,
      slug: item.productSlug,
      name: item.productName,
      brand: '',
      price: item.price,
      priceLabel: `$${item.price.toFixed(2)}`,
      image: item.productImage || '',
      ref: item.productId,
      description: '',
      quantity: item.quantity
    }));
    this.items.set(items);
  }
}
