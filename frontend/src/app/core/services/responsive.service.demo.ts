/**
 * Demo file to verify ResponsiveService functionality
 * This file demonstrates how to use the ResponsiveService in components
 */

import { Component, effect } from '@angular/core';
import { ResponsiveService } from './responsive.service';

@Component({
  selector: 'app-responsive-demo',
  template: `
    <div class="demo-container">
      <h2>Responsive Service Demo</h2>
      
      <div class="viewport-info">
        <p>Current Viewport Width: {{ responsive.getViewportWidth() }}px</p>
        <p>Is Mobile: {{ responsive.isMobile() }}</p>
        <p>Is Tablet: {{ responsive.isTablet() }}</p>
        <p>Is Desktop: {{ responsive.isDesktop() }}</p>
      </div>

      <div class="breakpoint-checks">
        <h3>Breakpoint Checks</h3>
        <p>Matches Mobile: {{ responsive.matchesBreakpoint('mobile') }}</p>
        <p>Matches Tablet: {{ responsive.matchesBreakpoint('tablet') }}</p>
        <p>Matches Desktop: {{ responsive.matchesBreakpoint('desktop') }}</p>
      </div>

      <div class="conditional-rendering">
        <h3>Conditional Rendering Example</h3>
        @if (responsive.isMobile()) {
          <p>📱 Mobile View - Showing hamburger menu</p>
        }
        @if (responsive.isTablet()) {
          <p>📱 Tablet View - Showing compact navigation</p>
        }
        @if (responsive.isDesktop()) {
          <p>🖥️ Desktop View - Showing full navigation</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .viewport-info,
    .breakpoint-checks,
    .conditional-rendering {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 0.5rem;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    h3 {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0.5rem 0;
      color: #444;
    }
  `]
})
export class ResponsiveDemoComponent {
  constructor(public responsive: ResponsiveService) {
    // Example: React to viewport changes
    effect(() => {
      console.log('Viewport changed:', {
        width: this.responsive.getViewportWidth(),
        isMobile: this.responsive.isMobile(),
        isTablet: this.responsive.isTablet(),
        isDesktop: this.responsive.isDesktop()
      });
    });
  }
}

/**
 * Usage Examples:
 * 
 * 1. In a component constructor:
 *    constructor(private responsive: ResponsiveService) {}
 * 
 * 2. In a component template:
 *    @if (responsive.isMobile()) {
 *      <app-mobile-menu />
 *    } @else {
 *      <app-desktop-menu />
 *    }
 * 
 * 3. In component logic:
 *    ngOnInit() {
 *      if (this.responsive.matchesBreakpoint('mobile')) {
 *        // Mobile-specific initialization
 *      }
 *    }
 * 
 * 4. Reactive updates with effect:
 *    constructor(private responsive: ResponsiveService) {
 *      effect(() => {
 *        if (this.responsive.isMobile()) {
 *          this.closeSidebar();
 *        }
 *      });
 *    }
 */
