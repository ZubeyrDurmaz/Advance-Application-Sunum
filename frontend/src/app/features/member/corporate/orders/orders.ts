import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { ResponsiveService } from '../../../../core/services/responsive.service';
import { CorporateService } from '../../../../core/services/corporate.service';
import { OrderResponse } from '../../../../core/models/order.model';

// Backend'den iki ayrı kaynak geliyor:
//  - DataSeeder: PENDING, SHIPPED, IN_TRANSIT, DELIVERED, COMPLETED
//  - Modal güncelleme: PROCESSING, TRANSIT, DELIVERED, CANCELLED
// Java'nın Türkçe locale ile toUpperCase() yapması nedeniyle
// statuslar PROCESSİNG / TRANSİT (Türkçe İ ile) gelebilir.
// normalize() ile önce Türkçe karakterleri ASCII'ye çeviriyoruz.
const STATUS_GROUP: Record<string, string> = {
  pending:    'processing',
  processing: 'processing',
  shipped:    'transit',
  transit:    'transit',
  in_transit: 'transit',
  delivered:  'delivered',
  completed:  'delivered',
  cancelled:  'cancelled',
  canceled:   'cancelled',
};

/** Türkçe İ/ı dahil tüm diacritic'leri temizleyip ASCII lowercase döndürür */
function normalizeStatus(s: string): string {
  return (s ?? '')
    .replace(/İ/g, 'i')   // İ → i  (Türkçe büyük noktalı I)
    .replace(/ı/g, 'i')   // ı → i  (Türkçe küçük noktasız I)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-orders',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private responsive = inject(ResponsiveService);
  private corporateService = inject(CorporateService);

  isMobile = this.responsive.isMobile;
  searchQuery = signal('');
  filterStatus = signal('all');
  loading = true;
  errorMessage = '';
  selectedOrder: OrderResponse | null = null;

  orders = signal<OrderResponse[]>([]);

  /** Bir siparişin normalize edilmiş grup adını döndürür */
  statusGroup(status: string): string {
    return STATUS_GROUP[normalizeStatus(status)] ?? 'other';
  }

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.filterStatus();
    return this.orders().filter(o => {
      const matchSearch = !q
        || o.id.toLowerCase().includes(q)
        || (o.storeName ?? '').toLowerCase().includes(q)
        || o.items.some(i => i.productName?.toLowerCase().includes(q));
      const matchStatus = s === 'all' || this.statusGroup(o.status) === s;
      return matchSearch && matchStatus;
    });
  });

  // ── Stat kartları için sayaçlar (reactive) ──
  processingCount = computed(() =>
    this.orders().filter(o => this.statusGroup(o.status) === 'processing').length
  );
  transitCount = computed(() =>
    this.orders().filter(o => this.statusGroup(o.status) === 'transit').length
  );
  deliveredCount = computed(() =>
    this.orders().filter(o => this.statusGroup(o.status) === 'delivered').length
  );

  ngOnInit(): void {
    this.corporateService.getOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load orders.'; this.loading = false; }
    });
  }

  updateStatus(orderId: string, status: string): void {
    this.corporateService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        if (this.selectedOrder?.id === updated.id) this.selectedOrder = updated;
      },
      error: () => { this.errorMessage = 'Failed to update order status.'; }
    });
  }

  openModal(order: OrderResponse): void { this.selectedOrder = order; }
  closeModal(): void { this.selectedOrder = null; }

  /** Status'u temiz lowercase string olarak döndürür (Türkçe İ dahil) */
  displayStatus(status: string): string {
    return normalizeStatus(status);
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
