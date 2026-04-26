import { Component, computed, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductResponse, Category, PaginatedResponse } from '../../core/models/product.model';
import { ResponsiveService } from '../../core/services/responsive.service';
import { LazyLoadDirective } from '../../shared/directives/lazy-load.directive';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface FeaturedCollection {
  categoryName: string;
  tagline: string;
  icon: string;
  image: string;
  offset?: boolean;
}

interface DisplayProduct {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceValue: number;
  categoryName: string;
  stockQuantity: number;
  image: string;
  slug: string;
}

interface FilterGroup {
  label: string;
  key: string;
  options: string[];
}

const PAGE_SIZE = 20;
const PLACEHOLDER_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5sKqM25tajyHx49E8AmC01WoOZSim69pWB4GjaWNWqfHQ7I6jgjhd8edCebN8fuSG41FRNsQD1ymylzxmZphHO-RSopvPAsbGXEopbLsn-yMgNk1jPIOO0b3NXzdwkIWulKF7h0MUcQRQb1GuiKuZgpm2rrxMOxtvmtQx1K1mfKT8NQVTxH5Cz4Z6yKPMl2fxsSRTZf5EqzQnOe7Rr8r2Bd866hIIxGXnsA1X5SjFB4WAom4jIiYfKW9fJLKy2gv5murE26cWMPvo';

function mapProduct(p: ProductResponse): DisplayProduct {
  return {
    id: p.id,
    name: p.name,
    subtitle: `${p.categoryName || 'Watch'} · ${p.storeName || 'Chronos'}`,
    price: `$${p.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
    priceValue: p.unitPrice,
    categoryName: p.categoryName || 'Uncategorized',
    stockQuantity: p.stockQuantity ?? 0,
    slug: p.sku,
    image: PLACEHOLDER_IMG,
  };
}

@Component({
  selector: 'app-collection',
  imports: [FormsModule, RouterLink, Navbar, Footer, LazyLoadDirective],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection implements OnInit, OnDestroy {
  activeTab: 'collections' | 'all' = 'collections';
  searchQuery = signal('');
  filterPanelOpen = signal(false);
  selectedCategoryId = signal<string | null>(null);
  selectedPriceRange = signal<string | null>(null);
  selectedStock = signal<string | null>(null);
  sortBy = signal<string>('name-asc');

  // Pagination state
  currentPage = signal(0);
  totalPages = signal(1);
  totalElements = signal(0);

  Object = Object;

  featuredCollections: FeaturedCollection[] = [
    { categoryName: 'Professional Diving', tagline: 'Engineered for the Deep', icon: 'scuba_diving',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJBLuJ0F8wYFDoreL9re2OKaIv7KsY7OASS7t09iUzkcATwW_sPA_wUZeYZxIftAPv5CQBzqdvZHcuCM2m-M2mHVmYXpRLDCxDdGCn4hjq6bjh5Wqmubgqx-O7P4GPSmobW_RoAj2DXXMroT57Zst9aS1eI7fm9oBkyPEEocFFSP0N9blkC7g0z2_hyoDKpJLVM79PtDB_VexXq8ojCJRvu0t1KMZ76rwwcALDW_dUbIIP1HzqvzvDEvaW3LzsL2GpsJtkEUHu_fuH' },
    { categoryName: 'Grand Complications', tagline: 'The Art of Complexity', icon: 'settings_suggest', offset: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArYofccmmYtOBffiM5uILOFGaznNzbEurEkAoA2GJbncJVn2jP5uiL7V82StWDzC1UQAzFZIlfIv1dmQwAXyG75ISGeeBIPX05TVg0W4vnU2W2uU916vHQ9nUUiR90BtkwAY0PhOudylpE8QHdFx3lIx6tWDED2mPlmLjCiCqbRdjeH6q0i7IFgj5lQJsWnfxd46DtxWGyePubxICY9-qPsoDKgY11gML3jJJDe07IIUBi6mVPmf70_01dAKh2SsGbZV8aSwDuI99W' },
    { categoryName: 'Iconic Sports', tagline: 'Precision in Motion', icon: 'sports_score',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOv_isScDyI2ppiUzRzK_AstxReBtOW4Hc9S0Qe6wDUKm78YxGHGAlnuqX-1777PWC8xz5NwKzwL_utFInSOh69HDdV30HdZvb8G3WHMiM7yIx2SxtF1kJidNrH5jTqPTo8f3sVMWCCUe3GftYKF35RT2L7MGxkX7ligPHqm7m6CZSnWazywEYfx90Av9Sw-Z72_owjvES-oq0UzsdxxVDH0y8veRw9dZBo7lgRpmq8kzR6XU7J6HgsZYe1nIUrQ_WABiqp_slUm9m' },
  ];

  exploreCollection(categoryName: string): void {
    const cat = this.categories().find(c => c.name === categoryName);
    if (cat) {
      this.selectedCategoryId.set(cat.id);
    }
    this.activeTab = 'all';
  }

  allProducts = signal<DisplayProduct[]>([]);
  categories = signal<Category[]>([]);

  // Price range options
  priceRanges: { label: string; min: number; max: number }[] = [
    { label: 'Under $5,000', min: 0, max: 5000 },
    { label: '$5,000 – $20,000', min: 5000, max: 20000 },
    { label: '$20,000 – $50,000', min: 20000, max: 50000 },
    { label: '$50,000 – $100,000', min: 50000, max: 100000 },
    { label: 'Over $100,000', min: 100000, max: Infinity },
  ];

  // Debounced search subject
  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private responsive: ResponsiveService
  ) {
    effect(() => {
      if (!this.responsive.isMobile() && this.filterPanelOpen()) {
        this.filterPanelOpen.set(false);
        document.body.style.overflow = '';
      }
    });
  }

  ngOnInit(): void {
    this.subs.add(
      this.categoryService.getAllCategories().subscribe(cats => this.categories.set(cats))
    );

    this.loadPage(0);

    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (!query.trim()) return this.productService.getAllProducts();
          return this.productService.searchProducts(query);
        })
      ).subscribe(res => {
        this.allProducts.set(res.map(mapProduct));
        this.currentPage.set(0);
        this.totalPages.set(1);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadPage(page: number): void {
    this.subs.add(
      this.productService.getProductsPaginated(page, PAGE_SIZE).subscribe(res => {
        this.allProducts.set(res.content.map(mapProduct));
        this.currentPage.set(res.currentPage);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
      })
    );
  }

  get isMobile() {
    return this.responsive.isMobile();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  // Filtered & sorted products
  filteredProducts = computed(() => {
    let products = this.allProducts();
    const categoryId = this.selectedCategoryId();
    const priceRange = this.selectedPriceRange();
    const stock = this.selectedStock();
    const sort = this.sortBy();

    // Category filter (client-side filtering since we already have data)
    if (categoryId) {
      const selectedCat = this.categories().find(c => c.id === categoryId);
      if (selectedCat) {
        products = products.filter(p => p.categoryName === selectedCat.name);
      }
    }

    // Price range filter
    if (priceRange) {
      const range = this.priceRanges.find(r => r.label === priceRange);
      if (range) {
        products = products.filter(p => p.priceValue >= range.min && p.priceValue < range.max);
      }
    }

    // Stock filter
    if (stock === 'in-stock') {
      products = products.filter(p => p.stockQuantity > 0);
    } else if (stock === 'out-of-stock') {
      products = products.filter(p => p.stockQuantity === 0);
    }

    // Sorting
    products = [...products].sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.priceValue - b.priceValue;
        case 'price-desc': return b.priceValue - a.priceValue;
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'name-asc':
        default: return a.name.localeCompare(b.name);
      }
    });

    return products;
  });

  get hasActiveFilters(): boolean {
    return this.searchQuery().length > 0
      || this.selectedCategoryId() !== null
      || this.selectedPriceRange() !== null
      || this.selectedStock() !== null;
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.selectedCategoryId()) count++;
    if (this.selectedPriceRange()) count++;
    if (this.selectedStock()) count++;
    return count;
  }

  selectCategory(id: string | null): void {
    this.selectedCategoryId.set(id);
  }

  selectPriceRange(label: string | null): void {
    this.selectedPriceRange.set(this.selectedPriceRange() === label ? null : label);
  }

  selectStock(value: string | null): void {
    this.selectedStock.set(this.selectedStock() === value ? null : value);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set(null);
    this.selectedPriceRange.set(null);
    this.selectedStock.set(null);
    this.sortBy.set('name-asc');
    this.loadPage(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.loadPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update(v => !v);
    document.body.style.overflow = this.filterPanelOpen() ? 'hidden' : '';
  }
}
