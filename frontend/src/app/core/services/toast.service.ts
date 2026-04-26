import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toasts$ = this.toastSubject.asObservable();

  show(type: Toast['type'], message: string, duration: number = 4000): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      duration
    };
    this.toastSubject.next(toast);
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
