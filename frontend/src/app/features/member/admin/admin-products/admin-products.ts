import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService, ProductRequest } from '../../../../core/services/admin.service';
import { ProductResponse } from '../../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, CommonModule, FormsModule, Navbar],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit {
  products = signal<ProductResponse[]>([]);
  searchQuery = signal('');
  loading = true;
  errorMessage = '';
  editingProduct: ProductResponse | null = null;
  editForm: ProductRequest = {};

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.products().filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.storeName ?? '').toLowerCase().includes(q)
    );
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.adminService.getProducts().subscribe({
      next: (data) => { this.products.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load products.'; this.loading = false; }
    });
  }

  downloadCsv(): void {
    this.adminService.downloadProductsCsv();
  }

  openEdit(p: ProductResponse): void {
    this.editingProduct = p;
    this.editForm = { name: p.name, sku: p.sku, unitPrice: p.unitPrice, stockQuantity: p.stockQuantity ?? 0 };
  }

  submitEdit(): void {
    if (!this.editingProduct) return;
    this.adminService.updateProduct(this.editingProduct.id, this.editForm).subscribe({
      next: (updated) => {
        this.products.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.editingProduct = null;
      },
      error: () => alert('Failed to update product.')
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Delete this product permanently?')) return;
    this.adminService.deleteProduct(id).subscribe({
      next: () => this.products.update(list => list.filter(x => x.id !== id)),
      error: () => alert('Failed to delete product.')
    });
  }

  cancelEdit(): void { this.editingProduct = null; }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }

  stockStatus(qty: number | undefined): string {
    const q = qty ?? 0;
    if (q === 0) return 'out-of-stock';
    if (q <= 5) return 'low-stock';
    return 'in-stock';
  }
}
