import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminUser } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-user-management',
  imports: [RouterLink, FormsModule, CommonModule, Navbar],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  searchQuery = signal('');
  filterRole = signal('all');
  loading = true;
  errorMessage = '';

  users = signal<AdminUser[]>([]);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const r = this.filterRole();
    return this.users().filter(u => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = r === 'all' || u.role?.toLowerCase() === r.toLowerCase();
      return matchSearch && matchRole;
    });
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => { this.users.set(data); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load users.'; this.loading = false; }
    });
  }

  updateRole(userId: string, role: string): void {
    this.adminService.updateUserRole(userId, role).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
      },
      error: () => { this.errorMessage = 'Failed to update user role.'; }
    });
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
