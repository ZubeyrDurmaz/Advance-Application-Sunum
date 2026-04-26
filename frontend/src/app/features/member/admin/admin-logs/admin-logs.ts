import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../../shared/navbar/navbar';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuditLog } from '../../../../core/models/audit-log.model';

@Component({
  selector: 'app-admin-logs',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './admin-logs.html',
  styleUrl: '../admin.css'
})
export class AdminLogs implements OnInit {
  logs: AuditLog[] = [];
  loading = true;
  error = false;
  
  // Filtering
  searchTerm = '';
  filterAction = '';

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.loading = true;
    this.error = false;
    this.auditLogService.getAllLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch logs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  downloadCsv(): void {
    this.auditLogService.downloadCsv();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  get filteredLogs(): AuditLog[] {
    return this.logs.filter(log => {
      const matchSearch = !this.searchTerm || 
        log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(this.searchTerm.toLowerCase());
        
      const matchAction = !this.filterAction || log.action === this.filterAction;
      
      return matchSearch && matchAction;
    });
  }

  get uniqueActions(): string[] {
    const actions = new Set(this.logs.map(l => l.action));
    return Array.from(actions).sort();
  }

  getActionIcon(action: string): string {
    if (action.includes('USER')) return 'person';
    if (action.includes('ORDER')) return 'receipt_long';
    if (action.includes('DISCOUNT')) return 'loyalty';
    if (action.includes('STORE')) return 'storefront';
    if (action.includes('PRODUCT')) return 'inventory_2';
    if (action.includes('CONFIG')) return 'tune';
    return 'history';
  }
}
