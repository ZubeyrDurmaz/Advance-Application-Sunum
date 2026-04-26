import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService } from '../../../../core/services/admin.service';
import { PlatformAnalytics as PlatformAnalyticsData } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-platform-analytics',
  imports: [RouterLink, CommonModule, Navbar],
  templateUrl: './platform-analytics.html',
  styleUrl: './platform-analytics.css',
})
export class PlatformAnalytics implements OnInit {
  data: PlatformAnalyticsData | null = null;
  loading = true;
  errorMessage = '';
  maxRevenue = 0;

  private readonly ALL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAnalytics().subscribe({
      next: (d) => {
        this.data = d;

        // Fill all 12 months — backend only returns months with orders
        const monthMap = new Map<string, { revenue: number; orders: number }>();
        this.ALL_MONTHS.forEach(m => monthMap.set(m, { revenue: 0, orders: 0 }));
        d.monthlyRevenue?.forEach(m => monthMap.set(m.month, { revenue: m.revenue, orders: m.orders }));
        this.data.monthlyRevenue = this.ALL_MONTHS.map(m => ({
          month: m,
          revenue: monthMap.get(m)!.revenue,
          orders: monthMap.get(m)!.orders,
        }));
        this.maxRevenue = Math.max(...this.data.monthlyRevenue.map(m => m.revenue), 1);

        this.loading = false;
      },
      error: () => { this.errorMessage = 'Failed to load analytics.'; this.loading = false; }
    });
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
}
