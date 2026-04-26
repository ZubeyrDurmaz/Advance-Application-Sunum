import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse } from '../../../core/models/order.model';

interface DisplayOrder {
  id: string;
  name: string;
  ref: string;
  date: string;
  value: string;
  status: string;
  paymentMethod: string;
  items: { name: string; sku: string; qty: number; price: number }[];
  image?: string;
  tracking?: string;
}

@Component({
  selector: 'app-order-history',
  imports: [RouterLink, CommonModule, TitleCasePipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit {
  private responsive = inject(ResponsiveService);
  private orderService = inject(OrderService);

  isMobile = this.responsive.isMobile;
  orders: DisplayOrder[] = [];
  selectedOrder: DisplayOrder | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data.map(o => this.mapOrder(o));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  private mapOrder(o: OrderResponse): DisplayOrder {
    const firstName = o.items[0];
    return {
      id: o.id,
      name: firstName ? firstName.productName : `Order #${o.id.slice(0, 8)}`,
      ref: firstName ? firstName.productSku : o.id.slice(0, 8),
      date: new Date(o.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      value: `$${o.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      status: o.status?.toLowerCase() ?? 'unknown',
      paymentMethod: o.paymentMethod,
      items: o.items.map(i => ({
        name: i.productName,
        sku: i.productSku,
        qty: i.quantity,
        price: i.price
      }))
    };
  }

  canCancel(order: DisplayOrder): boolean {
    const s = order.status.toLowerCase();
    return s !== 'shipped' && s !== 'delivered' && s !== 'cancelled';
  }

  cancelOrder(order: DisplayOrder, event?: Event): void {
    if (event) event.stopPropagation();
    if (!confirm('Are you sure you want to cancel this order?')) return;
    this.orderService.cancelOrder(order.id).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx !== -1) this.orders[idx] = this.mapOrder(updated);
        if (this.selectedOrder?.id === order.id) {
          this.selectedOrder = this.orders[idx];
        }
      },
      error: () => alert('Failed to cancel order.')
    });
  }

  openTracking(order: DisplayOrder): void {
    this.selectedOrder = order;
    document.body.style.overflow = 'hidden';
  }

  closeTracking(): void {
    this.selectedOrder = null;
    document.body.style.overflow = '';
  }
}
