import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../../shared/navbar/navbar';
import { Sidebar, SidebarLink } from '../../../shared/sidebar/sidebar';
import { LazyLoadDirective } from '../../../shared/directives/lazy-load.directive';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { AddressService } from '../../../core/services/address.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { CartService } from '../../../core/services/cart.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { UserAddress } from '../../../core/models/address.model';
import { UserPaymentMethod } from '../../../core/models/payment-method.model';
import { CategorySpending, MonthlyActivity } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, Navbar, Sidebar, LazyLoadDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  sidebarLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'History', route: '/order-history', icon: 'history' },
    { label: 'Payments', route: '/payments', icon: 'payments' },
    { label: 'Addresses', route: '/addresses', icon: 'home_pin' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  stats: DashboardStats | null = null;
  addresses: UserAddress[] = [];
  paymentMethods: UserPaymentMethod[] = [];
  userName = '';
  loading = true;
  addressesLoading = true;
  paymentsLoading = true;
  cartLoading = true;
  error: string | null = null;
  
  // Analytics data
  categorySpending: CategorySpending[] = [];
  monthlyActivity: MonthlyActivity[] = [];
  currentYear = new Date().getFullYear();
  selectedYear: number | null = new Date().getFullYear();
  analyticsLoading = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private addressService: AddressService,
    private paymentMethodService: PaymentMethodService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUser()?.name ?? '';
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Paralel veri çekme
    forkJoin({
      stats: this.userService.getDashboardStats(),
      addresses: this.addressService.getAddresses(),
      paymentMethods: this.paymentMethodService.getPaymentMethods(),
      categorySpending: this.userService.getSpendingByCategory(this.selectedYear),
      monthlyActivity: this.userService.getMonthlyActivity(this.selectedYear)
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.addresses = data.addresses;
        this.paymentMethods = data.paymentMethods;
        this.categorySpending = data.categorySpending;
        this.monthlyActivity = this.fillMissingMonths(data.monthlyActivity);
        this.loading = false;
        this.addressesLoading = false;
        this.paymentsLoading = false;
        this.cartLoading = false;
        this.analyticsLoading = false;
        this.error = null;
      },
      error: (error) => {
        console.error('Dashboard data loading error:', error);
        this.error = 'Failed to load dashboard data. Please try refreshing the page.';
        this.loading = false;
        this.addressesLoading = false;
        this.paymentsLoading = false;
        this.cartLoading = false;
        this.analyticsLoading = false;
      }
    });
  }

  private fillMissingMonths(data: MonthlyActivity[]): MonthlyActivity[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap = new Map<string, MonthlyActivity>();
    
    // Backend'den gelen veriyi map'e ekle
    data.forEach(item => {
      monthMap.set(item.month, item);
    });
    
    // All Time için current year kullan, yoksa selected year
    const displayYear = this.selectedYear ?? this.currentYear;
    
    // Tüm ayları oluştur, eksik olanları 0 ile doldur
    const allMonths: MonthlyActivity[] = monthNames.map(month => {
      if (monthMap.has(month)) {
        return monthMap.get(month)!;
      } else {
        return {
          month: month,
          year: displayYear,
          orderCount: 0,
          percentage: 0
        };
      }
    });
    
    return allMonths;
  }

  retryLoadData(): void {
    this.loading = true;
    this.error = null;
    this.loadDashboardData();
  }

  get totalSpentFormatted(): string {
    if (!this.stats?.totalSpent) return '$0';
    return `$${Number(this.stats.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  get addressCountText(): string {
    if (this.addressesLoading) return 'Loading...';
    const count = this.addresses.length;
    return count === 1 ? '1 Address' : `${count} Addresses`;
  }

  get paymentMethodCountText(): string {
    if (this.paymentsLoading) return 'Loading...';
    const count = this.paymentMethods.length;
    return count === 1 ? '1 Payment Method' : `${count} Payment Methods`;
  }

  get cartItemCountText(): string {
    const count = this.cartItemCount;
    return count === 1 ? '1 Item' : `${count} Items`;
  }

  changeYear(year: number | null): void {
    this.selectedYear = year;
    this.analyticsLoading = true;
    
    // Clear current data to show loading state immediately
    this.monthlyActivity = [];
    this.categorySpending = [];
    
    // year null ise All Time, değilse specific year
    const yearParam = year === null ? null : year;
    
    // Both analytics data'yı paralel çek
    forkJoin({
      categorySpending: this.userService.getSpendingByCategory(yearParam),
      monthlyActivity: this.userService.getMonthlyActivity(yearParam)
    }).subscribe({
      next: (data) => {
        this.categorySpending = data.categorySpending;
        this.monthlyActivity = this.fillMissingMonths(data.monthlyActivity);
        this.analyticsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load analytics data:', error);
        this.categorySpending = [];
        this.monthlyActivity = this.fillMissingMonths([]);
        this.analyticsLoading = false;
      }
    });
  }
}
