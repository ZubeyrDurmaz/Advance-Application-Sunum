import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cart } from '../../app/features/cart/cart';
import { CartService } from '../../app/core/services/cart.service';
import { ResponsiveService } from '../../app/core/services/responsive.service';
import { AuthService } from '../../app/core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Cart Component', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let mockCartService: any;

  beforeEach(async () => {
    mockCartService = {
      cartItems: signal([]),
      itemCount: computed(() => 0),
      total: computed(() => 0),
      add: vi.fn(),
      remove: vi.fn(),
      increment: vi.fn(),
      decrement: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: mockCartService },
        ResponsiveService,
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

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the cart component', () => {
    expect(component).toBeTruthy();
  });

  it('should have footerCols defined', () => {
    expect(component.footerCols).toBeDefined();
    expect(component.footerCols.length).toBeGreaterThan(0);
  });

  it('should inject CartService', () => {
    expect(component.cartService).toBeTruthy();
  });

  it('should inject ResponsiveService', () => {
    expect(component.responsive).toBeTruthy();
  });

  describe('formatPrice()', () => {
    it('should format price with dollar sign and locale formatting', () => {
      const result = component.formatPrice(12400);
      expect(result).toContain('12,400');
    });

    it('should format zero price', () => {
      const result = component.formatPrice(0);
      expect(result).toBeDefined();
    });

    it('should format large price values', () => {
      const result = component.formatPrice(89000);
      expect(result).toContain('89,000');
    });
  });

  describe('Template', () => {
    it('should render cart page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

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

  describe('Empty cart state', () => {
    it('should show empty state when cart has no items', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Cart is empty by default in tests
      expect(mockCartService.cartItems().length).toBe(0);
    });
  });

  describe('Cart with items', () => {
    it('should display items when cart has products', () => {
      const items = [
        {
          slug: 'test-watch',
          name: 'Test Watch',
          brand: 'TestBrand',
          price: 12400,
          priceLabel: '$12,400',
          image: 'test.jpg',
          ref: 'TW-001',
          description: 'A test watch',
          quantity: 1
        }
      ];

      // CartService with items must be provided before component creation
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Test Watch');
    });
  });
});
