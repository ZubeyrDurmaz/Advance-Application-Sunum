import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-indicator',
  imports: [AsyncPipe],
  template: `
    @if (loading$ | async) {
      <div class="loading-bar"></div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
      z-index: 9999;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class LoadingIndicator {
  private loadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;
}
