import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  slug: string;
  name: string;
  brand: string;
  price: number;
  priceLabel: string;
  image: string;
  ref: string;
  description: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);

  cartItems = this.items.asReadonly();

  total = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  add(item: Omit<CartItem, 'quantity'>): void {
    this.items.update(current => {
      const existing = current.find(i => i.slug === item.slug);
      if (existing) {
        return current.map(i => i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }

  increment(slug: string): void {
    this.items.update(current =>
      current.map(i => i.slug === slug ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }

  decrement(slug: string): void {
    this.items.update(current =>
      current
        .map(i => i.slug === slug ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  }

  remove(slug: string): void {
    this.items.update(current => current.filter(i => i.slug !== slug));
  }

  clear(): void {
    this.items.set([]);
  }
}
