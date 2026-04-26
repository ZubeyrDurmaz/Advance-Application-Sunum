import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { By } from '@angular/platform-browser';
import { Sidebar } from '../../../shared/sidebar/sidebar';

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

describe('Dashboard - Sidebar Integration (Task 15.1)', () => {
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

  describe('Requirement: Replace existing sidebar styles with SidebarComponent', () => {
    it('should use app-sidebar component instead of inline sidebar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const sidebarComponent = compiled.querySelector('app-sidebar');
      
      expect(sidebarComponent).toBeTruthy();
      
      // The sidebar should be rendered by the component, not inline HTML
      // Check that the sidebar is within the app-sidebar component
      const sidebarWithinComponent = sidebarComponent?.querySelector('aside.sidebar');
      expect(sidebarWithinComponent).toBeTruthy();
    });

    it('should render SidebarComponent with proper structure', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      expect(sidebarDebugElement).toBeTruthy();
      expect(sidebarDebugElement.componentInstance).toBeInstanceOf(Sidebar);
    });
  });

  describe('Requirement: Pass dashboard navigation links to sidebar', () => {
    it('should define sidebarLinks array with all navigation items', () => {
      expect(component.sidebarLinks).toBeDefined();
      expect(Array.isArray(component.sidebarLinks)).toBe(true);
      expect(component.sidebarLinks.length).toBe(6);
    });

    it('should pass links to sidebar component via input binding', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      expect(sidebarInstance.links).toBeDefined();
      expect(sidebarInstance.links.length).toBe(6);
    });

    it('should include all required navigation routes', () => {
      const routes = component.sidebarLinks.map(link => link.route);
      
      expect(routes).toContain('/dashboard');
      expect(routes).toContain('/vault');
      expect(routes).toContain('/order-history');
      expect(routes).toContain('/payments');
      expect(routes).toContain('/addresses');
      expect(routes).toContain('/settings');
    });

    it('should include icons for all navigation links', () => {
      const icons = component.sidebarLinks.map(link => link.icon);
      
      expect(icons).toContain('dashboard');
      expect(icons).toContain('lock');
      expect(icons).toContain('history');
      expect(icons).toContain('payments');
      expect(icons).toContain('home_pin');
      expect(icons).toContain('settings');
    });

    it('should include proper labels for all navigation links', () => {
      const labels = component.sidebarLinks.map(link => link.label);
      
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Vault');
      expect(labels).toContain('History');
      expect(labels).toContain('Payments');
      expect(labels).toContain('Addresses');
      expect(labels).toContain('Settings');
    });
  });

  describe('Requirement: Ensure sidebar toggle works on mobile', () => {
    it('should have sidebar component with toggle functionality', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      expect(sidebarInstance.toggleSidebar).toBeDefined();
      expect(typeof sidebarInstance.toggleSidebar).toBe('function');
    });

    it('should have isOpen signal in sidebar component', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      expect(sidebarInstance.isOpen).toBeDefined();
      expect(typeof sidebarInstance.isOpen).toBe('function');
    });

    it('should have isMobile computed signal in sidebar component', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      expect(sidebarInstance.isMobile).toBeDefined();
      expect(typeof sidebarInstance.isMobile).toBe('function');
    });

    it('should have closeSidebar method for mobile overlay', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      expect(sidebarInstance.closeSidebar).toBeDefined();
      expect(typeof sidebarInstance.closeSidebar).toBe('function');
    });
  });

  describe('Requirements 3.1, 3.2, 3.3, 3.4 Compliance', () => {
    it('should integrate with ResponsiveService for viewport detection', () => {
      const responsiveService = TestBed.inject(ResponsiveService);
      
      expect(responsiveService).toBeDefined();
      expect(responsiveService.isMobile).toBeDefined();
      expect(responsiveService.isTablet).toBeDefined();
      expect(responsiveService.isDesktop).toBeDefined();
    });

    it('should have sidebar component that responds to viewport changes', () => {
      const sidebarDebugElement = fixture.debugElement.query(By.directive(Sidebar));
      const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;
      
      // Sidebar should have access to ResponsiveService
      expect(sidebarInstance.isMobile).toBeDefined();
    });
  });

  describe('Integration Verification', () => {
    it('should render complete dashboard with integrated sidebar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should have navbar
      expect(compiled.querySelector('app-navbar')).toBeTruthy();
      
      // Should have sidebar component
      expect(compiled.querySelector('app-sidebar')).toBeTruthy();
      
      // Should have main content
      expect(compiled.querySelector('.dash-main')).toBeTruthy();
    });

    it('should maintain dashboard layout structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const dashBody = compiled.querySelector('.dash-body');
      
      expect(dashBody).toBeTruthy();
      
      // Sidebar should be within dash-body
      const sidebar = dashBody?.querySelector('app-sidebar');
      expect(sidebar).toBeTruthy();
      
      // Main content should be within dash-body
      const main = dashBody?.querySelector('.dash-main');
      expect(main).toBeTruthy();
    });
  });
});
