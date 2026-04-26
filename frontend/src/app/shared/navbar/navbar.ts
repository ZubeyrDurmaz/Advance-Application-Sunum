import { Component, HostListener, ElementRef, signal, computed, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  dropdownOpen = false;
  mobileMenuOpen = signal(false);
  isMobile = computed(() => this.responsive.isMobile());

  // Reactive user name and initials
  userName = signal<string>('');
  userInitials = signal<string>('');
  userRole = signal<string>('');

  /** Accessible label for the cart link — announces item count to screen readers */
  cartAriaLabel = computed(() => {
    const count = this.cartService.itemCount();
    return count > 0 ? `Shopping cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Shopping cart, empty';
  });

  /** Live region message announced when mobile menu opens/closes */
  menuStatusMessage = computed(() =>
    this.mobileMenuOpen() ? 'Navigation menu opened' : 'Navigation menu closed'
  );

  constructor(
    public cartService: CartService,
    public auth: AuthService,
    private router: Router,
    private el: ElementRef,
    private responsive: ResponsiveService
  ) {
    // Auto-close mobile menu when viewport resizes from mobile to desktop
    effect(() => {
      if (!this.isMobile() && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
        document.body.style.overflow = '';
      }
    });

    // Subscribe to user changes
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userName.set(user.name);
        this.userRole.set(user.role);
        this.userInitials.set(user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));
      } else {
        this.userName.set('');
        this.userRole.set('');
        this.userInitials.set('');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  /** Trap Tab/Shift+Tab focus within the mobile menu when it is open */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mobileMenuOpen()) {
      this.closeMobileMenu();
      return;
    }

    if (!this.mobileMenuOpen() || event.key !== 'Tab') {
      return;
    }

    const menu = this.el.nativeElement.querySelector('#nav-mobile-menu') as HTMLElement | null;
    if (!menu) return;

    const focusable = this.getFocusableElements(menu);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if focus is on first element, wrap to last
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if focus is on last element, wrap to first
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  get dashboardRoute(): string {
    const role = this.auth.getCurrentUser()?.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'CORPORATE') return '/corporate';
    return '/dashboard';
  }

  toggleMobileMenu(): void {
    const wasOpen = this.mobileMenuOpen();
    this.mobileMenuOpen.update(v => !v);
    document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';

    if (!wasOpen) {
      // Menu just opened — move focus to the close button (first focusable element)
      setTimeout(() => {
        const menu = this.el.nativeElement.querySelector('#nav-mobile-menu') as HTMLElement | null;
        if (menu) {
          const focusable = this.getFocusableElements(menu);
          if (focusable.length > 0) {
            focusable[0].focus();
          }
        }
      }, 50); // small delay to allow CSS transition to start
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    document.body.style.overflow = '';
    // Return focus to the hamburger button
    const hamburger = this.el.nativeElement.querySelector('.nav-hamburger') as HTMLElement | null;
    hamburger?.focus();
  }

  logout(): void {
    this.dropdownOpen = false;
    this.auth.logout().subscribe();
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
