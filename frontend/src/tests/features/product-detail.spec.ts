import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetail } from '../../app/features/product-detail/product-detail';
import { ApiService } from '../../app/core/services/api.service';
import { CartService } from '../../app/core/services/cart.service';
import { AuthService } from '../../app/core/services/auth.service';
import { ResponsiveService } from '../../app/core/services/responsive.service';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockProduct = {
  id: '1',
  sku: 'vanguard-skeleton',
  name: 'Vanguard Skeleton',
  unitPrice: 12400,
  stockQuantity: 3,
  categoryName: 'Grand Complications',
  storeName: 'Vanguard',
  createdAt: '2024-01-01'
};

describe('ProductDetail Component', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;
  let mockApiService: any;
  let mockCartService: any;

  beforeEach(async () => {
    mockApiService = {
      getProductBySku: vi.fn().mockReturnValue(of(mockProduct))
    };

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
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
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
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => 'vanguard-skeleton' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the product-detail component', () => {
    expect(component).toBeTruthy();
  });

  it('should have craftsmanship items defined', () => {
    expect(component.craftsmanship).toBeDefined();
    expect(component.craftsmanship.length).toBe(3);
  });

  it('should have reviews defined', () => {
    expect(component.reviews).toBeDefined();
    expect(component.reviews.length).toBeGreaterThan(0);
  });

  it('should have ratingBars defined', () => {
    expect(component.ratingBars).toBeDefined();
    expect(component.ratingBars.length).toBe(5);
  });

  it('should initialize showReviewForm as false', () => {
    expect(component.showReviewForm).toBe(false);
  });

  it('should initialize reviewRating as 5', () => {
    expect(component.reviewRating).toBe(5);
  });

  it('should load product from API on init', () => {
    expect(mockApiService.getProductBySku).toHaveBeenCalledWith('vanguard-skeleton');
    expect(component.product).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('should fall back to default product on API error', async () => {
    mockApiService.getProductBySku.mockReturnValue(throwError(() => new Error('Not found')));

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.product).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  describe('openReviewModal()', () => {
    it('should set showReviewForm to true', () => {
      component.openReviewModal();
      expect(component.showReviewForm).toBe(true);
    });

    it('should prevent body scroll', () => {
      component.openReviewModal();
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('closeReviewModal()', () => {
    it('should set showReviewForm to false', () => {
      component.showReviewForm = true;
      component.closeReviewModal();
      expect(component.showReviewForm).toBe(false);
    });

    it('should restore body scroll', () => {
      component.openReviewModal();
      component.closeReviewModal();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('setRating()', () => {
    it('should update reviewRating', () => {
      component.setRating(3);
      expect(component.reviewRating).toBe(3);
    });

    it('should accept any rating value 1-5', () => {
      [1, 2, 3, 4, 5].forEach(n => {
        component.setRating(n);
        expect(component.reviewRating).toBe(n);
      });
    });
  });

  describe('submitReview()', () => {
    it('should not submit if required fields are missing', () => {
      const initialCount = component.reviews.length;
      component.reviewTitle = '';
      component.reviewBody = '';
      component.reviewAuthor = '';
      component.submitReview();
      expect(component.reviews.length).toBe(initialCount);
    });

    it('should add review to reviews array when all fields are filled', () => {
      const initialCount = component.reviews.length;
      component.reviewTitle = 'Great Watch';
      component.reviewBody = 'Absolutely stunning timepiece.';
      component.reviewAuthor = 'Test User';
      component.submitReview();
      expect(component.reviews.length).toBe(initialCount + 1);
    });

    it('should clear form fields after submission', () => {
      component.reviewTitle = 'Great Watch';
      component.reviewBody = 'Stunning.';
      component.reviewAuthor = 'Test User';
      component.submitReview();
      expect(component.reviewTitle).toBe('');
      expect(component.reviewBody).toBe('');
      expect(component.reviewAuthor).toBe('');
    });

    it('should reset rating to 5 after submission', () => {
      component.reviewTitle = 'Great Watch';
      component.reviewBody = 'Stunning.';
      component.reviewAuthor = 'Test User';
      component.reviewRating = 3;
      component.submitReview();
      expect(component.reviewRating).toBe(5);
    });
  });

  describe('addToCart()', () => {
    it('should call cartService.add with product data', () => {
      component.addToCart();
      expect(mockCartService.add).toHaveBeenCalled();
    });

    it('should not call cartService.add if product is null', () => {
      component.product = null;
      component.addToCart();
      expect(mockCartService.add).not.toHaveBeenCalled();
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
