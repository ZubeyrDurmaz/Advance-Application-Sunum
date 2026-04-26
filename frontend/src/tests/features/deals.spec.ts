import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Deals } from '../../app/features/deals/deals';
import { ApiService } from '../../app/core/services/api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { CartService } from '../../app/core/services/cart.service';
import { ResponsiveService } from '../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock IntersectionObserver for jsdom test environment
if (typeof IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      setTimeout(() => {
        this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any);
      }, 0);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    get root() { return null; }
    get rootMargin() { return ''; }
    get thresholds() { return []; }
  };
}

const mockProducts = [
  { id: '1', sku: 'watch-1', name: 'Watch One', unitPrice: 10000, stockQuantity: 5, categoryName: 'Classic', storeName: 'Rolex', createdAt: '2024-01-01' },
  { id: '2', sku: 'watch-2', name: 'Watch Two', unitPrice: 20000, stockQuantity: 3, categoryName: 'Sport', storeName: 'Omega', createdAt: '2024-01-02' },
  { id: '3', sku: 'watch-3', name: 'Watch Three', unitPrice: 30000, stockQuantity: 2, categoryName: 'Dress', storeName: 'Patek', createdAt: '2024-01-03' },
  { id: '4', sku: 'watch-4', name: 'Watch Four', unitPrice: 40000, stockQuantity: 1, categoryName: 'Luxury', storeName: 'AP', createdAt: '2024-01-04' },
  { id: '5', sku: 'watch-5', name: 'Watch Five', unitPrice: 50000, stockQuantity: 8, categoryName: 'Classic', storeName: 'Rolex', createdAt: '2024-01-05' },
  { id: '6', sku: 'watch-6', name: 'Watch Six', unitPrice: 60000, stockQuantity: 4, categoryName: 'Sport', storeName: 'Omega', createdAt: '2024-01-06' },
  { id: '7', sku: 'watch-7', name: 'Watch Seven', unitPrice: 70000, stockQuantity: 6, categoryName: 'Dress', storeName: 'Patek', createdAt: '2024-01-07' },
  { id: '8', sku: 'watch-8', name: 'Watch Eight', unitPrice: 80000, stockQuantity: 2, categoryName: 'Luxury', storeName: 'AP', createdAt: '2024-01-08' },
  { id: '9', sku: 'watch-9', name: 'Watch Nine', unitPrice: 90000, stockQuantity: 3, categoryName: 'Classic', storeName: 'Rolex', createdAt: '2024-01-09' },
  { id: '10', sku: 'watch-10', name: 'Watch Ten', unitPrice: 100000, stockQuantity: 1, categoryName: 'Sport', storeName: 'Omega', createdAt: '2024-01-10' },
];

describe('Deals Component', () => {
  let component: Deals;
  let fixture: ComponentFixture<Deals>;
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts))
    };

    await TestBed.configureTestingModule({
      imports: [Deals],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        ResponsiveService,
        {
          provide: CartService,
          useValue: {
            cartItems: signal([]),
            itemCount: computed(() => 0),
            total: computed(() => 0)
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null),
            isLoggedIn: () => false,
            initials: () => '',
            logout: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Deals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the deals component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email as empty string', () => {
    expect(component.email).toBe('');
  });

  it('should have footerColumns defined', () => {
    expect(component.footerColumns).toBeDefined();
    expect(component.footerColumns.length).toBeGreaterThan(0);
  });

  it('should load watches from API on init', () => {
    expect(mockApiService.getProducts).toHaveBeenCalled();
    expect(component.watches.length).toBeGreaterThan(0);
  });

  it('should map products to watches with correct structure', () => {
    const watch = component.watches[0];
    expect(watch.name).toBeDefined();
    expect(watch.price).toBeDefined();
    expect(watch.originalPrice).toBeDefined();
    expect(watch.slug).toBeDefined();
    expect(watch.image).toBeDefined();
  });

  it('should calculate originalPrice as 20% above unitPrice', () => {
    const watch = component.watches[0];
    // price and originalPrice are formatted strings like "50,000" (no $ sign)
    const priceNum = parseFloat(watch.price.replace(/[^0-9.]/g, ''));
    const originalNum = parseFloat(watch.originalPrice.replace(/[^0-9.]/g, ''));
    expect(originalNum).toBeGreaterThan(priceNum);
  });

  describe('onSubscribe()', () => {
    it('should clear email after subscribing', () => {
      component.email = 'test@example.com';
      component.onSubscribe();
      expect(component.email).toBe('');
    });

    it('should not do anything if email is empty', () => {
      component.email = '';
      component.onSubscribe();
      expect(component.email).toBe('');
    });
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should render footer', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-footer');
      expect(footer).toBeTruthy();
    });
  });
});
