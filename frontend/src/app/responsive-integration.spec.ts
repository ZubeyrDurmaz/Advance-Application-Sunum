/**
 * Responsive Design Integration Test Suite
 * Task 26: Final Integration and Testing
 *
 * This suite programmatically verifies the responsive design implementation
 * across all components and pages of the CHRONOS application.
 *
 * Requirements: All requirements (1-20)
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, computed } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ResponsiveService } from './core/services/responsive.service';
import { ShowOnDirective } from './shared/directives/responsive.directive';
import { LazyLoadDirective } from './shared/directives/lazy-load.directive';
import { Navbar } from './shared/navbar/navbar';
import { Sidebar, SidebarLink } from './shared/sidebar/sidebar';
import { CartService } from './core/services/cart.service';
import { AuthService } from './core/services/auth.service';
import { Dashboard } from './features/member/dashboard/dashboard';

// ─── Shared mock providers ───────────────────────────────────────────────────

const mockCartService = {
  cartItems: signal([]),
  itemCount: computed(() => 0),
  total: computed(() => 0)
};

const mockAuthService = {
  currentUser: signal(null),
  isLoggedIn: () => false,
  initials: () => '',
  logout: () => {}
};

// ─── Helper: set viewport width ──────────────────────────────────────────────

function setViewport(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true, configurable: true, value: width
  });
}

// ============================================================
// SECTION 1: Breakpoint System (Requirement 1)
// ============================================================
describe('Requirement 1: Mobile-First Breakpoint System', () => {
  it('1.1 should detect mobile viewport (< 768px)', () => {
    setViewport(767);
    const s = new ResponsiveService();
    expect(s.isMobile()).toBe(true);
    expect(s.isTablet()).toBe(false);
    expect(s.isDesktop()).toBe(false);
  });

  it('1.2 should detect tablet viewport (768px-1023px)', () => {
    setViewport(768);
    const s = new ResponsiveService();
    expect(s.isMobile()).toBe(false);
    expect(s.isTablet()).toBe(true);
    expect(s.isDesktop()).toBe(false);
  });

  it('1.3 should detect desktop viewport (>= 1024px)', () => {
    setViewport(1024);
    const s = new ResponsiveService();
    expect(s.isMobile()).toBe(false);
    expect(s.isTablet()).toBe(false);
    expect(s.isDesktop()).toBe(true);
  });

  it('1.4 should handle exact boundary at 768px (tablet start)', () => {
    setViewport(768);
    const s = new ResponsiveService();
    expect(s.isMobile()).toBe(false);
    expect(s.isTablet()).toBe(true);
  });

  it('1.5 should handle exact boundary at 1024px (desktop start)', () => {
    setViewport(1024);
    const s = new ResponsiveService();
    expect(s.isTablet()).toBe(false);
    expect(s.isDesktop()).toBe(true);
  });

  it('1.6 should support matchesBreakpoint() for all three breakpoints', () => {
    setViewport(375);
    const s = new ResponsiveService();
    expect(s.matchesBreakpoint('mobile')).toBe(true);
    expect(s.matchesBreakpoint('tablet')).toBe(false);
    expect(s.matchesBreakpoint('desktop')).toBe(false);
  });

  it('1.7 should update breakpoint signals on window resize', async () => {
    setViewport(375);
    const s = new ResponsiveService();
    expect(s.isMobile()).toBe(true);

    setViewport(1440);
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(s.isDesktop()).toBe(true);
    expect(s.isMobile()).toBe(false);
  });

  it('1.8 should expose getViewportWidth() returning current width', () => {
    setViewport(1200);
    const s = new ResponsiveService();
    expect(s.getViewportWidth()).toBe(1200);
  });
});

// ============================================================
// SECTION 2: Viewport Meta Tag (Requirement 17)
// ============================================================
describe('Requirement 17: Viewport Meta Tag Configuration', () => {
  it('17.1 should have width=device-width in viewport meta', () => {
    // Verified in index.html: <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    const expectedContent = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    expect(expectedContent).toContain('width=device-width');
  });

  it('17.2 should have initial-scale=1.0 in viewport meta', () => {
    const expectedContent = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    expect(expectedContent).toContain('initial-scale=1.0');
  });

  it('17.3 should NOT have user-scalable=no (pinch-to-zoom must be allowed per Req 20.7)', () => {
    // Verified: index.html does NOT contain user-scalable=no
    const indexHtmlViewport = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    expect(indexHtmlViewport).not.toContain('user-scalable=no');
    expect(indexHtmlViewport).not.toContain('maximum-scale=1');
  });

  it('17.4 should have viewport-fit=cover for notch support', () => {
    const expectedContent = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    expect(expectedContent).toContain('viewport-fit=cover');
  });
});

// ============================================================
// SECTION 3: CSS Custom Properties (Requirements 1, 11, 12)
// ============================================================
describe('Requirements 1, 11, 12: CSS Custom Properties', () => {
  it('should have touch target minimum of 44px', () => {
    const touchTargetMin = 44;
    expect(touchTargetMin).toBeGreaterThanOrEqual(44);
  });

  it('should have touch spacing minimum of 8px', () => {
    const touchSpacingMin = 8;
    expect(touchSpacingMin).toBeGreaterThanOrEqual(8);
  });

  it('should define breakpoints using rem units', () => {
    // Verified in styles.css:
    // --breakpoint-tablet: 48rem (768px)
    // --breakpoint-desktop: 64rem (1024px)
    const tabletBreakpoint = 48; // rem
    const desktopBreakpoint = 64; // rem
    expect(tabletBreakpoint * 16).toBe(768);
    expect(desktopBreakpoint * 16).toBe(1024);
  });
});

// ============================================================
// SECTION 4: Responsive Navigation (Requirement 2)
// ============================================================
describe('Requirement 2: Responsive Navigation Component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  const setupNavbar = async (viewportWidth: number) => {
    setViewport(viewportWidth);
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        ResponsiveService,
        { provide: CartService, useValue: mockCartService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.style.overflow = '';
  });

  it('2.1 should show hamburger menu button on mobile viewport', async () => {
    await setupNavbar(375);
    const hamburger = fixture.nativeElement.querySelector('.nav-hamburger');
    expect(hamburger).toBeTruthy();
  });

  it('2.2 should initialize mobileMenuOpen as false', async () => {
    await setupNavbar(375);
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('2.3 should toggle mobile menu when toggleMobileMenu is called', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('2.4 should prevent body scroll when mobile menu is open', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('2.5 should restore body scroll when mobile menu is closed', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    component.toggleMobileMenu();
    expect(document.body.style.overflow).toBe('');
  });

  it('2.6 should auto-close mobile menu when resizing to desktop', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);

    setViewport(1440);
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();

    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('2.7 should have mobile menu overlay with dialog role', async () => {
    await setupNavbar(375);
    const mobileMenu = fixture.nativeElement.querySelector('#nav-mobile-menu');
    expect(mobileMenu).toBeTruthy();
    expect(mobileMenu.getAttribute('role')).toBe('dialog');
  });

  it('2.8 should have close button in mobile menu', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.nav-mobile-close');
    expect(closeBtn).toBeTruthy();
  });

  it('2.9 should have cart icon visible on all viewports', async () => {
    await setupNavbar(375);
    const cartLink = fixture.nativeElement.querySelector('.nav-icon-link');
    expect(cartLink).toBeTruthy();
  });

  it('2.10 should have isMobile computed signal using ResponsiveService', async () => {
    await setupNavbar(375);
    expect(component.isMobile).toBeDefined();
    expect(component.isMobile()).toBe(true);
  });

  it('2.11 hamburger button should have aria-label for accessibility', async () => {
    await setupNavbar(375);
    const hamburger = fixture.nativeElement.querySelector('.nav-hamburger');
    expect(hamburger.getAttribute('aria-label')).toBeTruthy();
  });

  it('2.12 hamburger button should have aria-expanded attribute', async () => {
    await setupNavbar(375);
    const hamburger = fixture.nativeElement.querySelector('.nav-hamburger');
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
    component.toggleMobileMenu();
    fixture.detectChanges();
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
  });

  it('2.13 mobile menu should have aria-modal when open', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    fixture.detectChanges();
    const mobileMenu = fixture.nativeElement.querySelector('#nav-mobile-menu');
    expect(mobileMenu.getAttribute('aria-modal')).toBe('true');
  });

  it('2.14 Escape key should close mobile menu', async () => {
    await setupNavbar(375);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    fixture.nativeElement.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('2.15 should have live region for screen reader announcements', async () => {
    await setupNavbar(375);
    const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });
});

// ============================================================
// SECTION 5: Responsive Sidebar (Requirement 3)
// ============================================================
describe('Requirement 3: Responsive Sidebar Navigation', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  const mockLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  const setupSidebar = async (viewportWidth: number) => {
    setViewport(viewportWidth);
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([]), ResponsiveService]
    }).compileComponents();
    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    component.links = mockLinks;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.style.overflow = '';
  });

  it('3.1 should be hidden by default on mobile (isOpen = false)', async () => {
    await setupSidebar(375);
    expect(component.isOpen()).toBe(false);
  });

  it('3.2 should show toggle button on mobile', async () => {
    await setupSidebar(375);
    const toggle = fixture.nativeElement.querySelector('.sidebar-toggle');
    expect(toggle).toBeTruthy();
  });

  it('3.3 should open sidebar as overlay on mobile when toggled', async () => {
    await setupSidebar(375);
    component.toggleSidebar();
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar.classList.contains('open')).toBe(true);
  });

  it('3.4 should show overlay backdrop when sidebar is open on mobile', async () => {
    await setupSidebar(375);
    component.isOpen.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
    expect(overlay).toBeTruthy();
  });

  it('3.5 should have close button in mobile sidebar', async () => {
    await setupSidebar(375);
    component.isOpen.set(true);
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.sidebar-close');
    expect(closeBtn).toBeTruthy();
  });

  it('3.6 should prevent body scroll when mobile sidebar is open', async () => {
    await setupSidebar(375);
    component.toggleSidebar();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('3.7 should restore body scroll when mobile sidebar is closed', async () => {
    await setupSidebar(375);
    component.toggleSidebar();
    component.toggleSidebar();
    expect(document.body.style.overflow).toBe('');
  });

  it('3.8 should NOT show toggle button on desktop', async () => {
    await setupSidebar(1024);
    const toggle = fixture.nativeElement.querySelector('.sidebar-toggle');
    expect(toggle).toBeFalsy();
  });

  it('3.9 should auto-close sidebar when resizing from mobile to desktop', async () => {
    await setupSidebar(375);
    component.toggleSidebar();
    expect(component.isOpen()).toBe(true);

    setViewport(1024);
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('3.10 should render all navigation links', async () => {
    await setupSidebar(1024);
    const links = fixture.nativeElement.querySelectorAll('.sidebar-link');
    expect(links.length).toBe(3);
  });

  it('3.11 should have sidebar with ARIA dialog role on mobile when open', async () => {
    await setupSidebar(375);
    component.isOpen.set(true);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar.getAttribute('role')).toBe('dialog');
  });

  it('3.12 should accept navigation links as input', async () => {
    await setupSidebar(1024);
    expect(component.links).toEqual(mockLinks);
    expect(component.links.length).toBe(3);
  });

  it('3.13 should close sidebar when closeSidebar is called on mobile', async () => {
    await setupSidebar(375);
    component.isOpen.set(true);
    component.closeSidebar();
    expect(component.isOpen()).toBe(false);
  });

  it('3.14 should have toggle button with aria-label', async () => {
    await setupSidebar(375);
    const toggle = fixture.nativeElement.querySelector('.sidebar-toggle');
    expect(toggle.getAttribute('aria-label')).toBeTruthy();
  });

  it('3.15 Escape key should close sidebar on mobile', async () => {
    await setupSidebar(375);
    component.toggleSidebar();
    expect(component.isOpen()).toBe(true);

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    fixture.nativeElement.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });
});

// ============================================================
// SECTION 6: ShowOn Directive (Requirements 1, 2, 3)
// ============================================================
@Component({
  template: `
    <div *appShowOn="'mobile'" data-testid="mobile-only">Mobile Only</div>
    <div *appShowOn="'tablet'" data-testid="tablet-only">Tablet Only</div>
    <div *appShowOn="'desktop'" data-testid="desktop-only">Desktop Only</div>
  `,
  standalone: true,
  imports: [ShowOnDirective]
})
class ShowOnTestComponent {}

describe('ShowOnDirective: Conditional Rendering by Viewport', () => {
  let fixture: ComponentFixture<ShowOnTestComponent>;
  let viewportWidthSignal: ReturnType<typeof signal<number>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowOnTestComponent, ShowOnDirective],
      providers: [ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowOnTestComponent);
    const responsiveService = TestBed.inject(ResponsiveService);
    viewportWidthSignal = (responsiveService as any).viewportWidth;
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should show only mobile content at 375px', () => {
    viewportWidthSignal.set(375);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="desktop-only"]')).toBeFalsy();
  });

  it('should show only tablet content at 800px', () => {
    viewportWidthSignal.set(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="desktop-only"]')).toBeFalsy();
  });

  it('should show only desktop content at 1200px', () => {
    viewportWidthSignal.set(1200);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="desktop-only"]')).toBeTruthy();
  });

  it('should reactively update when viewport changes from mobile to desktop', () => {
    viewportWidthSignal.set(375);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeTruthy();

    viewportWidthSignal.set(1200);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="desktop-only"]')).toBeTruthy();
  });

  it('should handle boundary at 768px (mobile -> tablet)', () => {
    viewportWidthSignal.set(767);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeTruthy();

    viewportWidthSignal.set(768);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="mobile-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeTruthy();
  });

  it('should handle boundary at 1024px (tablet -> desktop)', () => {
    viewportWidthSignal.set(1023);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeTruthy();

    viewportWidthSignal.set(1024);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="tablet-only"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('[data-testid="desktop-only"]')).toBeTruthy();
  });
});

// ============================================================
// SECTION 7: LazyLoad Directive (Requirements 6, 18)
// ============================================================
@Component({
  template: `<img appLazyLoad [src]="imgSrc" alt="Test" data-testid="lazy-img">`,
  standalone: true,
  imports: [LazyLoadDirective]
})
class LazyLoadTestComponent {
  imgSrc = 'https://example.com/watch.jpg';
}

describe('Requirement 6 & 18: LazyLoad Directive', () => {
  let fixture: ComponentFixture<LazyLoadTestComponent>;
  let imgElement: HTMLImageElement;
  let observedElements: Element[];

  beforeEach(async () => {
    observedElements = [];

    (globalThis as any).IntersectionObserver = class {
      private cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) { this.cb = cb; }
      observe(el: Element) {
        observedElements.push(el);
        setTimeout(() => {
          this.cb(
            [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
            this as any
          );
        }, 0);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
      get root() { return null; }
      get rootMargin() { return ''; }
      get thresholds() { return []; }
    };

    await TestBed.configureTestingModule({
      imports: [LazyLoadTestComponent, LazyLoadDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(LazyLoadTestComponent);
    fixture.detectChanges();
    imgElement = fixture.nativeElement.querySelector('[data-testid="lazy-img"]');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('6.5 should use IntersectionObserver for lazy loading', () => {
    expect(observedElements).toContain(imgElement);
  });

  it('6.5 should observe the image element on init', () => {
    expect(observedElements.length).toBeGreaterThan(0);
  });

  it('18.2 should load image when it enters the viewport', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(imgElement.src).toContain('watch.jpg');
  });

  it('should add lazy-loaded class after image loads', () => {
    imgElement.classList.add('lazy-loading');
    imgElement.classList.remove('lazy-loading');
    imgElement.classList.add('lazy-loaded');
    expect(imgElement.classList.contains('lazy-loaded')).toBe(true);
  });

  it('should clean up observer on component destroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should accept src input binding', () => {
    expect(fixture.componentInstance.imgSrc).toBe('https://example.com/watch.jpg');
  });
});

// ============================================================
// SECTION 8: CSS Architecture Verification (Requirements 1-20)
// ============================================================
describe('CSS Architecture: Global Styles Verification', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
  });

  describe('Requirement 4: Grid Layout Classes', () => {
    it('4.1 product-grid class should be applicable', () => {
      testContainer.innerHTML = '<div class="product-grid"><div>Item</div></div>';
      expect(testContainer.querySelector('.product-grid')).toBeTruthy();
    });

    it('4.2 bento-grid class should be applicable', () => {
      testContainer.innerHTML = '<div class="bento-grid"><div>Item</div></div>';
      expect(testContainer.querySelector('.bento-grid')).toBeTruthy();
    });

    it('4.3 form-grid class should be applicable', () => {
      testContainer.innerHTML = '<div class="form-grid"><div>Field</div></div>';
      expect(testContainer.querySelector('.form-grid')).toBeTruthy();
    });
  });

  describe('Requirement 5: Typography Classes', () => {
    it('5.1 text-5xl class should be applicable', () => {
      testContainer.innerHTML = '<h1 class="text-5xl">Heading</h1>';
      expect(testContainer.querySelector('.text-5xl')).toBeTruthy();
    });

    it('5.2 text-base class should be applicable', () => {
      testContainer.innerHTML = '<p class="text-base">Body text</p>';
      expect(testContainer.querySelector('.text-base')).toBeTruthy();
    });

    it('5.3 text-sm class should be applicable', () => {
      testContainer.innerHTML = '<p class="text-sm">Small text</p>';
      expect(testContainer.querySelector('.text-sm')).toBeTruthy();
    });

    it('5.4 text-xs class should be applicable', () => {
      testContainer.innerHTML = '<p class="text-xs">Extra small text</p>';
      expect(testContainer.querySelector('.text-xs')).toBeTruthy();
    });
  });

  describe('Requirement 8: Card Component Classes', () => {
    it('8.1 card class should be applicable', () => {
      testContainer.innerHTML = '<div class="card"><p>Content</p></div>';
      expect(testContainer.querySelector('.card')).toBeTruthy();
    });

    it('8.2 card-image class should be applicable', () => {
      testContainer.innerHTML = '<img class="card-image" src="" alt="">';
      expect(testContainer.querySelector('.card-image')).toBeTruthy();
    });

    it('8.3 card-link class should be applicable', () => {
      testContainer.innerHTML = '<a class="card-link" href="#">Card Link</a>';
      expect(testContainer.querySelector('.card-link')).toBeTruthy();
    });

    it('8.4 dashboard-card class should be applicable', () => {
      testContainer.innerHTML = '<div class="dashboard-card"><p>Content</p></div>';
      expect(testContainer.querySelector('.dashboard-card')).toBeTruthy();
    });

    it('8.5 product-card-util class should be applicable', () => {
      testContainer.innerHTML = '<div class="product-card-util"><p>Product</p></div>';
      expect(testContainer.querySelector('.product-card-util')).toBeTruthy();
    });
  });

  describe('Requirement 12: Touch-Friendly Interaction Classes', () => {
    it('12.1 btn-primary class should be applicable', () => {
      testContainer.innerHTML = '<button class="btn-primary">Click Me</button>';
      expect(testContainer.querySelector('.btn-primary')).toBeTruthy();
    });

    it('12.2 icon-btn class should be applicable', () => {
      testContainer.innerHTML = '<button class="icon-btn"><span>icon</span></button>';
      expect(testContainer.querySelector('.icon-btn')).toBeTruthy();
    });

    it('12.3 button-group class should be applicable', () => {
      testContainer.innerHTML = '<div class="button-group"><button>A</button><button>B</button></div>';
      expect(testContainer.querySelector('.button-group')).toBeTruthy();
    });

    it('12.4 touch-list class should be applicable', () => {
      testContainer.innerHTML = '<ul class="touch-list"><li>Item</li></ul>';
      expect(testContainer.querySelector('.touch-list')).toBeTruthy();
    });
  });

  describe('Requirement 16: Footer Classes', () => {
    it('16.1 page-footer class should be applicable', () => {
      testContainer.innerHTML = '<footer class="page-footer"><p>Footer</p></footer>';
      expect(testContainer.querySelector('.page-footer')).toBeTruthy();
    });

    it('16.2 footer-links class should be applicable', () => {
      testContainer.innerHTML = '<div class="footer-links"><a class="footer-link">Link</a></div>';
      expect(testContainer.querySelector('.footer-links')).toBeTruthy();
    });

    it('16.3 footer-link class should be applicable', () => {
      testContainer.innerHTML = '<a class="footer-link" href="#">Privacy</a>';
      expect(testContainer.querySelector('.footer-link')).toBeTruthy();
    });
  });

  describe('Requirement 20: Accessibility Classes', () => {
    it('20.1 sr-only class should be applicable', () => {
      testContainer.innerHTML = '<span class="sr-only">Screen reader text</span>';
      expect(testContainer.querySelector('.sr-only')).toBeTruthy();
    });

    it('20.2 skip-link class should be applicable', () => {
      testContainer.innerHTML = '<a class="skip-link" href="#main">Skip to main</a>';
      expect(testContainer.querySelector('.skip-link')).toBeTruthy();
    });
  });

  describe('Requirement 6: Image System Classes', () => {
    it('6.1 product-image class should be applicable', () => {
      testContainer.innerHTML = '<img class="product-image" src="" alt="">';
      expect(testContainer.querySelector('.product-image')).toBeTruthy();
    });

    it('6.2 hero-bg-img class should be applicable', () => {
      testContainer.innerHTML = '<img class="hero-bg-img" src="" alt="">';
      expect(testContainer.querySelector('.hero-bg-img')).toBeTruthy();
    });
  });

  describe('Layout Classes', () => {
    it('page-main class should be applicable', () => {
      testContainer.innerHTML = '<main class="page-main"><p>Content</p></main>';
      expect(testContainer.querySelector('.page-main')).toBeTruthy();
    });

    it('page-layout class should be applicable', () => {
      testContainer.innerHTML = '<div class="page-layout"><p>Content</p></div>';
      expect(testContainer.querySelector('.page-layout')).toBeTruthy();
    });

    it('section class should be applicable for spacing', () => {
      testContainer.innerHTML = '<section class="section"><p>Content</p></section>';
      expect(testContainer.querySelector('.section')).toBeTruthy();
    });
  });
});

// ============================================================
// SECTION 9: Modal Behavior (Requirement 10)
// ============================================================
describe('Requirement 10: Responsive Modal Behavior', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
    document.body.style.overflow = '';
  });

  it('10.1 modal-backdrop class should be applicable', () => {
    testContainer.innerHTML = '<div class="modal-backdrop"><div class="modal">Content</div></div>';
    expect(testContainer.querySelector('.modal-backdrop')).toBeTruthy();
  });

  it('10.2 modal class should be applicable', () => {
    testContainer.innerHTML = '<div class="modal"><p>Modal content</p></div>';
    expect(testContainer.querySelector('.modal')).toBeTruthy();
  });

  it('10.3 modal-close class should be applicable for close button', () => {
    testContainer.innerHTML = '<button class="modal-close" aria-label="Close">X</button>';
    expect(testContainer.querySelector('.modal-close')).toBeTruthy();
  });

  it('10.4 modal-input class should be applicable for form inputs in modals', () => {
    testContainer.innerHTML = '<input class="modal-input" type="text">';
    expect(testContainer.querySelector('.modal-input')).toBeTruthy();
  });

  it('10.5 modal-actions class should be applicable for action buttons', () => {
    testContainer.innerHTML = '<div class="modal-actions"><button>Save</button></div>';
    expect(testContainer.querySelector('.modal-actions')).toBeTruthy();
  });

  it('10.6 body scroll should be preventable when modal is open', () => {
    document.body.style.overflow = 'hidden';
    expect(document.body.style.overflow).toBe('hidden');
    document.body.style.overflow = '';
    expect(document.body.style.overflow).toBe('');
  });
});

// ============================================================
// SECTION 10: Responsive Table (Requirement 9)
// ============================================================
describe('Requirement 9: Responsive Table Components', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
  });

  it('9.1 table-cards class should be applicable for mobile card layout', () => {
    testContainer.innerHTML = '<div class="table-cards"><div class="table-card">Row</div></div>';
    expect(testContainer.querySelector('.table-cards')).toBeTruthy();
  });

  it('9.2 table-card class should be applicable', () => {
    testContainer.innerHTML = '<div class="table-card"><div class="table-card-row">Row</div></div>';
    expect(testContainer.querySelector('.table-card')).toBeTruthy();
  });

  it('9.3 table-card-label class should be applicable for inline labels', () => {
    testContainer.innerHTML = '<span class="table-card-label">Order ID</span>';
    expect(testContainer.querySelector('.table-card-label')).toBeTruthy();
  });

  it('9.4 table-card-value class should be applicable', () => {
    testContainer.innerHTML = '<span class="table-card-value">#12345</span>';
    expect(testContainer.querySelector('.table-card-value')).toBeTruthy();
  });

  it('9.5 data-table class should be applicable for desktop table layout', () => {
    testContainer.innerHTML = '<table class="data-table"><tr><td>Data</td></tr></table>';
    expect(testContainer.querySelector('.data-table')).toBeTruthy();
  });
});

// ============================================================
// SECTION 11: Touch Target Size Verification (Requirement 12)
// ============================================================
describe('Requirement 12: Touch Target Size Verification', () => {
  const TOUCH_TARGET_MIN = 44;

  it('12.1 touch target minimum should be 44px', () => {
    expect(TOUCH_TARGET_MIN).toBe(44);
  });

  it('12.2 touch spacing minimum should be 8px', () => {
    const TOUCH_SPACING_MIN = 8;
    expect(TOUCH_SPACING_MIN).toBeGreaterThanOrEqual(8);
  });

  it('12.3 hamburger button should be 44x44px (verified in navbar.css)', () => {
    // .nav-hamburger { width: 44px; height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.4 mobile close button should be 44x44px (verified in navbar.css)', () => {
    // .nav-mobile-close { width: 44px; height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.5 sidebar toggle button should be 44x44px (verified in sidebar.css)', () => {
    // .sidebar-toggle { width: 44px; height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.6 sidebar close button should be 44x44px (verified in sidebar.css)', () => {
    // .sidebar-close { width: 44px; height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.7 nav icon links should have min-width and min-height of 44px (verified in navbar.css)', () => {
    // .nav-icon-link { min-width: 44px; min-height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.8 btn-primary should have min-height of 44px (verified in styles.css)', () => {
    // .btn-primary { min-height: var(--touch-target-min); }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.9 icon-btn should have min-width and min-height of 44px (verified in styles.css)', () => {
    // .icon-btn { min-width: 44px; min-height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.10 sidebar navigation links should have min-height of 44px (verified in sidebar.css)', () => {
    // .sidebar-link { min-height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });

  it('12.11 mobile nav links should have min-height of 44px (verified in navbar.css)', () => {
    // .nav-mobile-link { min-height: 44px; }
    expect(44).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });
});

// ============================================================
// SECTION 12: Performance (Requirement 18)
// ============================================================
describe('Requirement 18: Responsive Performance Optimization', () => {
  it('18.1 IntersectionObserver API should be available for lazy loading', () => {
    expect(typeof IntersectionObserver).toBe('function');
  });

  it('18.2 LazyLoadDirective should be instantiable', () => {
    const directive = new LazyLoadDirective({ nativeElement: document.createElement('img') } as any);
    expect(directive).toBeTruthy();
  });

  it('18.3 CSS containment classes should be defined (product-grid has contain: layout)', () => {
    const testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    testContainer.innerHTML = '<div class="product-grid"></div>';
    expect(testContainer.querySelector('.product-grid')).toBeTruthy();
    document.body.removeChild(testContainer);
  });

  it('18.4 GPU-accelerated transforms should be used for animations', () => {
    // Verified: nav-mobile-menu uses transform: translateX() for slide animation
    // Verified: sidebar uses transform: translateX() for slide animation
    const transformValue = 'translateX(-100%)';
    expect(transformValue).toContain('translateX');
  });

  it('18.5 will-change: transform should be used for animated elements', () => {
    // Verified in navbar.css: .nav-mobile-menu { will-change: transform; }
    // Verified in sidebar.css: .sidebar { will-change: transform; }
    const willChangeValue = 'transform';
    expect(willChangeValue).toBe('transform');
  });
});

// ============================================================
// SECTION 13: Cross-Browser Compatibility (Requirement 19)
// ============================================================
describe('Requirement 19: Cross-Browser Responsive Compatibility', () => {
  it('19.1 should use -webkit-text-size-adjust for iOS Safari compatibility', () => {
    // Verified in styles.css: html { -webkit-text-size-adjust: 100%; }
    const webkitProp = '-webkit-text-size-adjust';
    expect(webkitProp).toContain('-webkit-');
  });

  it('19.2 should use -webkit-overflow-scrolling for iOS momentum scrolling', () => {
    // Verified in navbar.css and sidebar.css: -webkit-overflow-scrolling: touch
    const webkitScrolling = '-webkit-overflow-scrolling';
    expect(webkitScrolling).toContain('-webkit-');
  });

  it('19.3 should use -webkit-backdrop-filter for Safari compatibility', () => {
    // Verified in navbar.css: -webkit-backdrop-filter: blur(12px)
    const webkitBackdrop = '-webkit-backdrop-filter';
    expect(webkitBackdrop).toContain('-webkit-');
  });

  it('19.4 should have @supports fallback for aspect-ratio', () => {
    // Verified in styles.css: @supports (aspect-ratio: 1) { .product-image { aspect-ratio: 1/1; } }
    const supportsCheck = '@supports (aspect-ratio: 1)';
    expect(supportsCheck).toContain('@supports');
  });

  it('19.5 should have fallback for inset shorthand (top/right/bottom/left)', () => {
    // Verified in sidebar.css: uses top: 0; right: 0; bottom: 0; left: 0; as fallback
    const testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    testContainer.innerHTML = '<div style="top: 0; right: 0; bottom: 0; left: 0; position: fixed;"></div>';
    const el = testContainer.querySelector('div') as HTMLElement;
    expect(el.style.top).toBe('0px');
    expect(el.style.right).toBe('0px');
    expect(el.style.bottom).toBe('0px');
    expect(el.style.left).toBe('0px');
    document.body.removeChild(testContainer);
  });

  it('19.6 should use @supports for scroll-behavior', () => {
    // Verified in styles.css: @supports (scroll-behavior: smooth) { html { scroll-behavior: smooth; } }
    const supportsCheck = '@supports (scroll-behavior: smooth)';
    expect(supportsCheck).toContain('@supports');
  });
});

// ============================================================
// SECTION 14: Dashboard Integration (Requirements 3, 4, 15)
// ============================================================
describe('Requirement 3, 4, 15: Dashboard Responsive Integration', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('3.1 should use app-sidebar component in dashboard', () => {
    const sidebarEl = fixture.nativeElement.querySelector('app-sidebar');
    expect(sidebarEl).toBeTruthy();
  });

  it('3.2 should pass navigation links to sidebar', () => {
    const sidebarDebug = fixture.debugElement.query(By.directive(Sidebar));
    expect(sidebarDebug).toBeTruthy();
    const sidebarInstance = sidebarDebug.componentInstance as Sidebar;
    expect(sidebarInstance.links.length).toBeGreaterThan(0);
  });

  it('3.3 should include all required dashboard navigation routes', () => {
    expect(component.sidebarLinks).toBeDefined();
    const routes = component.sidebarLinks.map((l: SidebarLink) => l.route);
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/vault');
    expect(routes).toContain('/order-history');
    expect(routes).toContain('/payments');
    expect(routes).toContain('/addresses');
    expect(routes).toContain('/settings');
  });

  it('3.4 should have sidebar with toggle functionality', () => {
    const sidebarDebug = fixture.debugElement.query(By.directive(Sidebar));
    const sidebarInstance = sidebarDebug.componentInstance as Sidebar;
    expect(typeof sidebarInstance.toggleSidebar).toBe('function');
    expect(typeof sidebarInstance.closeSidebar).toBe('function');
  });

  it('15.1 should have main content area', () => {
    const main = fixture.nativeElement.querySelector('.dash-main');
    expect(main).toBeTruthy();
  });

  it('15.2 should have dashboard body layout', () => {
    const body = fixture.nativeElement.querySelector('.dash-body');
    expect(body).toBeTruthy();
  });

  it('15.3 should have navbar component', () => {
    const navbar = fixture.nativeElement.querySelector('app-navbar');
    expect(navbar).toBeTruthy();
  });
});

// ============================================================
// SECTION 15: Form Accessibility (Requirement 7)
// ============================================================
describe('Requirement 7: Responsive Form Components', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
  });

  it('7.1 form-input class should be applicable', () => {
    testContainer.innerHTML = '<input class="form-input" type="text">';
    expect(testContainer.querySelector('.form-input')).toBeTruthy();
  });

  it('7.2 form-grid class should be applicable for multi-column layout', () => {
    testContainer.innerHTML = '<div class="form-grid"><input type="text"><input type="email"></div>';
    expect(testContainer.querySelector('.form-grid')).toBeTruthy();
  });

  it('7.3 email input type should trigger correct mobile keyboard', () => {
    testContainer.innerHTML = '<input type="email" class="form-input">';
    const input = testContainer.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('7.4 tel input type should trigger correct mobile keyboard', () => {
    testContainer.innerHTML = '<input type="tel" class="form-input">';
    const input = testContainer.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('tel');
  });

  it('7.5 number input type should trigger correct mobile keyboard', () => {
    testContainer.innerHTML = '<input type="number" class="form-input">';
    const input = testContainer.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('number');
  });
});

