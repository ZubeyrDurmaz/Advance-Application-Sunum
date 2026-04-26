import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService } from '../../../../core/services/admin.service';
import { OrderResponse } from '../../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink, CommonModule, FormsModule, Navbar],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  loading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter = '';
  storeFilter = '';
  storeNames: string[] = [];

  readonly statuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.storeNames = [...new Set(data.map(o => o.storeName).filter(Boolean))];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.orders];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(term) ||
        (o.customerName && o.customerName.toLowerCase().includes(term)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(term)) ||
        (o.storeName && o.storeName.toLowerCase().includes(term))
      );
    }

    if (this.statusFilter) {
      result = result.filter(o => o.status === this.statusFilter);
    }

    if (this.storeFilter) {
      result = result.filter(o => o.storeName === this.storeFilter);
    }

    this.filteredOrders = result;
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) this.orders[idx] = updated;
        this.applyFilters();
      },
      error: () => alert('Failed to update order status.')
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusClass(status: string): string {
    return 'order-status order-status--' + (status ?? '').toLowerCase();
  }

  get totalRevenue(): number {
    return this.filteredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  }
}
