import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, DashboardStats } from '../models/dashboard.model';
import { CategorySpending, MonthlyActivity } from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/me`);
  }

  updateProfile(data: { name?: string; email?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.api}/me`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.api}/me/password`, { currentPassword, newPassword });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/me/dashboard`);
  }

  getSpendingByCategory(year?: number | null): Observable<CategorySpending[]> {
    const params: Record<string, string> = {};
    if (year !== null && year !== undefined) {
      params['year'] = year.toString();
    }
    return this.http.get<CategorySpending[]>(`${this.api}/me/analytics/spending-by-category`, { params });
  }

  getMonthlyActivity(year?: number | null): Observable<MonthlyActivity[]> {
    const params: Record<string, string> = {};
    if (year !== null && year !== undefined) {
      params['year'] = year.toString();
    }
    return this.http.get<MonthlyActivity[]>(`${this.api}/me/analytics/monthly-activity`, { params });
  }
}
