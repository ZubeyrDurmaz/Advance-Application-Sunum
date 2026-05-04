import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CorporateService } from '../../../core/services/corporate.service';
import { Navbar } from '../../../shared/navbar/navbar';
import { Sidebar, SidebarLink } from '../../../shared/sidebar/sidebar';
import { StoreInfo, CorporateAnalytics } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-corporate',
  imports: [CommonModule, RouterLink, Navbar, Sidebar],
  templateUrl: './corporate.html',
  styleUrl: './corporate.css',
})
export class Corporate implements OnInit {
  sidebarLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/corporate', icon: 'dashboard' },
    { label: 'Inventory', route: '/corporate/inventory', icon: 'inventory_2' },
    { label: 'Orders', route: '/corporate/orders', icon: 'receipt_long' },
    { label: 'Customers', route: '/corporate/customers', icon: 'group' },
    { label: 'Analytics', route: '/corporate/analytics', icon: 'bar_chart' },
    { label: 'Settings', route: '/corporate/corp-settings', icon: 'settings' },
  ];

  store: StoreInfo | null = null;
  analytics: CorporateAnalytics | null = null;
  loading = true;
  userName = '';

  constructor(private auth: AuthService, private corporateService: CorporateService) {}

  ngOnInit(): void {
    this.userName = this.auth.getCurrentUser()?.name ?? '';
    this.corporateService.getStore().subscribe({ 
      next: (s) => this.store = s,
      error: (err) => { 
        console.error('Failed to load store:', err);
        this.loading = false;
      }
    });
    this.corporateService.getAnalytics().subscribe({
      next: (a) => { this.analytics = a; this.loading = false; },
      error: (err) => { 
        console.error('Failed to load analytics:', err);
        this.loading = false; 
      }
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  formatPriceCompact(p: number): string {
    const val = Number(p);
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  }

  getFilledMonths() {
    if (!this.analytics) return [];
    
    // Support English and Turkish JVM outputs securely
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allMonthsTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    // Automatically determine Language from actual data (default TR)
    let isEnglish = this.analytics.monthlySales.some(m => ['Jan', 'Apr', 'May', 'Jun', 'Aug', 'Oct', 'Dec'].includes(m.month));
    const targetMonths = isEnglish ? allMonths : allMonthsTr;

    const map = new Map<string, any>();
    this.analytics.monthlySales.forEach(m => {
      // Normalize month string slightly to title case to match our array
      const normalizedStr = m.month.charAt(0).toUpperCase() + m.month.slice(1).toLowerCase();
      map.set(normalizedStr, m);
      // Also map original just in case
      map.set(m.month, m);
    });

    return targetMonths.map(month => {
      if (map.has(month)) {
        return map.get(month)!;
      }
      return { month: month, revenue: 0, orders: 0 };
    });
  }

  getMaxRevenue(): number {
    const filled = this.getFilledMonths();
    if (!filled?.length) return 1;
    return Math.max(...filled.map((m: any) => Number(m.revenue) || 0));
  }

  getBarHeight(revenue: number | string): string {
    const max = this.getMaxRevenue();
    const val = Number(revenue) || 0;
    if (max === 0) return '0%';
    let percentage = (val / max) * 100;
    if (val > 0 && percentage < 5) percentage = 5;
    return `${percentage}%`;
  }
}
