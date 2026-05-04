import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { ReviewRequest } from '../../core/models/review.model';
import { AuthService } from '../../core/services/auth.service';

interface Spec { label: string; value: string; }
interface CraftItem { number: string; title: string; description: string; }
interface Review { title: string; author: string; date: string; body: string; starRating: number; }
interface RatingBar { label: string; pct: number; }
interface ProductData {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  price: string;
  heroImage: string;
  gallery: string[];
  description: string;
  specs: Spec[];
  features: string[];
}

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: ProductData | null = null;
  loading = true;
  loadError = false;
  currentProductId = '';

  craftsmanship: CraftItem[] = [
    { number: '01', title: 'Hand-Polished', description: 'Every single surface of the case is hand-finished by master polishers.' },
    { number: '02', title: 'Mechanical', description: 'The movement features hundreds of parts decorated with Côtes de Genève.' },
    { number: '03', title: 'The Seal', description: 'Our seal guarantees lifetime maintenance for every timepiece in our collection.' },
  ];

  reviews: Review[] = [];
  reviewsLoading = false;
  
  // Review pagination
  reviewPage = 0;
  reviewSize = 5;
  reviewTotalPages = 1;
  reviewTotalElements = 0;
  reviewHasMore = false;

  averageRating = 0;
  reviewCount = 0;
  ratingBars: RatingBar[] = [
    { label: '5', pct: 0 }, { label: '4', pct: 0 }, { label: '3', pct: 0 }, { label: '2', pct: 0 }, { label: '1', pct: 0 },
  ];

  showReviewForm = false;
  reviewRating = 5;
  reviewBody = '';
  reviewSubmitted = false;
  reviewError = '';
  isAuthenticated = false;
  isCorporate = false;
  showAuthPrompt = false;
  authPromptMessage = '';

  openReviewModal(): void {
    this.showReviewForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeReviewModal(): void {
    this.showReviewForm = false;
    document.body.style.overflow = '';
  }

  submitReview(): void {
    if (!this.reviewBody || !this.currentProductId) return;
    this.reviewError = '';
    const request: ReviewRequest = { starRating: this.reviewRating, sentiment: this.reviewBody };
    this.reviewService.submitReview(this.currentProductId, request).subscribe({
      next: (res) => {
        this.reviews.unshift({
          title: `${res.starRating} Star Review`,
          author: res.userName,
          date: new Date(res.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          body: res.sentiment,
          starRating: res.starRating,
        });
        this.reviewTotalElements++;
        this.computeRatingStats();
        this.reviewSubmitted = true;
        this.closeReviewModal();
        this.reviewBody = '';
        this.reviewRating = 5;
        setTimeout(() => this.reviewSubmitted = false, 3000);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.reviewError = 'You must be logged in to submit a review.';
        } else {
          this.reviewError = 'Failed to submit review. Please try again.';
        }
      }
    });
  }

  setRating(n: number): void { this.reviewRating = n; }

  constructor(
    private route: ActivatedRoute,
    public cartService: CartService,
    private productService: ProductService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isCorporate = this.authService.hasRole('CORPORATE');
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.loading = true;
      this.loadError = false;

      this.productService.getProductBySku(slug).subscribe({
        next: (res) => {
          this.currentProductId = res.id;

          // Build the spec list from the structured columns the backend returns.
          const specs: Spec[] = [];
          specs.push({ label: 'Reference', value: res.sku });
          if (res.movement)        specs.push({ label: 'Movement',        value: res.movement });
          if (res.material)        specs.push({ label: 'Material',        value: res.material });
          if (res.diameter)        specs.push({ label: 'Diameter',        value: res.diameter });
          if (res.powerReserve)    specs.push({ label: 'Power Reserve',   value: res.powerReserve });
          if (res.waterResistance) specs.push({ label: 'Water Resistance', value: res.waterResistance });
          specs.push({ label: 'Category', value: res.categoryName || 'Watch' });
          specs.push({ label: 'Stock',    value: (res.stockQuantity ?? 0) + ' available' });

          // Pick the hero image and gallery from the DB. No client-side fallback image.
          const gallery = (res.images && res.images.length > 0)
            ? res.images.slice()
            : (res.imageUrl ? [res.imageUrl] : []);
          const heroImage = res.imageUrl || gallery[0] || '';

          this.product = {
            id: res.id,
            name: res.name,
            brand: res.brand || res.storeName || 'Chronos',
            model: res.model || res.name,
            category: res.categoryName || 'Watch',
            price: `$${res.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            heroImage,
            gallery,
            description: res.description || '',
            specs,
            features: res.features ?? [],
          };
          this.loading = false;
          this.loadReviews(res.id);
        },
        error: () => {
          this.product = null;
          this.loadError = true;
          this.loading = false;
        }
      });
    });
  }

  private loadReviews(productId: string): void {
    this.reviewsLoading = true;
    this.reviewService.getProductReviewsPaginated(productId, this.reviewPage, this.reviewSize).subscribe({
      next: (data) => {
        const newReviews = data.content.map(r => ({
          title: `${r.starRating} Star Review`,
          author: r.userName,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          body: r.sentiment,
          starRating: r.starRating,
        }));
        
        if (this.reviewPage === 0) {
          this.reviews = newReviews;
        } else {
          this.reviews = [...this.reviews, ...newReviews];
        }
        
        this.reviewTotalPages = data.totalPages;
        this.reviewTotalElements = data.totalElements;
        this.reviewHasMore = data.hasNext;
        this.computeRatingStats();
        this.reviewsLoading = false;
      },
      error: () => { this.reviewsLoading = false; }
    });
  }

  loadMoreReviews(): void {
    if (this.reviewHasMore && !this.reviewsLoading) {
      this.reviewPage++;
      this.loadReviews(this.currentProductId);
    }
  }

  private computeRatingStats(): void {
    // Use total count from backend for accurate stats
    this.reviewCount = this.reviewTotalElements;
    if (this.reviewCount === 0) {
      this.averageRating = 0;
      this.ratingBars = [
        { label: '5', pct: 0 }, { label: '4', pct: 0 }, { label: '3', pct: 0 }, { label: '2', pct: 0 }, { label: '1', pct: 0 },
      ];
      return;
    }
    const sum = this.reviews.reduce((acc, r) => acc + r.starRating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.ratingBars = [5, 4, 3, 2, 1].map(star => {
      const count = this.reviews.filter(r => r.starRating === star).length;
      return { label: String(star), pct: Math.round((count / this.reviews.length) * 100) };
    });
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.isAuthenticated) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Please sign in to add items to your cart.';
      return;
    }
    if (this.isCorporate) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Corporate accounts cannot make purchases. Please use an individual account.';
      return;
    }
    this.cartService.add({
      productId: this.product.id,
      slug: this.product.specs[0]?.value ?? '',
      name: this.product.name,
      brand: this.product.brand,
      price: parseInt(this.product.price.replace(/[^0-9]/g, '')),
      priceLabel: this.product.price,
      image: this.product.heroImage,
      ref: this.product.specs[0]?.value ?? '',
      description: this.product.description,
    }).subscribe({
      next: () => {
        console.log('Added to cart successfully');
      },
      error: (error) => {
        console.error('Failed to add to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    });
  }

  buyNow(): void {
    if (!this.product) return;
    if (!this.isAuthenticated) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Please sign in to purchase.';
      return;
    }
    if (this.isCorporate) {
      this.showAuthPrompt = true;
      this.authPromptMessage = 'Corporate accounts cannot make purchases. Please use an individual account.';
      return;
    }
    // Add to cart and redirect to checkout
    const item = {
      productId: this.product.id,
      slug: this.product.specs[0]?.value ?? '',
      name: this.product.name,
      brand: this.product.brand,
      price: parseInt(this.product.price.replace(/[^0-9]/g, '')),
      priceLabel: this.product.price,
      image: this.product.heroImage,
      ref: this.product.specs[0]?.value ?? '',
      description: this.product.description,
    };
    this.cartService.add(item).subscribe({
      next: () => {
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        console.error('Failed to add to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  closeAuthPrompt(): void {
    this.showAuthPrompt = false;
    this.authPromptMessage = '';
  }
}
