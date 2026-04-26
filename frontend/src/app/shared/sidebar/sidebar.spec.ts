import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar, SidebarLink } from './sidebar';
import { ResponsiveService } from '../../core/services/responsive.service';
import { provideRouter } from '@angular/router';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockResponsiveService: ResponsiveService;

  const mockLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Profile', route: '/profile', icon: '👤' },
    { label: 'Settings', route: '/settings', icon: '⚙️' },
  ];

  beforeEach(async () => {
    // Mock window.innerWidth for desktop viewport by default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Desktop viewport
    });

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        ResponsiveService,
        provideRouter([]),
      ],
    }).compileComponents();

    mockResponsiveService = TestBed.inject(ResponsiveService);
    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    component.links = mockLinks;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isOpen as false', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should accept navigation links as input', () => {
    expect(component.links).toEqual(mockLinks);
    expect(component.links.length).toBe(3);
  });

  describe('toggleSidebar', () => {
    it('should toggle isOpen when on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375 // Mobile viewport
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
      
      component.toggleSidebar();
      expect(component.isOpen()).toBe(true);
      
      component.toggleSidebar();
      expect(component.isOpen()).toBe(false);
    });

    it('should prevent body scroll when sidebar is open on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      component.toggleSidebar();
      expect(document.body.style.overflow).toBe('hidden');

      component.toggleSidebar();
      expect(document.body.style.overflow).toBe('');
    });

    it('should not toggle when on desktop', () => {
      // Desktop viewport (1024px by default)
      expect(component.isOpen()).toBe(false);
      
      component.toggleSidebar();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('closeSidebar', () => {
    it('should close sidebar when on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      component.isOpen.set(true);
      expect(component.isOpen()).toBe(true);

      component.closeSidebar();
      expect(component.isOpen()).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should not affect sidebar state on desktop', () => {
      // Desktop viewport
      component.isOpen.set(true);
      
      component.closeSidebar();
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('viewport change effect', () => {
    it('should auto-close sidebar when resizing from mobile to desktop', async () => {
      // Start with mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      // Open sidebar on mobile
      component.toggleSidebar();
      expect(component.isOpen()).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      // Sidebar should auto-close
      expect(component.isOpen()).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('template rendering', () => {
    it('should render navigation links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('.sidebar-link');
      
      expect(links.length).toBe(3);
      expect(links[0].textContent?.trim()).toContain('Dashboard');
      expect(links[1].textContent?.trim()).toContain('Profile');
      expect(links[2].textContent?.trim()).toContain('Settings');
    });

    it('should render icons when provided', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icons = compiled.querySelectorAll('.sidebar-icon');
      
      // Only 2 links have icons
      expect(icons.length).toBe(2);
      expect(icons[0].textContent).toBe('👤');
      expect(icons[1].textContent).toBe('⚙️');
    });

    it('should show toggle button on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.sidebar-toggle');
      
      expect(toggleButton).toBeTruthy();
    });

    it('should not show toggle button on desktop', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.sidebar-toggle');
      
      expect(toggleButton).toBeFalsy();
    });

    it('should show overlay when sidebar is open on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      component.isOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.sidebar-overlay');
      
      expect(overlay).toBeTruthy();
    });

    it('should apply open class when sidebar is open on mobile', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 200));
      fixture.detectChanges();

      component.isOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const sidebar = compiled.querySelector('.sidebar');
      
      expect(sidebar).toBeTruthy();
      expect(sidebar?.classList.contains('open')).toBe(true);
    });
  });
});
