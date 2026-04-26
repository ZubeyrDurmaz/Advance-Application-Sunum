import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from '../../app/features/home/home';
import { ApiService } from '../../app/core/services/api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { CartService } from '../../app/core/services/cart.service';
import { ResponsiveService } from '../../app/core/services/responsive.service';
import { Router } from '@angular/router';
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
  { id: '1', sku: 'watch-1', name: 'Vanguard Skeleton', unitPrice: 12400, stockQuantity: 2, categoryName: 'Grand Complications', storeName: 'Vanguard', createdAt: '2024-01-01' },
  { id: '2', sku: 'watch-2', name: 'Heritage Moonphase', unitPrice: 18950, stockQuantity: 10, categoryName: 'Complications', storeName: 'Heritage', createdAt: '2024-01-02' },
  { id: '3', sku: 'watch-3', name: 'Ocean Master 300', unitPrice: 9200, stockQuantity: 7, categoryName: 'Diving', storeName: 'Ocean', createdAt: '2024-01-03' },
];

describe('Home Component', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts))
    };

    await TestBed.configureTestingModule({
      imports: [Home],
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

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the home component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email as empty string', () => {
    expect(component.email).toBe('');
  });

  it('should have footerLinks defined', () => {
    expect(component.footerLinks).toBeDefined();
    expect(component.footerLinks.length).toBeGreaterThan(0);
  });

  it('should load products from API on init', () => {
    expect(mockApiService.getProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(3);
  });

  it('should map products with correct structure', () => {
    const product = component.products[0];
    expect(product.name).toBeDefined();
    expect(product.price).toBeDefined();
    expect(product.slug).toBeDefined();
    expect(product.image).toBeDefined();
  });

  it('should mark products with low stock as limited', () => {
    // stockQuantity: 2 < 5, so should be limited
    expect(component.products[0].limited).toBe(true);
    // stockQuantity: 10 >= 5, so should not be limited
    expect(component.products[1].limited).toBe(false);
  });

  describe('onDiscoverMore()', () => {
    it('should navigate to /collection', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onDiscoverMore();
      expect(navigateSpy).toHaveBeenCalledWith(['/collection']);
    });
  });

  describe('onViewHeritage()', () => {
    it('should navigate to /deals', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onViewHeritage();
      expect(navigateSpy).toHaveBeenCalledWith(['/deals']);
    });
  });

  describe('onNewsletterSubmit()', () => {
    it('should clear email after submission', () => {
      component.email = 'test@example.com';
      component.onNewsletterSubmit();
      expect(component.email).toBe('');
    });

    it('should not do anything if email is empty', () => {
      component.email = '';
      component.onNewsletterSubmit();
      expect(component.email).toBe('');
    });
  });

  describe('onQuickView()', () => {
    it('should not throw when called with a product', () => {
      const product = component.products[0];
      expect(() => component.onQuickView(product)).not.toThrow();
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
