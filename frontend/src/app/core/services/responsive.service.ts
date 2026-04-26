import { Injectable, signal, computed } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

/**
 * Breakpoint type definition for viewport sizes
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * ResponsiveService provides centralized viewport detection and breakpoint management.
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  /**
   * Computed signal that returns true when viewport is mobile (< 768px)
   */
  isMobile = computed(() => this.viewportWidth() < 768);
  
  /**
   * Computed signal that returns true when viewport is tablet (768px - 1023px)
   */
  isTablet = computed(() => this.viewportWidth() >= 768 && this.viewportWidth() < 1024);
  
  /**
   * Computed signal that returns true when viewport is desktop (>= 1024px)
   */
  isDesktop = computed(() => this.viewportWidth() >= 1024);
  
  constructor() {
    // Only set up resize listener in browser environment
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(150), // Debounce resize events by 150ms
          map(() => window.innerWidth)
        )
        .subscribe(width => this.viewportWidth.set(width));
    }
  }
  
  /**
   * Check if the current viewport matches a specific breakpoint
   * @param breakpoint - The breakpoint to check ('mobile', 'tablet', or 'desktop')
   * @returns true if the viewport matches the specified breakpoint
   */
  matchesBreakpoint(breakpoint: Breakpoint): boolean {
    switch (breakpoint) {
      case 'mobile':
        return this.isMobile();
      case 'tablet':
        return this.isTablet();
      case 'desktop':
        return this.isDesktop();
    }
  }
  
  /**
   * Get the current viewport width
   * @returns The current viewport width in pixels
   */
  getViewportWidth(): number {
    return this.viewportWidth();
  }
}
