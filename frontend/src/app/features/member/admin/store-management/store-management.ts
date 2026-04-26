import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService } from '../../../../core/services/admin.service';
import { StoreInfo } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-store-management',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './store-management.html',
  styleUrl: './store-management.css',
})
export class StoreManagement implements OnInit {
  searchQuery = signal('');
  loading = true;
  errorMessage = '';

  stores = signal<StoreInfo[]>([]);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return !q ? this.stores()
      : this.stores().filter(s => s.name.toLowerCase().includes(q)
          || (s.ownerName ?? '').toLowerCase().includes(q));
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStores().subscribe({
      next: (data) => { this.stores.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load stores.'; this.loading = false; }
    });
  }

  updateStatus(storeId: string, status: string): void {
    this.adminService.updateStoreStatus(storeId, status).subscribe({
      next: (updated) => {
        this.stores.update(list => list.map(s => s.id === updated.id ? updated : s));
      },
      error: () => { this.errorMessage = 'Failed to update store status.'; }
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
