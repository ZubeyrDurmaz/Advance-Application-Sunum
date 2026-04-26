import { Component, Input, signal, computed, effect, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ResponsiveService } from '../../core/services/responsive.service';

export interface SidebarLink {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() links: SidebarLink[] = [];
  
  isOpen = signal(false);
  isMobile = computed(() => this.responsive.isMobile());

  /** Live region message announced when sidebar opens/closes on mobile */
  sidebarStatusMessage = computed(() =>
    this.isOpen() ? 'Sidebar navigation opened' : 'Sidebar navigation closed'
  );

  constructor(
    private responsive: ResponsiveService,
    private el: ElementRef
  ) {
    // Auto-close sidebar when viewport resizes from mobile to desktop
    effect(() => {
      if (!this.isMobile() && this.isOpen()) {
        this.isOpen.set(false);
        document.body.style.overflow = '';
      }
    });
  }

  /** Trap Tab/Shift+Tab focus within the sidebar when it is open on mobile */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isMobile() || !this.isOpen()) return;

    if (event.key === 'Escape') {
      this.closeSidebar();
      // Return focus to the toggle button
      const toggle = this.el.nativeElement.querySelector('.sidebar-toggle') as HTMLElement | null;
      toggle?.focus();
      return;
    }

    if (event.key !== 'Tab') return;

    const sidebar = this.el.nativeElement.querySelector('.sidebar') as HTMLElement | null;
    if (!sidebar) return;

    const focusable = this.getFocusableElements(sidebar);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      const wasOpen = this.isOpen();
      this.isOpen.update(v => !v);
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = this.isOpen() ? 'hidden' : '';

      if (!wasOpen) {
        // Sidebar just opened — move focus to the close button
        setTimeout(() => {
          const sidebar = this.el.nativeElement.querySelector('.sidebar') as HTMLElement | null;
          if (sidebar) {
            const focusable = this.getFocusableElements(sidebar);
            if (focusable.length > 0) {
              focusable[0].focus();
            }
          }
        }, 50);
      }
    }
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.isOpen.set(false);
      document.body.style.overflow = '';
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
      el => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null
    );
  }
}
