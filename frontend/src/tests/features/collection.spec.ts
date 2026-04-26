import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Collection } from '../../app/features/collection/collection';
import { ApiService } from '../../app/core/services/api.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock IntersectionObserver for jsdom test environment
// (LazyLoadDirective uses IntersectionObserver which is not available in jsdom)
if (typeof IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      // Immediately trigger as intersecting for tests
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

describe('Collection - Responsive Product Grid (Task 13.1)', () => {
  let component: Collection;
  let fixture: ComponentFixture<Collection>;
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = {
      getProducts: vi.fn().mockReturnValue(of([
        {
          id: 1,
          sku: 'test-watch-1',
          name: 'Test Watch 1',
          description: 'Test Description',
          unitPrice: 15000,
          stockQuantity: 10,
          categoryId: 1,
          categoryName: 'Chronograph',
          imageUrl: 'test-image.jpg'
        },
        {
          id: 2,
          sku: 'test-watch-2',
          name: 'Test Gold Watch',
          description: 'Test Description',
          unitPrice: 50000,
          stockQuantity: 5,
          categoryId: 1,
          categoryName: 'Classic',
          imageUrl: 'test-image-2.jpg'
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Collection],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Collection);
    component = fixture.componentInstance;
    // Set activeTab before initial detectChanges to avoid change detection errors
    component.activeTab = 'all';
    fixture.detectChanges();
  });

  it('should create the collection component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products from API on initialization', () => {
    expect(mockApiService.getProducts).toHaveBeenCalled();
    expect(component.allProducts().length).toBe(2);
  });

  it('should render product grid with product-grid class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const productGrid = compiled.querySelector('.product-grid');
    
    expect(productGrid).toBeTruthy();
  });

  it('should display products in the grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const productCards = compiled.querySelectorAll('.product-card');
    
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('should have product image wrap element with mobile-first styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const productImageWrap = compiled.querySelector('.product-image-wrap') as HTMLElement;
    
    expect(productImageWrap).toBeTruthy();
    // The mobile padding (1rem) is applied by default (mobile-first approach)
    // Tablet/desktop padding (2rem) is applied via media query at 48rem breakpoint
  });

  it('should filter products correctly by search query', () => {
    component.searchQuery.set('Gold');
    
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toContain('Gold');
  });
});
