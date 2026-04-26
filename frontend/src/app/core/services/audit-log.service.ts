import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/admin/logs`;

  constructor(private http: HttpClient) {}

  getAllLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }

  downloadCsv(): void {
    this.http.get(`${this.apiUrl}/csv`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit_logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
