import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { CorporateService } from '../../../../core/services/corporate.service';
import { CustomerInfo } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-customers',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  searchQuery = signal('');
  loading = true;
  errorMessage = '';

  customers = signal<CustomerInfo[]>([]);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return !q ? this.customers()
      : this.customers().filter(c =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  });

  constructor(private corporateService: CorporateService) {}

  ngOnInit(): void {
    this.corporateService.getCustomers().subscribe({
      next: (data) => { this.customers.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load customers.'; this.loading = false; }
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }
}
