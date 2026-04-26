import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { CorporateService } from '../../../../core/services/corporate.service';
import { StoreInfo } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-corp-settings',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './corp-settings.html',
  styleUrl: './corp-settings.css',
})
export class CorpSettings implements OnInit {
  store: StoreInfo | null = null;
  storeName = '';
  loading = true;
  saving = false;
  saved = false;
  errorMessage = '';

  constructor(private corporateService: CorporateService) {}

  ngOnInit(): void {
    this.corporateService.getStore().subscribe({
      next: (s) => { this.store = s; this.storeName = s.name; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load store settings.'; this.loading = false; }
    });
  }

  saveSettings(): void {
    if (!this.storeName.trim()) return;
    this.saving = true;
    this.corporateService.updateStore(this.storeName).subscribe({
      next: (s) => {
        this.store = s;
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Failed to save settings.';
      }
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }
}
