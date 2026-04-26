import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { ResponsiveService } from '../../../../core/services/responsive.service';
import { CorporateService, ProductRequest } from '../../../../core/services/corporate.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductResponse, Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-inventory',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private responsive = inject(ResponsiveService);
  private corporateService = inject(CorporateService);
  private categoryService = inject(CategoryService);

  isMobile = this.responsive.isMobile;
  searchQuery = signal('');
  filterStatus = signal('all');
  editingProduct: ProductResponse | null = null;
  showAddForm = false;
  loading = true;
  errorMessage = '';
  categories: Category[] = [];

  newProduct: ProductRequest = { name: '', sku: '', unitPrice: 0, stockQuantity: 0 };
  editForm: Partial<ProductRequest> = {};

  products = signal<ProductResponse[]>([]);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.filterStatus();
    return this.products().filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const stock = p.stockQuantity ?? 0;
      const matchStatus = s === 'all'
        || (s === 'in-stock' && stock > 5)
        || (s === 'low-stock' && stock > 0 && stock <= 5)
        || (s === 'out-of-stock' && stock === 0);
      return matchSearch && matchStatus;
    });
  });

  ngOnInit(): void {
    this.load();
    this.categoryService.getAllCategories().subscribe(c => this.categories = c);
  }

  private load(): void {
    this.loading = true;
    this.corporateService.getProducts().subscribe({
      next: (data) => { this.products.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load inventory.'; this.loading = false; }
    });
  }

  stockStatus(qty: number | undefined): string {
    const q = qty ?? 0;
    if (q === 0) return 'out-of-stock';
    if (q <= 5) return 'low-stock';
    return 'in-stock';
  }

  openAdd(): void {
    this.showAddForm = true;
    this.newProduct = { name: '', sku: '', unitPrice: 0, stockQuantity: 0 };
  }

  submitAdd(): void {
    this.corporateService.createProduct(this.newProduct).subscribe({
      next: (p) => { this.products.update(list => [...list, p]); this.showAddForm = false; },
      error: () => { this.errorMessage = 'Failed to add product.'; }
    });
  }

  openEdit(p: ProductResponse): void {
    this.editingProduct = p;
    this.editForm = { name: p.name, sku: p.sku, unitPrice: p.unitPrice, stockQuantity: p.stockQuantity ?? 0 };
  }

  submitEdit(): void {
    if (!this.editingProduct) return;
    this.corporateService.updateProduct(this.editingProduct.id, this.editForm).subscribe({
      next: (updated) => {
        this.products.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.editingProduct = null;
      },
      error: () => { this.errorMessage = 'Failed to update product.'; }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.corporateService.deleteProduct(id).subscribe({
      next: () => this.products.update(list => list.filter(x => x.id !== id)),
      error: () => { this.errorMessage = 'Failed to delete product.'; }
    });
  }

  cancelEdit(): void { this.editingProduct = null; }
  cancelAdd(): void { this.showAddForm = false; }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }
}
