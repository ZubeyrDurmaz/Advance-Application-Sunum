import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" [class.payment-skeleton]="type === 'payment'" [class.address-skeleton]="type === 'address'">
      <div class="skeleton-header">
        <div class="skeleton-badge"></div>
        <div class="skeleton-actions">
          <div class="skeleton-icon"></div>
          <div class="skeleton-icon"></div>
          <div class="skeleton-icon"></div>
        </div>
      </div>
      
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line-lg"></div>
        <div class="skeleton-line skeleton-line-md"></div>
        <div class="skeleton-line skeleton-line-sm"></div>
      </div>
      
      <div class="skeleton-footer">
        <div class="skeleton-line skeleton-line-xs"></div>
        <div class="skeleton-badge-sm"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .skeleton-badge {
      width: 80px;
      height: 24px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .skeleton-actions {
      display: flex;
      gap: 8px;
    }

    .skeleton-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }

    .skeleton-body {
      margin-bottom: 16px;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .skeleton-line-lg {
      width: 100%;
    }

    .skeleton-line-md {
      width: 75%;
    }

    .skeleton-line-sm {
      width: 50%;
    }

    .skeleton-line-xs {
      width: 40%;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skeleton-badge-sm {
      width: 60px;
      height: 20px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 10px;
    }
  `]
})
export class SkeletonCardComponent {
  @Input() type: 'payment' | 'address' = 'payment';
}
