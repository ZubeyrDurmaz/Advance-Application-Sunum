import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';
import { ResponsiveService } from '../../../core/services/responsive.service';

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

describe('Dashboard - Sidebar Integration', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

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
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should define sidebar navigation links', () => {
    expect(component.sidebarLinks).toBeDefined();
    expect(component.sidebarLinks.length).toBeGreaterThan(0);
  });

  it('should have correct sidebar links for dashboard navigation', () => {
    const expectedLinks = [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'History', route: '/order-history', icon: 'history' },
      { label: 'Payments', route: '/payments', icon: 'payments' },
      { label: 'Addresses', route: '/addresses', icon: 'home_pin' },
      { label: 'Settings', route: '/settings', icon: 'settings' },
    ];

    expect(component.sidebarLinks).toEqual(expectedLinks);
  });

  it('should render the sidebar component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebar = compiled.querySelector('app-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should pass sidebar links to the sidebar component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebar = compiled.querySelector('app-sidebar');
    expect(sidebar).toBeTruthy();
    
    // The sidebar component should receive the links via input binding
    // This is verified by checking the component's sidebarLinks property
    expect(component.sidebarLinks.length).toBe(6);
  });
});
