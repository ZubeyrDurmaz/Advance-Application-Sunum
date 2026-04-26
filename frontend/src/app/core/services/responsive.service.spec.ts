import { TestBed } from '@angular/core/testing';
import { ResponsiveService } from './responsive.service';

describe('ResponsiveService', () => {
  let service: ResponsiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Breakpoint Detection', () => {
    it('should detect mobile viewport (<768px)', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      // Create new service instance to pick up the mocked width
      service = new ResponsiveService();

      expect(service.isMobile()).toBe(true);
      expect(service.isTablet()).toBe(false);
      expect(service.isDesktop()).toBe(false);
      expect(service.matchesBreakpoint('mobile')).toBe(true);
    });

    it('should detect tablet viewport (768px-1023px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });

      service = new ResponsiveService();

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(true);
      expect(service.isDesktop()).toBe(false);
      expect(service.matchesBreakpoint('tablet')).toBe(true);
    });

    it('should detect desktop viewport (≥1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });

      service = new ResponsiveService();

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(false);
      expect(service.isDesktop()).toBe(true);
      expect(service.matchesBreakpoint('desktop')).toBe(true);
    });

    it('should handle edge case at 768px (tablet boundary)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      service = new ResponsiveService();

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(true);
      expect(service.isDesktop()).toBe(false);
    });

    it('should handle edge case at 1024px (desktop boundary)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      service = new ResponsiveService();

      expect(service.isMobile()).toBe(false);
      expect(service.isTablet()).toBe(false);
      expect(service.isDesktop()).toBe(true);
    });
  });

  describe('getViewportWidth', () => {
    it('should return current viewport width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      service = new ResponsiveService();

      expect(service.getViewportWidth()).toBe(1200);
    });
  });

  describe('matchesBreakpoint', () => {
    it('should return correct boolean for each breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      service = new ResponsiveService();

      expect(service.matchesBreakpoint('mobile')).toBe(true);
      expect(service.matchesBreakpoint('tablet')).toBe(false);
      expect(service.matchesBreakpoint('desktop')).toBe(false);
    });
  });

  describe('Resize Handling', () => {
    it('should update viewport width on window resize', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      service = new ResponsiveService();

      expect(service.isMobile()).toBe(true);

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });

      window.dispatchEvent(new Event('resize'));

      // Wait for debounce (150ms) + buffer
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(service.isDesktop()).toBe(true);
      expect(service.isMobile()).toBe(false);
    });
  });
});
