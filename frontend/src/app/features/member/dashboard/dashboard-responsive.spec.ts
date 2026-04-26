import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { signal } from '@angular/core';

// Mock IntersectionObserver for jsdom test environment
if (typeof IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      setTimeout(() => {
        this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any);
      }, 0);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    get root() { return null; }
    get rootMargin() { return ''; }
    get thresholds() { return []; }
  };
}

describe('Dashboard - Responsive Sidebar Behavior', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let responsiveService: ResponsiveService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        ResponsiveService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    fixture.detectChanges();
  });

  it('should render sidebar component in the dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebar = compiled.querySelector('app-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should pass navigation links to sidebar component', () => {
    expect(component.sidebarLinks).toBeDefined();
    expect(component.sidebarLinks.length).toBe(6);
    
    // Verify all required navigation links are present
    const routes = component.sidebarLinks.map(link => link.route);
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/order-history');
    expect(routes).toContain('/payments');
    expect(routes).toContain('/addresses');
    expect(routes).toContain('/settings');
  });

  it('should have icons for all navigation links', () => {
    component.sidebarLinks.forEach(link => {
      expect(link.icon).toBeDefined();
      expect(link.icon).toBeTruthy();
    });
  });

  it('should have proper labels for all navigation links', () => {
    const labels = component.sidebarLinks.map(link => link.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('History');
    expect(labels).toContain('Payments');
    expect(labels).toContain('Addresses');
    expect(labels).toContain('Settings');
  });

  it('should integrate with ResponsiveService for mobile detection', () => {
    // The sidebar component should use ResponsiveService
    expect(responsiveService).toBeDefined();
    expect(responsiveService.isMobile).toBeDefined();
    expect(responsiveService.isTablet).toBeDefined();
    expect(responsiveService.isDesktop).toBeDefined();
  });
});
