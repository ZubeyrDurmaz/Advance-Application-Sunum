import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { CorporateService } from '../../../../core/services/corporate.service';
import { CorporateAnalytics } from '../../../../core/models/dashboard.model';
import { OrderResponse } from '../../../../core/models/order.model';
import { ReviewResponse } from '../../../../core/models/review.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics',
  imports: [RouterLink, CommonModule, Navbar],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  data: CorporateAnalytics | null = null;
  orders: OrderResponse[] = [];
  reviews: ReviewResponse[] = [];
  allReviews: ReviewResponse[] = []; // Tüm reviews
  displayedReviewsCount = 10; // İlk gösterilecek review sayısı
  loading = true;
  errorMessage = '';
  maxRevenue = 0;

  constructor(private corporateService: CorporateService) {}

  private readonly ALL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  ngOnInit(): void {
    forkJoin({
      analytics: this.corporateService.getAnalytics(),
      orders: this.corporateService.getOrders(),
      reviews: this.corporateService.getReviews(),
    }).subscribe({
      next: ({ analytics, orders, reviews }) => {
        this.data = analytics;

        // Fill all 12 months — backend only returns months with orders
        const monthMap = new Map<string, { revenue: number; orders: number }>();
        this.ALL_MONTHS.forEach(m => monthMap.set(m, { revenue: 0, orders: 0 }));
        analytics.monthlySales?.forEach(m => monthMap.set(m.month, { revenue: m.revenue, orders: m.orders }));
        this.data.monthlySales = this.ALL_MONTHS.map(m => ({
          month: m,
          revenue: monthMap.get(m)!.revenue,
          orders: monthMap.get(m)!.orders,
        }));
        this.maxRevenue = Math.max(...this.data.monthlySales.map(m => m.revenue), 1);

        // Recent orders — son 10 sipariş
        this.orders = orders.slice(0, 10);

        // Reviews - tümünü sakla, ilk 10'unu göster
        this.allReviews = reviews;
        this.reviews = reviews.slice(0, this.displayedReviewsCount);

        this.loading = false;
      },
      error: (err) => { 
        console.error('Failed to load analytics data:', err);
        this.errorMessage = 'Failed to load analytics.'; 
        this.loading = false; 
      }
    });
  }

  loadMoreReviews(): void {
    this.displayedReviewsCount += 10;
    this.reviews = this.allReviews.slice(0, this.displayedReviewsCount);
  }

  get hasMoreReviews(): boolean {
    return this.displayedReviewsCount < this.allReviews.length;
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getBarHeight(revenue: number): string {
    if (!this.maxRevenue || this.maxRevenue === 0) return '5%';
    const pct = Math.max(5, Math.round((revenue / this.maxRevenue) * 100));
    return pct + '%';
  }

  getStatusClass(status: string): string {
    return 'corp-order-status corp-order-status--' + (status ?? '').toLowerCase();
  }

  getSentimentClass(sentiment: string): string {
    const s = (sentiment ?? '').toLowerCase();
    if (s === 'positive') return 'sentiment sentiment--positive';
    if (s === 'negative') return 'sentiment sentiment--negative';
    return 'sentiment sentiment--neutral';
  }

  starsArray = [1, 2, 3, 4, 5];
}
