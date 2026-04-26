import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Component({
  selector: 'app-error-toast',
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast" [class.visible]="toast.visible">
          <span class="material-symbols-outlined">error</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="dismiss(toast.id)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #1a1a1a;
      color: #f0f0f0;
      border: 1px solid #c9a84c44;
      border-left: 3px solid #c9a84c;
      padding: 12px 16px;
      border-radius: 4px;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      font-size: 0.875rem;
    }
    .toast.visible {
      opacity: 1;
      transform: translateX(0);
    }
    .toast .material-symbols-outlined { color: #c9a84c; font-size: 18px; flex-shrink: 0; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .toast-close .material-symbols-outlined { font-size: 16px; color: #888; }
    .toast-close:hover .material-symbols-outlined { color: #f0f0f0; }
  `]
})
export class ErrorToast implements OnInit, OnDestroy {
  private errorHandler = inject(ErrorHandlerService);
  toasts: Array<{ id: number; message: string; visible: boolean }> = [];
  private counter = 0;
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.errorHandler.error$.subscribe(message => this.show(message));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  show(message: string): void {
    const id = ++this.counter;
    this.toasts.push({ id, message, visible: false });
    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) t.visible = true;
    }, 10);
    setTimeout(() => this.dismiss(id), 5000);
  }

  dismiss(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (t) {
      t.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }
  }
}
