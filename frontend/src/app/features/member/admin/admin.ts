import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/navbar/navbar';
import { AdminService } from '../../../core/services/admin.service';
import { PlatformAnalytics } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule, Navbar],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  analytics: PlatformAnalytics | null = null;
  loading = true;
  error = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAnalytics().subscribe({
      next: (a) => { this.analytics = a; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  formatPrice(p: number): string {
    return `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  }
}
