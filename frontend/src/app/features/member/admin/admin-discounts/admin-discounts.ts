import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService, DiscountCodeResponse, DiscountCodeRequest } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-discounts',
  imports: [RouterLink, CommonModule, FormsModule, Navbar],
  templateUrl: './admin-discounts.html',
  styleUrl: './admin-discounts.css',
})
export class AdminDiscounts implements OnInit {
  discounts: DiscountCodeResponse[] = [];
  loading = true;
  errorMessage = '';
  showForm = false;
  editingId: string | null = null;

  stores: { id: string; name: string }[] = [];

  form: DiscountCodeRequest = {
    code: '', discountType: 'PERCENTAGE', discountValue: 0,
    validFrom: '', validUntil: '', maxUses: 100, storeId: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDiscounts();
    this.adminService.getStores().subscribe(s => {
      this.stores = s.map(st => ({ id: st.id, name: st.name }));
    });
  }

  loadDiscounts(): void {
    this.loading = true;
    this.adminService.getDiscounts().subscribe({
      next: (data) => { this.discounts = data; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load discounts.'; this.loading = false; }
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { code: '', discountType: 'PERCENTAGE', discountValue: 0, validFrom: '', validUntil: '', maxUses: 100, storeId: '' };
    this.showForm = true;
  }

  openEdit(d: DiscountCodeResponse): void {
    this.editingId = d.id;
    this.form = {
      code: d.code,
      discountType: d.discountType,
      discountValue: d.discountValue,
      validFrom: d.validFrom ? d.validFrom.substring(0, 16) : '',
      validUntil: d.validUntil ? d.validUntil.substring(0, 16) : '',
      maxUses: d.maxUses,
      storeId: ''
    };
    this.showForm = true;
  }

  submitForm(): void {
    if (this.editingId) {
      this.adminService.updateDiscount(this.editingId, this.form).subscribe({
        next: () => { this.showForm = false; this.loadDiscounts(); },
        error: () => alert('Failed to update discount.')
      });
    } else {
      this.adminService.createDiscount(this.form).subscribe({
        next: () => { this.showForm = false; this.loadDiscounts(); },
        error: () => alert('Failed to create discount.')
      });
    }
  }

  toggleStatus(d: DiscountCodeResponse): void {
    this.adminService.toggleDiscount(d.id).subscribe({
      next: (updated) => {
        const idx = this.discounts.findIndex(x => x.id === d.id);
        if (idx !== -1) this.discounts[idx] = updated;
      },
      error: () => alert('Failed to toggle discount.')
    });
  }

  deleteDiscount(id: string): void {
    if (!confirm('Delete this discount code?')) return;
    this.adminService.deleteDiscount(id).subscribe({
      next: () => this.discounts = this.discounts.filter(d => d.id !== id),
      error: () => alert('Failed to delete discount.')
    });
  }

  cancelForm(): void { this.showForm = false; }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  isExpired(d: DiscountCodeResponse): boolean {
    if (!d.validUntil) return false;
    return new Date(d.validUntil) < new Date();
  }

  remainingUses(d: DiscountCodeResponse): number {
    return (d.maxUses ?? 0) - (d.usedCount ?? 0);
  }

  isMaxUsesReached(d: DiscountCodeResponse): boolean {
    if (!d.maxUses) return false;
    return (d.usedCount ?? 0) >= d.maxUses;
  }

  usagePercentage(d: DiscountCodeResponse): number {
    if (!d.maxUses) return 0;
    return Math.min(100, ((d.usedCount ?? 0) / d.maxUses) * 100);
  }
}
